import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const script = path.join(root, "scripts/live-compare-gate.sh");
const SKIP_LINE =
  "SeatTruth schedule skipped: SEATTRUTH_MAPPING_YAML is unset. Live compare did not run. No provider, database, or Slack calls. This is not an all-clear.";

const CANARY_ENV = {
  STRIPE_RESTRICTED_KEY: "rk_test_CANARY_SHOULD_NOT_PRINT",
  POLAR_RESTRICTED_TOKEN: "polar_oat_CANARY_SHOULD_NOT_PRINT",
  PRODUCT_DATABASE_URL: "postgres://seattruth_readonly:CANARY_SHOULD_NOT_PRINT@db.example:5432/app",
  SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/CANARY/CANARY/CANARY",
};

function runGate(env: NodeJS.ProcessEnv): {
  status: number | null;
  stdout: string;
  stderr: string;
  dir: string;
} {
  const dir = mkdtempSync(path.join(tmpdir(), "seattruth-gate-"));
  const result = spawnSync("bash", [script], {
    cwd: dir,
    env: {
      PATH: process.env.PATH,
      GITHUB_OUTPUT: path.join(dir, "github-output.txt"),
      ...env,
    },
    encoding: "utf8",
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    dir,
  };
}

function assertNoCanaries(text: string): void {
  assert.equal(text.includes("CANARY"), false);
  assert.equal(text.includes("rk_test_"), false);
  assert.equal(text.includes("polar_oat_"), false);
  assert.equal(text.includes("postgres://"), false);
  assert.equal(text.includes("hooks.slack.com"), false);
}

test("schedule with mapping unset exits 0 and does not compare", () => {
  const result = runGate({
    SEATTRUTH_EVENT_NAME: "schedule",
    SEATTRUTH_MAPPING_YAML: "",
    ...CANARY_ENV,
  });
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), SKIP_LINE);
  assert.match(result.stdout, /not an all-clear/i);
  assert.equal(result.stderr, "");
  assert.equal(existsSync(path.join(result.dir, "mapping.yaml")), false);
  assert.equal(readFileSync(path.join(result.dir, "github-output.txt"), "utf8").trim(), "skip=true");
  assertNoCanaries(result.stdout + result.stderr);
});

test("schedule with a blank mapping secret is the same skip", () => {
  const result = runGate({
    SEATTRUTH_EVENT_NAME: "schedule",
    SEATTRUTH_MAPPING_YAML: " \n\t",
  });
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), SKIP_LINE);
  assert.equal(existsSync(path.join(result.dir, "mapping.yaml")), false);
});

test("live dispatch with mapping unset exits 1 and does not skip", () => {
  const result = runGate({
    SEATTRUTH_EVENT_NAME: "workflow_dispatch",
    SEATTRUTH_MAPPING_YAML: "",
    ...CANARY_ENV,
  });
  assert.equal(result.status, 1);
  assert.equal(result.stdout.trim(), "Missing SEATTRUTH_MAPPING_YAML secret.");
  assert.equal(existsSync(path.join(result.dir, "mapping.yaml")), false);
  assert.equal(readFileSync(path.join(result.dir, "github-output.txt"), "utf8").trim(), "skip=false");
  assertNoCanaries(result.stdout + result.stderr);
});

test("a present mapping is written and other live secrets do not change the gate", () => {
  const mapping = "version: 1\nproduct:\n  schema: billing\n  relation: seats\n";
  for (const event of ["schedule", "workflow_dispatch"]) {
    const result = runGate({
      SEATTRUTH_EVENT_NAME: event,
      SEATTRUTH_MAPPING_YAML: mapping,
      PRODUCT_DATABASE_URL: "",
      STRIPE_RESTRICTED_KEY: "",
      POLAR_RESTRICTED_TOKEN: "",
      SLACK_WEBHOOK_URL: "",
    });
    assert.equal(result.status, 0, event);
    assert.equal(result.stdout, "", event);
    assert.equal(readFileSync(path.join(result.dir, "mapping.yaml"), "utf8"), `${mapping}\n`);
    assert.equal(readFileSync(path.join(result.dir, "github-output.txt"), "utf8").trim(), "skip=false");
    assert.equal(result.stdout.includes("billing"), false);
  }
});

test("an unknown event does not take the schedule skip", () => {
  const result = runGate({
    SEATTRUTH_EVENT_NAME: "",
    SEATTRUTH_MAPPING_YAML: "   ",
  });
  assert.equal(result.status, 1);
  assert.equal(result.stdout.trim(), "Missing SEATTRUTH_MAPPING_YAML secret.");
  assert.equal(existsSync(path.join(result.dir, "mapping.yaml")), false);
});

test("compare workflow keeps dry-run, fails closed on live dispatch, and has no secret values", () => {
  const workflow = readFileSync(path.join(root, ".github/workflows/compare.yml"), "utf8");
  const gate = readFileSync(script, "utf8");
  assert.match(workflow, /npm run compare -- --dry-run/);
  assert.match(workflow, /inputs\.dry_run != false/);
  assert.match(workflow, /inputs\.dry_run == false/);
  assert.match(workflow, /bash scripts\/live-compare-gate\.sh/);
  assert.match(workflow, /steps\.live_mapping\.outputs\.skip != 'true'/);
  assert.match(workflow, /success\(\)/);
  assert.match(workflow, /secrets\.SEATTRUTH_MAPPING_YAML/);
  assert.match(workflow, /secrets\.STRIPE_RESTRICTED_KEY/);
  assert.match(workflow, /secrets\.POLAR_RESTRICTED_TOKEN/);
  assert.match(workflow, /secrets\.PRODUCT_DATABASE_URL/);
  assert.match(workflow, /secrets\.SLACK_WEBHOOK_URL/);
  assert.match(gate, /\[\[ "\$event" == "schedule" \]\]/);
  for (const text of [workflow, gate]) {
    assert.doesNotMatch(text, /rk_live_/);
    assert.doesNotMatch(text, /rk_test_[A-Za-z0-9]/);
    assert.doesNotMatch(text, /sk_live_/);
    assert.doesNotMatch(text, /sk_test_/);
    assert.doesNotMatch(text, /polar_oat_/);
    assert.doesNotMatch(text, /postgres:\/\//);
    assert.doesNotMatch(text, /hooks\.slack\.com\/services\/[A-Za-z0-9]/);
  }
});

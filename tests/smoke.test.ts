import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { HELP, LIVE_ALL_CLEAR_TEXT, applyEnvText, liveExitCode, runCli } from "../src/cli.js";
import { compareReadOnly, runLiveCompare } from "../src/compare.js";
import { CONTRACT, BUILD } from "../src/invariants.js";
import * as api from "../src/index.js";
import * as productDb from "../src/productDb.js";
import * as polar from "../src/providers/polar.js";
import * as stripe from "../src/providers/stripe.js";
import * as slack from "../src/slack.js";
import type { FetchLike } from "../src/http.js";

const DENY =
  /charge|refund|write|fix|mutate|grant|revoke|upsert|delete|cancel|capture|invoice|checkout|payout|autofix|auto_fix/i;

const root = process.cwd();

function assertSurface(name: string, mod: object): void {
  for (const key of Object.keys(mod)) {
    assert.notEqual(key, "default", `${name} must not have a default export`);
    assert.doesNotMatch(key, DENY, `${name} exports forbidden API ${key}`);
  }
}

test("public modules export no charge, write, or fix APIs", () => {
  assertSurface("index", api);
  assertSurface("stripe", stripe);
  assertSurface("polar", polar);
  assertSurface("productDb", productDb);
  assertSurface("slack", slack);
  assert.equal(CONTRACT.readOnly, true);
  assert.equal(CONTRACT.charges, false);
  assert.equal(CONTRACT.writesProviders, false);
  assert.equal(CONTRACT.mutatesEntitlements, false);
  assert.equal(CONTRACT.autoFixes, false);
  assert.equal(Object.isFrozen(CONTRACT), true);
  assert.equal(BUILD.detectorImplemented, true);
  assert.equal(BUILD.performsNetworkReads, true);
  assert.equal(BUILD.postsToSlack, true);
});

test("dry-run does not call the network and is not an all-clear", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (() => {
    throw new Error("network");
  }) as typeof fetch;
  try {
    const result = await compareReadOnly();
    assert.equal(result.implemented, true);
    assert.equal(result.allClear, false);
    assert.equal(result.mode, "dry-run");
    assert.deepEqual(result.findings, []);
    assert.equal(result.unclassifiedUsers, 0);
    assert.equal(result.deliberateSkipUsers, 0);
    assert.equal(await runCli(["--dry-run"]), 0);
    assert.equal(await runCli([]), 0);
  } finally {
    globalThis.fetch = original;
  }

  const alert = slack.buildSlackAlert({
    implemented: true,
    allClear: false,
    mode: "dry-run",
    findings: [],
    unclassifiedUsers: 0,
    deliberateSkipUsers: 0,
    errors: [],
  });
  assert.match(alert.text, /not an all-clear/i);
  assert.match(alert.text, /No entitlement changes/);
  assert.doesNotMatch(alert.text, /set is_pro/i);
  assert.doesNotMatch(alert.text, /should have access/i);
  assert.doesNotMatch(alert.text, /should lose access/i);
});

test("live Slack text names the disagreement and posts only that text", async () => {
  const alert = slack.buildSlackAlert({
    implemented: true,
    allClear: false,
    mode: "live",
    findings: [
      {
        detectCase: "paid_locked_out",
        productUserId: "user-1",
        provider: "stripe",
        providerCustomerId: "cus_1",
        providerSubscriptionId: "sub_1",
        productIsPro: false,
        productSeats: null,
      },
    ],
    unclassifiedUsers: 2,
    deliberateSkipUsers: 4,
    errors: ["duplicate_customer_id:stripe:cus_dup"],
  });
  assert.match(alert.text, /paid_locked_out/);
  assert.match(alert.text, /user=user-1/);
  assert.match(alert.text, /ambiguous_users=2/);
  assert.doesNotMatch(alert.text, /deliberateSkip|user-skip/i);
  assert.doesNotMatch(alert.text, /set is_pro/i);
  assert.doesNotMatch(alert.text, /\bUPDATE\b/);
  assert.doesNotMatch(alert.text, /@/);

  let posted = "";
  const fetchImpl: FetchLike = async (url, init) => {
    assert.equal(init?.method, "POST");
    assert.equal(init?.redirect, "error");
    assert.match(String(url), /^https:\/\/hooks\.slack\.com\//);
    posted = String(init?.body);
    return new Response("ok", { status: 200 });
  };
  await slack.deliverSlackAlert(alert, "https://hooks.slack.com/services/REPLACE/REPLACE/REPLACE", fetchImpl);
  assert.match(posted, /paid_locked_out/);
  assert.doesNotMatch(posted, /REPLACE/);

  let leaked = false;
  const refuse: FetchLike = async () => {
    leaked = true;
    return new Response("ok", { status: 200 });
  };
  await assert.rejects(
    () => slack.deliverSlackAlert(alert, "https://example.com/hook", refuse),
    (error: unknown) => error instanceof Error && error.message === "slack_webhook_refused"
  );
  assert.equal(leaked, false);

  await assert.rejects(
    () =>
      slack.deliverSlackAlert(
        alert,
        "https://user:token@hooks.slack.com/services/REPLACE/REPLACE/REPLACE",
        refuse
      ),
    (error: unknown) => error instanceof Error && error.message === "slack_webhook_refused"
  );
  assert.equal(leaked, false);

  await assert.rejects(
    () =>
      slack.deliverSlackAlert(alert, "https://hooks.slack.com/services/SECRET", async () => {
        throw new Error("connect failed https://hooks.slack.com/services/SECRET");
      }),
    (error: unknown) => error instanceof Error && error.message === "slack_http_0"
  );

  const mixed = slack.buildSlackAlert({
    implemented: true,
    allClear: false,
    mode: "live",
    findings: [
      {
        detectCase: "paid_locked_out",
        productUserId: "person@example.com",
        provider: "stripe",
        providerCustomerId: "cus_1",
        providerSubscriptionId: "sub_1",
        productIsPro: false,
        productSeats: 1,
      },
      {
        detectCase: "canceled_still_entitled",
        productUserId: "user-2",
        provider: "polar",
        providerCustomerId: "cus_2",
        providerSubscriptionId: "sub_2",
        productIsPro: true,
        productSeats: 0,
      },
    ],
    unclassifiedUsers: 0,
    deliberateSkipUsers: 0,
    errors: ["duplicate_customer_id:stripe:other@example.com"],
  });
  assert.match(mixed.text, /canceled_still_entitled/);
  assert.match(mixed.text, /user=user-2/);
  assert.match(mixed.text, /slack_field_refused/);
  assert.doesNotMatch(mixed.text, /@/);
  assert.doesNotMatch(mixed.text, /example\.com/);

  const clear = slack.buildSlackAlert({
    implemented: true,
    allClear: true,
    mode: "live",
    findings: [],
    unclassifiedUsers: 0,
    deliberateSkipUsers: 3,
    errors: [],
  });
  assert.equal(clear.text, "");
  assert.equal(slack.slackNeeded({
    implemented: true,
    allClear: true,
    mode: "live",
    findings: [],
    unclassifiedUsers: 0,
    deliberateSkipUsers: 3,
    errors: [],
  }), false);
});

test("live exit codes follow allClear and unknown flags do not dry-run", async () => {
  assert.equal(liveExitCode(true, []), 0);
  assert.equal(liveExitCode(false, []), 2);
  assert.equal(liveExitCode(false, ["stripe_incomplete_read"]), 1);
  assert.equal(liveExitCode(true, ["compare_failed"]), 1);

  const errors: string[] = [];
  const original = console.error;
  console.error = (line?: unknown) => {
    errors.push(String(line));
  };
  const fetchOriginal = globalThis.fetch;
  let called = false;
  globalThis.fetch = (() => {
    called = true;
    throw new Error("network");
  }) as typeof fetch;
  try {
    assert.equal(await runCli(["--liv", "rk_live_SECRETVALUE"]), 1);
    assert.deepEqual(errors, ["unknown_argument"]);
    assert.equal(called, false);
  } finally {
    console.error = original;
    globalThis.fetch = fetchOriginal;
  }
});

test("CLI help stays free of checkout and live without config does not call the network", async () => {
  assert.equal(await runCli(["--help"]), 0);
  assert.match(HELP, /not an all-clear/i);
  assert.doesNotMatch(HELP, /checkout/i);
  assert.equal(await runCli(["--live", "--dry-run"]), 1);

  const previous = {
    STRIPE_RESTRICTED_KEY: process.env.STRIPE_RESTRICTED_KEY,
    POLAR_RESTRICTED_TOKEN: process.env.POLAR_RESTRICTED_TOKEN,
    PRODUCT_DATABASE_URL: process.env.PRODUCT_DATABASE_URL,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    SEATTRUTH_MAPPING_PATH: process.env.SEATTRUTH_MAPPING_PATH,
  };
  delete process.env.STRIPE_RESTRICTED_KEY;
  delete process.env.POLAR_RESTRICTED_TOKEN;
  delete process.env.PRODUCT_DATABASE_URL;
  delete process.env.SLACK_WEBHOOK_URL;
  delete process.env.SEATTRUTH_MAPPING_PATH;
  const original = globalThis.fetch;
  globalThis.fetch = (() => {
    throw new Error("network");
  }) as typeof fetch;
  try {
    assert.equal(await runCli(["--live"]), 1);
  } finally {
    globalThis.fetch = original;
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
});

test("a missing mapping file and a database failure stay coded and do not echo secrets", async () => {
  let called = false;
  const fetchImpl: FetchLike = async () => {
    called = true;
    throw new Error("network");
  };
  const missing = await runLiveCompare({
    stripeKey: "rk_test_REPLACE_ME",
    polarToken: "polar_oat_REPLACE_ME",
    databaseUrl: "postgres://db.example/app",
    mappingPath: "/tmp/seattruth-missing-mapping.yaml",
    fetchImpl,
  });
  assert.deepEqual(missing.errors, ["mapping_unreadable"]);
  assert.equal(missing.allClear, false);
  assert.equal(JSON.stringify(missing).includes("seattruth-missing"), false);
  assert.equal(called, false);

  const dir = mkdtempSync(path.join(tmpdir(), "seattruth-"));
  const badPath = path.join(dir, "bad.yaml");
  writeFileSync(badPath, "version: [\n");
  const bad = await runLiveCompare({
    stripeKey: "rk_test_REPLACE_ME",
    polarToken: "polar_oat_REPLACE_ME",
    databaseUrl: "postgres://db.example/app",
    mappingPath: badPath,
    fetchImpl,
  });
  assert.deepEqual(bad.errors, ["mapping_unreadable"]);
  assert.equal(JSON.stringify(bad).includes("version"), false);

  const query = await runLiveCompare({
    stripeKey: "rk_test_REPLACE_ME",
    polarToken: "polar_oat_REPLACE_ME",
    databaseUrl: "postgres://secret:secret@db.example/app",
    mappingPath: path.join(root, "mapping.example.yaml"),
    fetchImpl,
    readRows: async () => {
      throw new Error("password authentication failed postgres://secret");
    },
  });
  assert.deepEqual(query.errors, ["product_query_failed"]);
  assert.equal(JSON.stringify(query).includes("secret"), false);
  assert.equal(called, false);
});

test("env export lines are read and the local all-clear is not a certification", () => {
  const env: NodeJS.ProcessEnv = {};
  applyEnvText('export STRIPE_RESTRICTED_KEY=rk_test_from_env\n# comment\nPOLAR_RESTRICTED_TOKEN=already\n', env);
  assert.equal(env.STRIPE_RESTRICTED_KEY, "rk_test_from_env");
  applyEnvText("export POLAR_RESTRICTED_TOKEN=second\n", env);
  assert.equal(env.POLAR_RESTRICTED_TOKEN, "already");
  assert.match(LIVE_ALL_CLEAR_TEXT, /Slack was not posted/);
  assert.match(LIVE_ALL_CLEAR_TEXT, /not a certification/);
  assert.match(LIVE_ALL_CLEAR_TEXT, /empty relation/);
  assert.doesNotMatch(LIVE_ALL_CLEAR_TEXT, /set is_pro/i);
  assert.doesNotMatch(LIVE_ALL_CLEAR_TEXT, /\bUPDATE\b/);
  assert.doesNotMatch(LIVE_ALL_CLEAR_TEXT, /should have access/i);
});

test("committed examples contain placeholders and no live secrets", () => {
  const env = readFileSync(path.join(root, ".env.example"), "utf8");
  assert.match(env, /REPLACE_ME/);
  assert.match(env, /STRIPE_RESTRICTED_KEY/);
  assert.match(env, /POLAR_RESTRICTED_TOKEN/);
  assert.match(env, /subscriptions:read/);
  assert.match(env, /PRODUCT_DATABASE_URL/);
  assert.match(env, /SLACK_WEBHOOK_URL/);
  assert.match(env, /SEATTRUTH_MAPPING_PATH/);
  assert.doesNotMatch(env, /sk_live_[A-Za-z0-9]{8,}/);
  assert.doesNotMatch(env, /rk_live_[A-Za-z0-9]{16,}/);
  assert.doesNotMatch(env, /sk_test_[A-Za-z0-9]{16,}/);
  assert.doesNotMatch(env, /buy\.polar\.sh/i);

  const mapping = readFileSync(path.join(root, "mapping.example.yaml"), "utf8");
  assert.match(mapping, /engine:\s*postgres/);
  assert.match(mapping, /schema:\s*billing/);
  assert.match(mapping, /field:\s*is_pro/);
  assert.match(mapping, /seats:/);
  assert.doesNotMatch(mapping, /\bUPDATE\b/);
  assert.doesNotMatch(mapping, /\bINSERT\b/);
  assert.doesNotMatch(mapping, /\bDELETE\b/);

  const readme = readFileSync(path.join(root, "README.md"), "utf8");
  assert.match(readme, /read-only/i);
  assert.match(readme, /auto-fix/i);
  assert.match(readme, /Soft-WTP|cold invoices/);
  assert.match(readme, /hello@yellowgram\.dev/);
  assert.match(readme, /www\.yellowgram\.dev/);
  assert.doesNotMatch(readme, /buy\.polar\.sh/i);
});

const POLYFORM_NC_BODY_SHA256 =
  "ffcca38841adb694b6f380647e15f17c446a4d1656fed51a1e2041d064c94cc8";
const LICENSE_SHA256 =
  "a2ea7ebf20864cc635b26d396e1f830203a155dda4a7f8d213e696deb0fbe580";
const COMMERCIAL_GRANT_SHA256 =
  "afcad55c0e520f75828636cf0ef7c85d0e9ce65f2ccc9541fbf915fc18edce3b";
const V010_ZIP_SHA256 =
  "abda9333e0ac6b2af3ff71439b0f275f8bcf7aff2fefb99b8d9d0b0870eccb2b";

test("0.1.1 pack script, Polar packet, and checksum match the zip", () => {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as {
    version: string;
    private: boolean;
    license: string;
  };
  assert.equal(pkg.version, "0.1.1");
  assert.equal(pkg.private, true);
  assert.equal(pkg.license, "LicenseRef-PolyForm-Noncommercial-1.0.0");
  assert.notEqual(pkg.license, "MIT");
  assert.equal(existsSync(path.join(root, "scripts/pack-release.sh")), true);

  const licenseBytes = readFileSync(path.join(root, "LICENSE"));
  assert.equal(createHash("sha256").update(licenseBytes).digest("hex"), LICENSE_SHA256);
  const license = licenseBytes.toString("utf8");
  const marker = "# PolyForm Noncommercial License 1.0.0\n";
  const markerAt = license.indexOf(marker);
  assert.ok(markerAt > 0);
  const header = license.slice(0, markerAt);
  assert.match(header, /Required Notice: Copyright yellowgram \(https:\/\/www\.yellowgram\.dev\)/);
  assert.match(header, /hello@yellowgram\.dev/);
  assert.match(header, /www\.yellowgram\.dev/);
  assert.match(header, /docs\/COMMERCIAL_GRANT\.md/);
  assert.match(header, /source-available = true/);
  assert.match(header, /SeatTruth commercial grant/);
  assert.match(header, /Suthirth Solutions, operating as yellowgram/);
  const body = license.slice(markerAt);
  assert.equal(createHash("sha256").update(body).digest("hex"), POLYFORM_NC_BODY_SHA256);

  const grantBytes = readFileSync(path.join(root, "docs/COMMERCIAL_GRANT.md"));
  assert.equal(createHash("sha256").update(grantBytes).digest("hex"), COMMERCIAL_GRANT_SHA256);
  const grant = grantBytes.toString("utf8");
  assert.match(grant, /Suthirth Solutions, operating as yellowgram/);
  assert.match(grant, /\$99 once per organization/);
  assert.match(grant, /9aab6e67-3533-44d1-aa0b-bfdaf6dbc753/);
  assert.match(grant, /no included Issues SLA/);
  assert.match(grant, /Soft-WTP/);
  assert.doesNotMatch(grant, /buy\.polar\.sh/i);

  const polar = readFileSync(path.join(root, "docs/POLAR_DELIVERABLES.md"), "utf8");
  assert.match(polar, /go-live/);
  assert.match(polar, /\$99/);
  assert.match(polar, /\$79/);
  assert.match(polar, /14 days/);
  assert.match(polar, /Suthirth solutions/);
  assert.match(polar, /CHECKSUMS\.md/);
  assert.match(polar, /Soft-WTP/);
  assert.match(polar, /PolyForm Noncommercial/);
  assert.match(polar, /seattruth-0\.1\.0\.zip/);
  assert.match(polar, /v0\.1\.0/);
  assert.match(polar, /seattruth-0\.1\.1\.zip/);
  assert.match(polar, /v0\.1\.1/);
  assert.match(polar, /8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6/);
  assert.match(polar, /You run this/);
  assert.doesNotMatch(polar, /0\.1\.0 stays attached/);
  assert.doesNotMatch(polar, /Do not replace it from this pack/);
  assert.doesNotMatch(polar, /buy\.polar\.sh/i);
  assert.doesNotMatch(polar, /Not attached/);
  assert.doesNotMatch(polar, /does not change the product attachment/);
  assert.doesNotMatch(polar, /stays the file on the product/);

  const readme = readFileSync(path.join(root, "README.md"), "utf8");
  assert.match(readme, /source-available/);
  assert.match(readme, /PolyForm Noncommercial/);
  assert.match(readme, /not an OSI-approved license/);
  assert.match(readme, /You run this/);
  assert.match(readme, /does not operate a hosted endpoint/);
  assert.match(readme, /8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6/);
  assert.doesNotMatch(readme, /buy\.polar\.sh/i);
  assert.doesNotMatch(readme, /nothing to buy/i);
  assert.doesNotMatch(readme, /open[- ]source/i);
  assert.doesNotMatch(readme, /\bMIT\b/);
  assert.doesNotMatch(readme, /seattruth-x\.y\.z/);
  assert.doesNotMatch(readme, /remains the Polar attachment/);
  assert.doesNotMatch(readme, /remains the file attached/);

  const priorZip = path.join(root, "release/seattruth-0.1.0.zip");
  const priorHex = createHash("sha256").update(readFileSync(priorZip)).digest("hex");
  assert.equal(priorHex, V010_ZIP_SHA256);
  const priorComment = execFileSync("unzip", ["-z", priorZip], { encoding: "utf8" });
  assert.match(priorComment, /seattruth-0\.1\.0/);

  const zipPath = path.join(root, "release/seattruth-0.1.1.zip");
  const hex = createHash("sha256").update(readFileSync(zipPath)).digest("hex");
  assert.match(hex, /^[0-9a-f]{64}$/);
  assert.notEqual(hex, priorHex);
  const checksums = readFileSync(path.join(root, "docs/CHECKSUMS.md"), "utf8");
  assert.match(checksums, new RegExp(hex));
  assert.match(checksums, new RegExp(priorHex));
  assert.equal(hex, "8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6");
  assert.match(polar, new RegExp(hex));
  assert.doesNotMatch(polar, new RegExp(priorHex));

  const changelog = readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
  assert.match(changelog, /founding \*\*\$79\*\* → \*\*\$99\*\*/);
  assert.doesNotMatch(changelog, /founding to standard/);

  const names = execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  assert.ok(names.some((name) => name.endsWith("/.env.example")));
  assert.ok(names.some((name) => name.endsWith("/mapping.example.yaml")));
  assert.ok(names.some((name) => name.endsWith("/LICENSE")));
  assert.ok(names.some((name) => name.endsWith("/docs/COMMERCIAL_GRANT.md")));
  for (const name of names) {
    assert.equal(name.includes("node_modules"), false, name);
    assert.equal(name.includes("CHECKSUMS.md"), false, name);
    assert.equal(name.includes("/release/"), false, name);
    assert.equal(/(^|\/)\.env$/.test(name), false, name);
    assert.equal(name.endsWith("/.env.local"), false, name);
    assert.equal(/(^|\/)mapping\.yaml$/.test(name), false, name);
  }

  const comment = execFileSync("unzip", ["-z", zipPath], { encoding: "utf8" });
  assert.match(comment, /seattruth-0\.1\.1/);
});

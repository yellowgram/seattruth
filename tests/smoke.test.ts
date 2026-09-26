import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { HELP, runCli } from "../src/cli.js";
import { compareReadOnly } from "../src/compare.js";
import { CONTRACT, BUILD, NotImplementedError } from "../src/invariants.js";
import * as api from "../src/index.js";
import * as productDb from "../src/productDb.js";
import * as polar from "../src/providers/polar.js";
import * as stripe from "../src/providers/stripe.js";
import * as slack from "../src/slack.js";

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
  assert.equal(BUILD.detectorImplemented, false);
  assert.equal(BUILD.performsNetworkReads, false);
  assert.equal(BUILD.postsToSlack, false);
});

test("provider and database stubs refuse work and do not claim a result", async () => {
  await assert.rejects(
    () => stripe.readStripeSnapshot({ restrictedKey: "" }),
    /Missing Stripe restricted key/
  );
  await assert.rejects(
    () => stripe.readStripeSnapshot({ restrictedKey: "sk_test_REPLACE_ME" }),
    /secret key/
  );
  await assert.rejects(
    () => stripe.readStripeSnapshot({ restrictedKey: "rk_test_REPLACE_ME" }),
    (error: unknown) => error instanceof NotImplementedError
  );
  await assert.rejects(
    () => polar.readPolarSnapshot({ restrictedToken: "polar_oat_REPLACE_ME" }),
    (error: unknown) => error instanceof NotImplementedError
  );
  await assert.rejects(
    () =>
      productDb.readProductRows({
        connectionString: "postgres://seattruth_readonly:REPLACE_ME@db.example/app",
        mappingPath: "mapping.example.yaml",
      }),
    (error: unknown) => error instanceof NotImplementedError
  );

  assert.doesNotMatch(stripe.readStripeSnapshot.toString(), /api\.stripe\.com/);
  assert.doesNotMatch(polar.readPolarSnapshot.toString(), /api\.polar\.sh/);
  assert.doesNotMatch(slack.deliverSlackAlert.toString(), /fetch\s*\(/);
});

test("dry-run compare is not an all-clear and Slack text does not prescribe a fix", async () => {
  const result = await compareReadOnly();
  assert.equal(result.implemented, false);
  assert.equal(result.allClear, false);
  assert.equal(result.mode, "dry-run");
  assert.deepEqual(result.findings, []);
  assert.ok(result.errors.includes("detector_not_implemented"));

  const alert = slack.buildSlackAlert(result);
  assert.match(alert.text, /not an all-clear/i);
  assert.match(alert.text, /No entitlement changes/);
  assert.doesNotMatch(alert.text, /is_pro\s*=\s*true/i);
  assert.doesNotMatch(alert.text, /set is_pro/i);

  assert.throws(
    () =>
      slack.buildSlackAlert({
        implemented: true,
        allClear: false,
        mode: "live",
        findings: [],
        errors: [],
      }),
    (error: unknown) => error instanceof NotImplementedError
  );
  await assert.rejects(
    () => slack.deliverSlackAlert(alert, "https://hooks.slack.com/services/REPLACE/REPLACE/REPLACE"),
    (error: unknown) => error instanceof NotImplementedError
  );
});

test("CLI defaults to dry-run and refuses live mode", async () => {
  assert.equal(await runCli(["--dry-run"]), 0);
  assert.equal(await runCli([]), 0);
  assert.equal(await runCli(["--live"]), 2);
  assert.equal(await runCli(["--help"]), 0);
  assert.match(HELP, /not implemented/i);
  assert.doesNotMatch(HELP, /checkout/i);
});

test("committed examples contain placeholders and no live secrets", () => {
  const env = readFileSync(path.join(root, ".env.example"), "utf8");
  assert.match(env, /REPLACE_ME/);
  assert.match(env, /STRIPE_RESTRICTED_KEY/);
  assert.match(env, /POLAR_RESTRICTED_TOKEN/);
  assert.match(env, /PRODUCT_DATABASE_URL/);
  assert.match(env, /SLACK_WEBHOOK_URL/);
  assert.match(env, /SEATTRUTH_MAPPING_PATH/);
  assert.doesNotMatch(env, /sk_live_[A-Za-z0-9]{8,}/);
  assert.doesNotMatch(env, /rk_live_[A-Za-z0-9]{16,}/);
  assert.doesNotMatch(env, /sk_test_[A-Za-z0-9]{16,}/);

  const mapping = readFileSync(path.join(root, "mapping.example.yaml"), "utf8");
  assert.match(mapping, /engine:\s*postgres/);
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

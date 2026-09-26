import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { HELP, runCli } from "../src/cli.js";
import { compareReadOnly } from "../src/compare.js";
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
    assert.match(String(url), /^https:\/\/hooks\.slack\.com\//);
    posted = String(init?.body);
    return new Response("ok", { status: 200 });
  };
  await slack.deliverSlackAlert(alert, "https://hooks.slack.com/services/REPLACE/REPLACE/REPLACE", fetchImpl);
  assert.match(posted, /paid_locked_out/);
  assert.doesNotMatch(posted, /REPLACE/);

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

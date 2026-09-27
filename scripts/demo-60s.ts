/**
 * Fixture-only 60-second dual-rail clip.
 *
 * Invented rows go through classifyStatus, compareSnapshots, and buildSlackAlert.
 * Dry-run text comes from dryRunResult. No Stripe, Polar, Slack, or database call.
 * Exit 1 if the wall clock reaches 60 seconds or a required proof line is missing.
 */

import { dryRunResult } from "../src/compare.js";
import { CONTRACT, assertDryRunResult } from "../src/invariants.js";
import type { ProductRow } from "../src/invariants.js";
import { classifyStatus, compareSnapshots } from "../src/rules.js";
import type { ClassifiedSubscription } from "../src/rules.js";
import { buildSlackAlert } from "../src/slack.js";

const WALL_LIMIT_MS = 60_000;

const REQUIRED_LINES = [
  "SeatTruth dry-run: detector is implemented. This is not an all-clear. No charges. No entitlement changes.",
  "SeatTruth paid_locked_out user=user-locked provider=stripe customer=cus_demo_locked subscription=sub_demo_locked is_pro=false seats=2",
  "SeatTruth canceled_still_entitled user=user-canceled provider=polar customer=cus_demo_canceled subscription=sub_demo_canceled is_pro=true seats=1",
  "SeatTruth silence on match: user=user-paid-match stripe=paid polar=paid is_pro=true no finding",
  "SeatTruth honesty: read-only compare. No charges. No auto-fix.",
] as const;

function row(input: ProductRow): ProductRow {
  return input;
}

function sub(
  provider: "stripe" | "polar",
  customerId: string,
  subscriptionId: string,
  status: "active" | "canceled"
): ClassifiedSubscription {
  return {
    provider,
    customerId,
    subscriptionId,
    bucket: classifyStatus(status, "none"),
  };
}

function silenceLine(
  rows: readonly ProductRow[],
  stripe: readonly ClassifiedSubscription[],
  polar: readonly ClassifiedSubscription[],
  findings: readonly { productUserId: string }[]
): string {
  const match = rows.find((item) => item.userId === "user-paid-match");
  if (!match || match.isPro !== true) {
    return "";
  }
  const stripePaid = stripe.some(
    (item) => item.customerId === match.stripeCustomerId && item.bucket === "paid"
  );
  const polarPaid = polar.some(
    (item) => item.customerId === match.polarCustomerId && item.bucket === "paid"
  );
  if (!stripePaid || !polarPaid) {
    return "";
  }
  if (findings.some((finding) => finding.productUserId === match.userId)) {
    return "";
  }
  return "SeatTruth silence on match: user=user-paid-match stripe=paid polar=paid is_pro=true no finding";
}

function honestyLine(): string {
  if (
    CONTRACT.readOnly &&
    !CONTRACT.charges &&
    !CONTRACT.autoFixes &&
    !CONTRACT.writesProviders &&
    !CONTRACT.mutatesEntitlements
  ) {
    return "SeatTruth honesty: read-only compare. No charges. No auto-fix.";
  }
  return "";
}

function refuseNetwork(): void {
  globalThis.fetch = (() => {
    throw new Error("demo_network_refused");
  }) as typeof fetch;
}

function runDemo(): number {
  refuseNetwork();

  const dry = dryRunResult();
  assertDryRunResult(dry);
  const dryText = buildSlackAlert(dry).text;

  const rows = [
    row({
      userId: "user-locked",
      isPro: false,
      seats: 2,
      stripeCustomerId: "cus_demo_locked",
      stripeSubscriptionId: "sub_demo_locked",
      polarCustomerId: "cus_demo_locked_polar",
      polarSubscriptionId: "sub_demo_locked_polar",
    }),
    row({
      userId: "user-canceled",
      isPro: true,
      seats: 1,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      polarCustomerId: "cus_demo_canceled",
      polarSubscriptionId: "sub_demo_canceled",
    }),
    row({
      userId: "user-paid-match",
      isPro: true,
      seats: 5,
      stripeCustomerId: "cus_demo_match",
      stripeSubscriptionId: "sub_demo_match",
      polarCustomerId: "cus_demo_match_polar",
      polarSubscriptionId: "sub_demo_match_polar",
    }),
  ];
  const stripe = [
    sub("stripe", "cus_demo_locked", "sub_demo_locked", "active"),
    sub("stripe", "cus_demo_match", "sub_demo_match", "active"),
  ];
  const polar = [
    sub("polar", "cus_demo_locked_polar", "sub_demo_locked_polar", "canceled"),
    sub("polar", "cus_demo_canceled", "sub_demo_canceled", "canceled"),
    sub("polar", "cus_demo_match_polar", "sub_demo_match_polar", "active"),
  ];

  const compared = compareSnapshots({
    rows,
    stripe,
    polar,
    stripeEnabled: true,
    polarEnabled: true,
  });
  const alertText = buildSlackAlert(compared).text;
  const findingLines = alertText === "" ? [] : alertText.split("\n");
  const silence = silenceLine(rows, stripe, polar, compared.findings);
  const honesty = honestyLine();
  const outputLines = [dryText, ...findingLines, silence, honesty];

  console.log(outputLines.filter((line) => line !== "").join("\n"));

  const elapsedMs = process.uptime() * 1000;
  const missing = REQUIRED_LINES.filter((line) => !outputLines.includes(line));
  const exact =
    outputLines.length === REQUIRED_LINES.length &&
    outputLines.every((line, index) => line === REQUIRED_LINES[index]);
  if (!exact || elapsedMs >= WALL_LIMIT_MS) {
    if (missing.length > 0) {
      console.error("demo:60s missing proof line");
      for (const line of missing) {
        console.error(line);
      }
    } else if (!exact) {
      console.error("demo:60s proof lines are out of order or include an extra line");
    }
    if (elapsedMs >= WALL_LIMIT_MS) {
      console.error(`demo:60s wall clock ${Math.round(elapsedMs)}ms`);
    }
    return 1;
  }
  return 0;
}

try {
  process.exitCode = runDemo();
} catch (error) {
  const message = error instanceof Error ? error.message : "demo_failed";
  console.error(message);
  process.exitCode = 1;
}

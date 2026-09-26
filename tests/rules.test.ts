import assert from "node:assert/strict";
import test from "node:test";

import type { ProductRow } from "../src/invariants.js";
import { classifyStatus, compareSnapshots, rollupRail } from "../src/rules.js";
import type { ClassifiedSubscription } from "../src/rules.js";

function row(partial: Partial<ProductRow> & Pick<ProductRow, "userId">): ProductRow {
  return {
    userId: partial.userId,
    isPro: partial.isPro === undefined ? false : partial.isPro,
    seats: partial.seats === undefined ? 1 : partial.seats,
    stripeCustomerId: partial.stripeCustomerId === undefined ? null : partial.stripeCustomerId,
    stripeSubscriptionId: partial.stripeSubscriptionId ?? null,
    polarCustomerId: partial.polarCustomerId === undefined ? null : partial.polarCustomerId,
    polarSubscriptionId: partial.polarSubscriptionId ?? null,
  };
}

function sub(
  provider: "stripe" | "polar",
  customerId: string,
  subscriptionId: string,
  bucket: ClassifiedSubscription["bucket"]
): ClassifiedSubscription {
  return { provider, customerId, subscriptionId, bucket };
}

test("P26 status map ignores cancel_at_period_end and does not treat a Polar refund as canceled", () => {
  assert.equal(classifyStatus("active", "none"), "paid");
  assert.equal(classifyStatus("active", "refund"), "ambiguous");
  assert.equal(classifyStatus("active", "unknown"), "ambiguous");
  assert.equal(classifyStatus("canceled", "none"), "canceled");
  assert.equal(classifyStatus("canceled", "refund"), "canceled");
  assert.equal(classifyStatus("trialing", "none"), "deliberate_skip");
  assert.equal(classifyStatus("incomplete", "none"), "deliberate_skip");
  assert.equal(classifyStatus("incomplete_expired", "none"), "deliberate_skip");
  assert.equal(classifyStatus("past_due", "none"), "ambiguous");
  assert.equal(classifyStatus("paused", "none"), "ambiguous");
  assert.equal(classifyStatus("unpaid", "none"), "ambiguous");
  assert.equal(classifyStatus("subscription.revoked", "none"), "ambiguous");
  assert.equal(classifyStatus("refunded", "none"), "ambiguous");
});

test("P28 same-rail rollup lets paid win and treats a mixed skip plus cancel as ambiguous", () => {
  assert.equal(rollupRail([]), "ambiguous");
  assert.equal(rollupRail(["paid", "ambiguous"]), "paid");
  assert.equal(rollupRail(["deliberate_skip", "canceled"]), "ambiguous");
  assert.equal(rollupRail(["deliberate_skip", "deliberate_skip"]), "deliberate_skip");
  assert.equal(rollupRail(["canceled", "canceled"]), "canceled");
});

test("P28 cross-rail edges", () => {
  const stripeOnly = { stripeEnabled: true, polarEnabled: false };
  const both = { stripeEnabled: true, polarEnabled: true };

  const paidSkip = compareSnapshots({
    ...both,
    rows: [row({ userId: "u1", isPro: false, seats: 3, stripeCustomerId: "cus_s", polarCustomerId: "cus_p" })],
    stripe: [sub("stripe", "cus_s", "sub_paid", "paid")],
    polar: [sub("polar", "cus_p", "sub_trial", "deliberate_skip")],
  });
  assert.equal(paidSkip.findings.length, 1);
  assert.equal(paidSkip.findings[0]?.detectCase, "paid_locked_out");
  assert.equal(paidSkip.findings[0]?.provider, "stripe");
  assert.equal(paidSkip.findings[0]?.productSeats, 3);
  assert.equal(paidSkip.unclassifiedUsers, 0);
  assert.equal(paidSkip.deliberateSkipUsers, 0);

  const paidCanceledLocked = compareSnapshots({
    ...both,
    rows: [row({ userId: "u2", isPro: false, seats: 0, stripeCustomerId: "cus_s", polarCustomerId: "cus_p" })],
    stripe: [sub("stripe", "cus_s", "sub_paid", "paid")],
    polar: [sub("polar", "cus_p", "sub_can", "canceled")],
  });
  assert.deepEqual(
    paidCanceledLocked.findings.map((finding) => finding.detectCase),
    ["paid_locked_out"]
  );
  assert.equal(paidCanceledLocked.findings[0]?.provider, "stripe");

  const paidCanceledEntitled = compareSnapshots({
    ...both,
    rows: [row({ userId: "u3", isPro: true, stripeCustomerId: "cus_s", polarCustomerId: "cus_p" })],
    stripe: [sub("stripe", "cus_s", "sub_paid", "paid")],
    polar: [sub("polar", "cus_p", "sub_can", "canceled")],
  });
  assert.equal(paidCanceledEntitled.findings.length, 0);
  assert.equal(paidCanceledEntitled.unclassifiedUsers, 0);
  assert.equal(paidCanceledEntitled.deliberateSkipUsers, 0);
  assert.equal(paidCanceledEntitled.allClear, true);

  const paidAmbiguous = compareSnapshots({
    ...both,
    rows: [row({ userId: "u4", isPro: false, stripeCustomerId: "cus_s", polarCustomerId: "cus_p" })],
    stripe: [sub("stripe", "cus_s", "sub_paid", "paid")],
    polar: [sub("polar", "cus_p", "sub_due", "ambiguous")],
  });
  assert.equal(paidAmbiguous.findings.length, 0);
  assert.equal(paidAmbiguous.unclassifiedUsers, 1);
  assert.equal(paidAmbiguous.allClear, false);

  const canceledSkip = compareSnapshots({
    ...both,
    rows: [row({ userId: "u5", isPro: true, stripeCustomerId: "cus_s", polarCustomerId: "cus_p" })],
    stripe: [sub("stripe", "cus_s", "sub_can", "canceled")],
    polar: [sub("polar", "cus_p", "sub_trial", "deliberate_skip")],
  });
  assert.equal(canceledSkip.findings.length, 0);
  assert.equal(canceledSkip.deliberateSkipUsers, 1);
  assert.equal(canceledSkip.unclassifiedUsers, 0);
  assert.equal(canceledSkip.allClear, true);

  const allCanceled = compareSnapshots({
    ...both,
    rows: [row({ userId: "u6", isPro: true, seats: 2, stripeCustomerId: "cus_s", polarCustomerId: "cus_p" })],
    stripe: [sub("stripe", "cus_s", "sub_b", "canceled"), sub("stripe", "cus_s", "sub_a", "canceled")],
    polar: [sub("polar", "cus_p", "psub", "canceled")],
  });
  assert.equal(allCanceled.findings.length, 2);
  assert.ok(allCanceled.findings.every((finding) => finding.detectCase === "canceled_still_entitled"));
  assert.equal(allCanceled.findings.find((finding) => finding.provider === "stripe")?.providerSubscriptionId, "sub_a");

  const zeroSubs = compareSnapshots({
    ...stripeOnly,
    rows: [row({ userId: "u7", isPro: false, seats: null, stripeCustomerId: "cus_missing" })],
    stripe: [],
    polar: [],
  });
  assert.equal(zeroSubs.findings.length, 0);
  assert.equal(zeroSubs.unclassifiedUsers, 1);

  const trialOnly = compareSnapshots({
    ...stripeOnly,
    rows: [row({ userId: "u8", isPro: false, seats: 0, stripeCustomerId: "cus_trial" })],
    stripe: [sub("stripe", "cus_trial", "sub_trial", "deliberate_skip")],
    polar: [],
  });
  assert.equal(trialOnly.findings.length, 0);
  assert.equal(trialOnly.deliberateSkipUsers, 1);
  assert.equal(trialOnly.allClear, true);

  const nullIds = compareSnapshots({
    ...both,
    rows: [row({ userId: "u9", isPro: true, stripeCustomerId: null, polarCustomerId: null })],
    stripe: [],
    polar: [],
  });
  assert.equal(nullIds.findings.length, 0);
  assert.equal(nullIds.unclassifiedUsers, 0);
  assert.equal(nullIds.deliberateSkipUsers, 0);
  assert.equal(nullIds.allClear, true);

  const seatsDoNotBlock = compareSnapshots({
    ...stripeOnly,
    rows: [row({ userId: "u10", isPro: false, seats: 5, stripeCustomerId: "cus_s" })],
    stripe: [sub("stripe", "cus_s", "sub_paid", "paid")],
    polar: [],
  });
  assert.equal(seatsDoNotBlock.findings.length, 1);
  assert.equal(seatsDoNotBlock.findings[0]?.detectCase, "paid_locked_out");
  assert.equal(seatsDoNotBlock.findings[0]?.productSeats, 5);

  const nonBoolean = compareSnapshots({
    ...stripeOnly,
    rows: [row({ userId: "u11", isPro: null, stripeCustomerId: "cus_s" })],
    stripe: [sub("stripe", "cus_s", "sub_paid", "paid")],
    polar: [],
  });
  assert.equal(nonBoolean.findings.length, 0);
  assert.equal(nonBoolean.unclassifiedUsers, 1);

  const productSubIdDoesNotFilter = compareSnapshots({
    ...stripeOnly,
    rows: [
      row({
        userId: "u12",
        isPro: false,
        stripeCustomerId: "cus_s",
        stripeSubscriptionId: "sub_old_canceled",
      }),
    ],
    stripe: [
      sub("stripe", "cus_s", "sub_old_canceled", "canceled"),
      sub("stripe", "cus_s", "sub_addon", "paid"),
    ],
    polar: [],
  });
  assert.equal(productSubIdDoesNotFilter.findings.length, 1);
  assert.equal(productSubIdDoesNotFilter.findings[0]?.providerSubscriptionId, "sub_addon");
});

test("P17 duplicate customer ids exclude those users only", () => {
  const result = compareSnapshots({
    stripeEnabled: true,
    polarEnabled: false,
    rows: [
      row({ userId: "dup-a", isPro: false, stripeCustomerId: "cus_dup" }),
      row({ userId: "dup-b", isPro: true, stripeCustomerId: "cus_dup" }),
      row({ userId: "other", isPro: false, stripeCustomerId: "cus_ok" }),
    ],
    stripe: [
      sub("stripe", "cus_dup", "sub_dup", "paid"),
      sub("stripe", "cus_ok", "sub_ok", "paid"),
    ],
    polar: [],
  });
  assert.deepEqual(
    result.findings.map((finding) => finding.productUserId),
    ["other"]
  );
  assert.ok(result.errors.some((error) => error === "duplicate_customer_id:stripe:cus_dup"));
  assert.equal(result.allClear, false);
});

test("empty relation can be all-clear and zero rails is a run error", () => {
  const empty = compareSnapshots({
    rows: [],
    stripe: [],
    polar: [],
    stripeEnabled: true,
    polarEnabled: false,
  });
  assert.equal(empty.allClear, true);
  assert.equal(empty.findings.length, 0);

  const none = compareSnapshots({
    rows: [],
    stripe: [],
    polar: [],
    stripeEnabled: false,
    polarEnabled: false,
  });
  assert.equal(none.allClear, false);
  assert.ok(none.errors.includes("zero_enabled_rails"));
});

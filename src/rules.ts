import type {
  CompareResult,
  Finding,
  ProductRow,
  ProviderId,
  SubscriptionBucket,
} from "./invariants.js";

/**
 * P26 status map. cancel_at_period_end does not change an active subscription.
 * Polar refunds are not an input. Stripe refund state is a separate argument.
 */
export type RefundSignal = "none" | "refund" | "unknown";

const DELIBERATE = new Set(["trialing", "incomplete", "incomplete_expired"]);

export function classifyStatus(status: string, refund: RefundSignal): SubscriptionBucket {
  if (status === "active") {
    if (refund === "refund" || refund === "unknown") {
      return "ambiguous";
    }
    return "paid";
  }
  if (status === "canceled") {
    return "canceled";
  }
  if (DELIBERATE.has(status)) {
    return "deliberate_skip";
  }
  return "ambiguous";
}

export type RailState = "paid" | "canceled" | "deliberate_skip" | "ambiguous" | "absent";

/** P28 rollup for one rail after a complete read. */
export function rollupRail(buckets: readonly SubscriptionBucket[]): Exclude<RailState, "absent"> {
  if (buckets.length === 0) {
    return "ambiguous";
  }
  if (buckets.some((bucket) => bucket === "paid")) {
    return "paid";
  }
  if (buckets.some((bucket) => bucket === "ambiguous")) {
    return "ambiguous";
  }
  const hasSkip = buckets.some((bucket) => bucket === "deliberate_skip");
  const hasCanceled = buckets.some((bucket) => bucket === "canceled");
  if (hasSkip && hasCanceled) {
    return "ambiguous";
  }
  if (buckets.every((bucket) => bucket === "deliberate_skip")) {
    return "deliberate_skip";
  }
  if (buckets.every((bucket) => bucket === "canceled")) {
    return "canceled";
  }
  return "ambiguous";
}

export type ClassifiedSubscription = {
  provider: ProviderId;
  customerId: string;
  subscriptionId: string;
  bucket: SubscriptionBucket;
};

export type CompareSnapshotsInput = {
  rows: readonly ProductRow[];
  stripe: readonly ClassifiedSubscription[];
  polar: readonly ClassifiedSubscription[];
  stripeEnabled: boolean;
  polarEnabled: boolean;
};

type Applicable = {
  provider: ProviderId;
  state: Exclude<RailState, "absent">;
  customerId: string;
  subscriptionId: string | null;
};

function indexSubs(
  subs: readonly ClassifiedSubscription[]
): Map<string, ClassifiedSubscription[]> {
  const map = new Map<string, ClassifiedSubscription[]>();
  for (const sub of subs) {
    const list = map.get(sub.customerId);
    if (list) {
      list.push(sub);
    } else {
      map.set(sub.customerId, [sub]);
    }
  }
  return map;
}

function pickSubscriptionId(subs: readonly ClassifiedSubscription[], bucket: SubscriptionBucket): string | null {
  const matches = subs
    .filter((sub) => sub.bucket === bucket)
    .map((sub) => sub.subscriptionId)
    .sort();
  return matches[0] ?? null;
}

function railForCustomer(
  provider: ProviderId,
  customerId: string | null,
  enabled: boolean,
  byCustomer: Map<string, ClassifiedSubscription[]>
): Applicable | null {
  if (!enabled || customerId === null) {
    return null;
  }
  const subs = byCustomer.get(customerId) ?? [];
  const state = rollupRail(subs.map((sub) => sub.bucket));
  const wanted: SubscriptionBucket =
    state === "paid" ? "paid" : state === "canceled" ? "canceled" : "ambiguous";
  return {
    provider,
    state,
    customerId,
    subscriptionId: state === "paid" || state === "canceled" ? pickSubscriptionId(subs, wanted) : null,
  };
}

function duplicateIds(rows: readonly ProductRow[], field: "stripeCustomerId" | "polarCustomerId"): string[] {
  const seen = new Map<string, number>();
  for (const row of rows) {
    const id = row[field];
    if (id === null || id === "") {
      continue;
    }
    seen.set(id, (seen.get(id) ?? 0) + 1);
  }
  return [...seen.entries()].filter(([, count]) => count > 1).map(([id]) => id);
}

/**
 * Compare already-classified subscriptions to product rows.
 * Emits only paid_locked_out and canceled_still_entitled.
 */
export function compareSnapshots(input: CompareSnapshotsInput): CompareResult {
  const errors: string[] = [];
  if (!input.stripeEnabled && !input.polarEnabled) {
    errors.push("zero_enabled_rails");
  }

  const stripeDupes = input.stripeEnabled ? duplicateIds(input.rows, "stripeCustomerId") : [];
  const polarDupes = input.polarEnabled ? duplicateIds(input.rows, "polarCustomerId") : [];
  for (const id of stripeDupes) {
    errors.push(`duplicate_customer_id:stripe:${id}`);
  }
  for (const id of polarDupes) {
    errors.push(`duplicate_customer_id:polar:${id}`);
  }
  const excluded = new Set<string>();
  if (stripeDupes.length > 0 || polarDupes.length > 0) {
    for (const row of input.rows) {
      if (
        (row.stripeCustomerId !== null && stripeDupes.includes(row.stripeCustomerId)) ||
        (row.polarCustomerId !== null && polarDupes.includes(row.polarCustomerId))
      ) {
        excluded.add(row.userId);
      }
    }
  }

  const stripeByCustomer = indexSubs(input.stripe);
  const polarByCustomer = indexSubs(input.polar);
  const findings: Finding[] = [];
  let unclassifiedUsers = 0;
  let deliberateSkipUsers = 0;

  for (const row of input.rows) {
    if (excluded.has(row.userId)) {
      continue;
    }
    const rails = [
      railForCustomer("stripe", row.stripeCustomerId, input.stripeEnabled, stripeByCustomer),
      railForCustomer("polar", row.polarCustomerId, input.polarEnabled, polarByCustomer),
    ].filter((rail): rail is Applicable => rail !== null);

    if (rails.length === 0) {
      continue;
    }

    const isBoolean = row.isPro === true || row.isPro === false;
    if (!isBoolean || rails.some((rail) => rail.state === "ambiguous")) {
      unclassifiedUsers += 1;
      continue;
    }

    const paid = rails.filter((rail) => rail.state === "paid");
    const allCanceled = rails.every((rail) => rail.state === "canceled");

    if (paid.length > 0 && row.isPro === false) {
      for (const rail of paid) {
        findings.push({
          detectCase: "paid_locked_out",
          productUserId: row.userId,
          provider: rail.provider,
          providerCustomerId: rail.customerId,
          providerSubscriptionId: rail.subscriptionId,
          productIsPro: false,
          productSeats: row.seats,
        });
      }
      continue;
    }

    if (allCanceled && row.isPro === true) {
      for (const rail of rails) {
        findings.push({
          detectCase: "canceled_still_entitled",
          productUserId: row.userId,
          provider: rail.provider,
          providerCustomerId: rail.customerId,
          providerSubscriptionId: rail.subscriptionId,
          productIsPro: true,
          productSeats: row.seats,
        });
      }
      continue;
    }

    if (rails.some((rail) => rail.state === "deliberate_skip") && paid.length === 0) {
      deliberateSkipUsers += 1;
    }
  }

  const allClear =
    errors.length === 0 && findings.length === 0 && unclassifiedUsers === 0;

  return {
    implemented: true,
    allClear,
    mode: "live",
    findings,
    unclassifiedUsers,
    deliberateSkipUsers,
    errors,
  };
}

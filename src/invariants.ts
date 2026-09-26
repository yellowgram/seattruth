/**
 * Permanent contract and the stub build flags.
 * Canonical product rules: docs/MVP_SCOPE.md
 *
 * Read-only. Never charge. Never mutate entitlements. Never auto-fix.
 */

export class NotImplementedError extends Error {
  readonly code = "not_implemented" as const;

  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

/** Flags that must stay put for the life of the product. */
export const CONTRACT = Object.freeze({
  readOnly: true,
  charges: false,
  writesProviders: false,
  mutatesEntitlements: false,
  autoFixes: false,
});

/** What this build actually does. DR#3 still does not touch the network. */
export const BUILD = Object.freeze({
  detectorImplemented: false,
  performsNetworkReads: false,
  postsToSlack: false,
});

export type ProviderId = "stripe" | "polar";

/**
 * Closed subscription buckets used by the stub types.
 * Deliberate skips (trialing, incomplete) are not a fourth string here.
 * P25 and P26 in docs/MVP_SCOPE.md decide which statuses are paid,
 * canceled, a deliberate skip, or ambiguous. Do not guess a new bucket.
 */
export type PaidClassification = "paid" | "canceled_or_refunded" | "unclassified";

export type ProviderSubscriptionSnapshot = {
  provider: ProviderId;
  customerId: string;
  subscriptionId: string | null;
  classification: PaidClassification;
  /** Alert context. Seat inequality is not a detect case. */
  quantity: number | null;
};

export type ProductRow = {
  userId: string;
  isPro: boolean | null;
  seats: number | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  polarCustomerId: string | null;
  polarSubscriptionId: string | null;
};

export const DETECT_CASES = ["paid_locked_out", "canceled_still_entitled"] as const;

export type DetectCase = (typeof DETECT_CASES)[number];

export type Finding = {
  detectCase: DetectCase;
  productUserId: string;
  provider: ProviderId;
  providerCustomerId: string;
  providerSubscriptionId: string | null;
  productIsPro: boolean | null;
  productSeats: number | null;
};

export type CompareResult = {
  /** False until the detector exists. False is never an all-clear. */
  implemented: boolean;
  /**
   * True only on a live implemented run with zero findings, zero errors,
   * and unclassifiedUsers of 0. deliberateSkipUsers may be above zero (P30).
   */
  allClear: boolean;
  mode: "dry-run" | "live";
  findings: Finding[];
  /**
   * Ambiguous users. No case finding. A non-zero count forces allClear false.
   * DR#3 rule P25. Not a run error.
   */
  unclassifiedUsers: number;
  /**
   * Users on a written non-case status such as trialing or incomplete.
   * No case finding. Does not, by itself, force allClear false. DR#3 rule P25.
   */
  deliberateSkipUsers: number;
  errors: string[];
};

export function assertStubResult(result: CompareResult): void {
  if (result.implemented || result.allClear || result.mode !== "dry-run") {
    throw new Error("Stub compare violated the dry-run contract.");
  }
  if (result.findings.length !== 0) {
    throw new Error("Stub compare must not invent findings.");
  }
  if (result.unclassifiedUsers !== 0) {
    throw new Error("Stub compare must not invent unclassified users.");
  }
  if (result.deliberateSkipUsers !== 0) {
    throw new Error("Stub compare must not invent skipped users.");
  }
}

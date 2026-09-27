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

/** What this build actually does. Live mode can read and post. Dry-run does neither. */
export const BUILD = Object.freeze({
  detectorImplemented: true,
  performsNetworkReads: true,
  postsToSlack: true,
});

export type ProviderId = "stripe" | "polar";

/**
 * One subscription after P26. Deliberate skip is not "paid" and not "canceled".
 * Ambiguous is not a finding.
 */
export type SubscriptionBucket = "paid" | "canceled" | "deliberate_skip" | "ambiguous";

export type ProviderSubscriptionSnapshot = {
  provider: ProviderId;
  customerId: string;
  subscriptionId: string;
  bucket: SubscriptionBucket;
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
  /** True once the detector exists. A dry-run is still not an all-clear. */
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

export function assertDryRunResult(result: CompareResult): void {
  if (!result.implemented || result.allClear || result.mode !== "dry-run") {
    throw new Error("Dry-run compare violated the contract.");
  }
  if (result.findings.length !== 0 || result.unclassifiedUsers !== 0 || result.deliberateSkipUsers !== 0) {
    throw new Error("Dry-run compare must not invent a live result.");
  }
  if (result.errors.length !== 0) {
    throw new Error("Dry-run compare must not invent errors.");
  }
}

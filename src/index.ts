/**
 * Public surface.
 * Charge, write, and fix APIs are not exported. tests/smoke.test.ts locks this.
 */

export {
  BUILD,
  CONTRACT,
  DETECT_CASES,
  NotImplementedError,
  assertDryRunResult,
} from "./invariants.js";
export type {
  CompareResult,
  DetectCase,
  Finding,
  ProductRow,
  ProviderId,
  ProviderSubscriptionSnapshot,
  SubscriptionBucket,
} from "./invariants.js";

export { IncompleteReadError, ProviderHttpError } from "./http.js";

export { readStripeSnapshot } from "./providers/stripe.js";
export type { StripeReadInput } from "./providers/stripe.js";

export { readPolarSnapshot } from "./providers/polar.js";
export type { PolarReadInput } from "./providers/polar.js";

export { readProductRows, normalizeIsPro, normalizeSeats, normalizeProductRow } from "./productDb.js";
export type { MappingDocument, ProductDbReadInput } from "./productDb.js";

export { buildProductSelect, loadMapping, parseMapping, quoteIdent } from "./mapping.js";

export { compareReadOnly, dryRunResult, runLiveCompare } from "./compare.js";
export { classifyStatus, compareSnapshots, rollupRail } from "./rules.js";
export type { ClassifiedSubscription, CompareSnapshotsInput, RefundSignal } from "./rules.js";

export { buildSlackAlert, deliverSlackAlert, slackNeeded } from "./slack.js";
export type { SlackAlert } from "./slack.js";

export { HELP, runCli } from "./cli.js";

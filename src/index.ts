/**
 * Public surface of the scaffold.
 * Charge, write, and fix APIs are not exported. tests/smoke.test.ts locks this.
 */

export {
  BUILD,
  CONTRACT,
  DETECT_CASES,
  NotImplementedError,
  assertStubResult,
} from "./invariants.js";
export type {
  CompareResult,
  DetectCase,
  Finding,
  PaidClassification,
  ProductRow,
  ProviderId,
  ProviderSubscriptionSnapshot,
} from "./invariants.js";

export { readStripeSnapshot } from "./providers/stripe.js";
export type { StripeReadInput } from "./providers/stripe.js";

export { readPolarSnapshot } from "./providers/polar.js";
export type { PolarReadInput } from "./providers/polar.js";

export { readProductRows } from "./productDb.js";
export type { MappingDocument, ProductDbReadInput } from "./productDb.js";

export { compareReadOnly } from "./compare.js";

export { buildSlackAlert, deliverSlackAlert } from "./slack.js";
export type { SlackAlert } from "./slack.js";

export { HELP, runCli } from "./cli.js";

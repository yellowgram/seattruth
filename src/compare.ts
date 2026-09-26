import { MappingError, loadMapping } from "./mapping.js";
import { IncompleteReadError, ProviderHttpError } from "./http.js";
import type { FetchLike } from "./http.js";
import type { CompareResult, ProductRow } from "./invariants.js";
import { ProductReadError, readProductRows } from "./productDb.js";
import { readPolarSnapshot } from "./providers/polar.js";
import { readStripeSnapshot } from "./providers/stripe.js";
import { compareSnapshots } from "./rules.js";
import type { ClassifiedSubscription } from "./rules.js";

/**
 * Read-only compare.
 *
 * 1. paid_locked_out — at least one applicable rail is paid, none are ambiguous,
 *    is_pro is false. A deliberate skip on another rail does not block (P28).
 * 2. canceled_still_entitled — every applicable rail is status canceled,
 *    is_pro is true (P26, P28).
 *
 * Dry-run does not read the network. Live reads do not write.
 */

export type LiveCompareInput = {
  stripeKey: string;
  polarToken: string;
  databaseUrl: string;
  mappingPath: string;
  fetchImpl?: FetchLike;
  readRows?: (databaseUrl: string, mappingPath: string) => Promise<readonly ProductRow[]>;
};

export function dryRunResult(): CompareResult {
  return {
    implemented: true,
    allClear: false,
    mode: "dry-run",
    findings: [],
    unclassifiedUsers: 0,
    deliberateSkipUsers: 0,
    errors: [],
  };
}

export async function compareReadOnly(): Promise<CompareResult> {
  return dryRunResult();
}

function errorCode(error: unknown): string {
  if (error instanceof MappingError || error instanceof IncompleteReadError || error instanceof ProviderHttpError) {
    return error.code;
  }
  if (error instanceof ProductReadError) {
    return error.code;
  }
  if (error instanceof Error) {
    if (error.message.startsWith("Missing ") || error.message.startsWith("Refusing ")) {
      return "credential_refused";
    }
  }
  return "compare_failed";
}

function toClassified(
  snapshots: readonly { provider: "stripe" | "polar"; customerId: string; subscriptionId: string; bucket: ClassifiedSubscription["bucket"] }[]
): ClassifiedSubscription[] {
  return snapshots.map((snapshot) => ({
    provider: snapshot.provider,
    customerId: snapshot.customerId,
    subscriptionId: snapshot.subscriptionId,
    bucket: snapshot.bucket,
  }));
}

export async function runLiveCompare(input: LiveCompareInput): Promise<CompareResult> {
  const fail = (code: string): CompareResult => ({
    implemented: true,
    allClear: false,
    mode: "live",
    findings: [],
    unclassifiedUsers: 0,
    deliberateSkipUsers: 0,
    errors: [code],
  });

  let mapping;
  try {
    mapping = loadMapping(input.mappingPath);
  } catch (error) {
    return fail(errorCode(error));
  }

  const stripeEnabled = mapping.rails.stripe.customer_id !== null;
  const polarEnabled = mapping.rails.polar.customer_id !== null;
  if (stripeEnabled && input.stripeKey.trim() === "") {
    return fail("missing_stripe_key");
  }
  if (polarEnabled && input.polarToken.trim() === "") {
    return fail("missing_polar_token");
  }
  if (input.databaseUrl.trim() === "") {
    return fail("missing_database_url");
  }

  try {
    const readRows = input.readRows ?? ((databaseUrl, mappingPath) => readProductRows({ connectionString: databaseUrl, mappingPath }));
    const rows = await readRows(input.databaseUrl, input.mappingPath);
    const stripe = stripeEnabled
      ? toClassified(await readStripeSnapshot({ restrictedKey: input.stripeKey, fetchImpl: input.fetchImpl }))
      : [];
    const polar = polarEnabled
      ? toClassified(await readPolarSnapshot({ restrictedToken: input.polarToken, fetchImpl: input.fetchImpl }))
      : [];
    return compareSnapshots({
      rows,
      stripe,
      polar,
      stripeEnabled,
      polarEnabled,
    });
  } catch (error) {
    return fail(errorCode(error));
  }
}

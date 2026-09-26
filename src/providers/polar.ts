import { NotImplementedError } from "../invariants.js";
import type { ProviderSubscriptionSnapshot } from "../invariants.js";

/**
 * Read-only Polar snapshot.
 *
 * Invariants:
 * - Organization Access Token with read scopes only.
 * - Never create Checkout, products, orders, subscriptions, or refunds.
 * - Never grant or revoke benefits.
 * - TODO(implement): after three design iterations and the founder halt.
 *   Confirm Polar status strings from their API schema. Unknown strings
 *   stay unclassified (docs/MVP_SCOPE.md, rule P2).
 *   Token overview: https://polar.sh/docs/integrate/oat
 */

export type PolarReadInput = {
  /** Organization Access Token. Read scopes only. */
  restrictedToken: string;
};

export async function readPolarSnapshot(
  input: PolarReadInput
): Promise<readonly ProviderSubscriptionSnapshot[]> {
  if (input.restrictedToken.trim() === "") {
    throw new Error("Missing Polar restricted token. Refusing to call Polar.");
  }
  throw new NotImplementedError(
    "Polar read is not implemented. Refusing to call Polar. No charges and no writes."
  );
}

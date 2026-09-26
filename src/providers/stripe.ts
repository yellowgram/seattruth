import { NotImplementedError } from "../invariants.js";
import type { ProviderSubscriptionSnapshot } from "../invariants.js";

/**
 * Read-only Stripe snapshot.
 *
 * Invariants:
 * - Never charge, capture, invoice, refund, or open Checkout.
 * - Never update or cancel a Stripe object.
 * - A secret key (sk_) is refused before any network call.
 * - TODO(implement): not in DR#3. Next is the 4th DR with LaunchGate APPROVE. Do not wait on the founder for that ordinary gate.
 *   Rules: docs/MVP_SCOPE.md (provisional rules P2, P3, P7).
 */

export type StripeReadInput = {
  /** Restricted key (rk_). Secret keys are refused. */
  restrictedKey: string;
};

export async function readStripeSnapshot(
  input: StripeReadInput
): Promise<readonly ProviderSubscriptionSnapshot[]> {
  if (input.restrictedKey.trim() === "") {
    throw new Error("Missing Stripe restricted key. Refusing to call Stripe.");
  }
  if (input.restrictedKey.startsWith("sk_")) {
    throw new Error(
      "Refusing a Stripe secret key (sk_). Use a restricted key (rk_) with read permissions only."
    );
  }
  throw new NotImplementedError(
    "Stripe read is not implemented. Refusing to call Stripe. No charges and no writes."
  );
}

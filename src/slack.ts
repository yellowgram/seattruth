import { NotImplementedError } from "./invariants.js";
import type { CompareResult } from "./invariants.js";

/**
 * Slack alert builder.
 *
 * Invariants:
 * - Posts, when implemented, go only to the operator's incoming webhook.
 * - Alert text names the disagreement. It does not say to change is_pro or seats.
 * - No email, no customer name, no card data.
 * - The stub never POSTs.
 * - TODO(implement): not in DR#2. Wait for DR#3, then a 4th DR with LaunchGate APPROVE. Do not wait on the founder for that ordinary gate.
 *   Rule P6 and P10 in docs/MVP_SCOPE.md.
 */

export type SlackAlert = {
  text: string;
};

export function buildSlackAlert(result: CompareResult): SlackAlert {
  if (result.implemented || result.mode !== "dry-run") {
    throw new NotImplementedError(
      "Live Slack copy is not written. Refusing to invent finding text."
    );
  }
  return {
    text: "SeatTruth dry-run: detector not implemented. This is not an all-clear. No charges. No entitlement changes.",
  };
}

export async function deliverSlackAlert(
  _alert: SlackAlert,
  webhookUrl: string
): Promise<void> {
  if (webhookUrl.trim() === "") {
    throw new Error("Missing Slack webhook. Refusing to post.");
  }
  throw new NotImplementedError(
    "Slack delivery is not implemented. Refusing to post."
  );
}

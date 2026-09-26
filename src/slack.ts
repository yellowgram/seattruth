import type { FetchLike } from "./http.js";
import type { CompareResult, Finding } from "./invariants.js";

/**
 * Slack text names the disagreement (P6, P24).
 * It does not say to change is_pro, and it does not include secrets (P23).
 * Dry-run text is printed locally. It is not posted.
 * A live all-clear is not posted.
 */

export type SlackAlert = {
  text: string;
};

const FIX_LANGUAGE = /should have access|should lose access|set is_pro|UPDATE\b|refund the|cancel the subscription/i;

function seatsText(seats: number | null): string {
  return seats === null ? "null" : String(seats);
}

function findingLine(finding: Finding): string {
  const subscription = finding.providerSubscriptionId ?? "none";
  const isPro = finding.productIsPro === null ? "null" : String(finding.productIsPro);
  return [
    `SeatTruth ${finding.detectCase}`,
    `user=${finding.productUserId}`,
    `provider=${finding.provider}`,
    `customer=${finding.providerCustomerId}`,
    `subscription=${subscription}`,
    `is_pro=${isPro}`,
    `seats=${seatsText(finding.productSeats)}`,
  ].join(" ");
}

export function buildSlackAlert(result: CompareResult): SlackAlert {
  if (result.mode === "dry-run") {
    return {
      text: "SeatTruth dry-run: detector is implemented. This is not an all-clear. No charges. No entitlement changes.",
    };
  }
  const lines: string[] = [];
  for (const finding of result.findings) {
    lines.push(findingLine(finding));
  }
  if (result.unclassifiedUsers > 0) {
    lines.push(`SeatTruth ambiguous_users=${result.unclassifiedUsers}`);
  }
  for (const error of result.errors) {
    lines.push(`SeatTruth run_error=${error}`);
  }
  if (lines.length === 0) {
    return { text: "" };
  }
  const text = lines.join("\n");
  if (FIX_LANGUAGE.test(text)) {
    throw new Error("slack_copy_refused");
  }
  return { text };
}

export function slackNeeded(result: CompareResult): boolean {
  return result.mode === "live" && (result.findings.length > 0 || result.unclassifiedUsers > 0 || result.errors.length > 0);
}

export async function deliverSlackAlert(
  alert: SlackAlert,
  webhookUrl: string,
  fetchImpl?: FetchLike
): Promise<void> {
  if (webhookUrl.trim() === "") {
    throw new Error("missing_slack_webhook");
  }
  if (alert.text.trim() === "") {
    return;
  }
  let response: { ok: boolean; status: number };
  try {
    const fetchFn = fetchImpl ?? fetch;
    response = await fetchFn(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: alert.text }),
    });
  } catch {
    throw new Error("slack_http_0");
  }
  if (!response.ok) {
    throw new Error(`slack_http_${response.status}`);
  }
}

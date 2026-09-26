import { IncompleteReadError, ProviderHttpError, getJson } from "../http.js";
import type { FetchLike } from "../http.js";
import type { ProviderSubscriptionSnapshot } from "../invariants.js";
import { classifyStatus } from "../rules.js";
import type { RefundSignal } from "../rules.js";

/**
 * Read-only Stripe snapshot.
 *
 * Refund recipe (P26), cited 2026-09-26:
 * - List every subscription: GET /v1/subscriptions?status=all&limit=100
 *   https://docs.stripe.com/api/subscriptions/list
 *   Complete when has_more is false. starting_after is the previous page's last id.
 *   https://docs.stripe.com/api/pagination
 * - For each status=active subscription, list its invoices:
 *   GET /v1/invoices?subscription={id}&limit=100&expand[]=data.charge
 *   https://docs.stripe.com/api/invoices/list (subscription filter)
 *   https://docs.stripe.com/api/expanding_objects (list expansions use the data. prefix)
 * - A charge with amount_refunded > 0 or refunded true is a refund.
 *   https://docs.stripe.com/api/charges/object
 * - There is no "latest charge" pick. Any refund makes the subscription ambiguous.
 * - If a paid invoice has no readable charge, the refund state is unknown, so the
 *   subscription is ambiguous, not paid.
 * - cancel_at_period_end is ignored while status is active.
 *   https://docs.stripe.com/api/subscriptions/object
 *
 * Never charges, refunds, or writes. Secret keys (sk_) are refused before any request.
 */

const STRIPE_API = "https://api.stripe.com";
const PAGE_LIMIT = 100;
const MAX_PAGES = 10000;

export type StripeReadInput = {
  restrictedKey: string;
  fetchImpl?: FetchLike;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function customerIdOf(subscription: Record<string, unknown>): string | null {
  const customer = subscription.customer;
  if (typeof customer === "string" && customer !== "") {
    return customer;
  }
  const record = asRecord(customer);
  if (record && typeof record.id === "string") {
    return record.id;
  }
  return null;
}

function refundSignalFromInvoice(invoice: Record<string, unknown>): RefundSignal {
  const signals: Array<RefundSignal | "absent"> = [];
  signals.push(signalFromCharge(invoice.charge));
  const payments = asRecord(invoice.payments);
  if (payments) {
    if (payments.has_more === true) {
      return "unknown";
    }
    const data = payments.data;
    if (Array.isArray(data)) {
      for (const entry of data) {
        const payment = asRecord(asRecord(entry)?.payment);
        if (payment && "charge" in payment) {
          signals.push(signalFromCharge(payment.charge));
        }
      }
    }
  }
  if (signals.includes("refund")) {
    return "refund";
  }
  if (signals.includes("unknown")) {
    return "unknown";
  }
  const sawCharge = signals.includes("none");
  const amountPaid = invoice.amount_paid;
  if (!sawCharge && typeof amountPaid === "number" && amountPaid > 0) {
    return "unknown";
  }
  return "none";
}

function signalFromCharge(charge: unknown): RefundSignal | "absent" {
  if (charge === null || charge === undefined || charge === "") {
    return "absent";
  }
  if (typeof charge === "string") {
    return "unknown";
  }
  const record = asRecord(charge);
  if (!record || record.object !== "charge") {
    return "unknown";
  }
  if (record.refunded === true) {
    return "refund";
  }
  if (typeof record.amount_refunded === "number" && record.amount_refunded > 0) {
    return "refund";
  }
  if (typeof record.amount_refunded !== "number") {
    return "unknown";
  }
  return "none";
}

function combineRefundSignals(signals: readonly RefundSignal[]): RefundSignal {
  if (signals.includes("refund")) {
    return "refund";
  }
  if (signals.includes("unknown")) {
    return "unknown";
  }
  return "none";
}

async function stripeGet(
  fetchImpl: FetchLike,
  key: string,
  pathAndQuery: string
): Promise<unknown> {
  return getJson(fetchImpl, "stripe", `${STRIPE_API}${pathAndQuery}`, {
    Authorization: `Bearer ${key}`,
  });
}

async function eachPage(
  fetchImpl: FetchLike,
  key: string,
  path: string,
  query: URLSearchParams
): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  let startingAfter: string | undefined;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const params = new URLSearchParams(query);
    params.set("limit", String(PAGE_LIMIT));
    if (startingAfter) {
      params.set("starting_after", startingAfter);
    }
    const body = asRecord(await stripeGet(fetchImpl, key, `${path}?${params.toString()}`));
    if (!body || !Array.isArray(body.data) || typeof body.has_more !== "boolean") {
      throw new IncompleteReadError("stripe");
    }
    const data = body.data;
    for (const entry of data) {
      const record = asRecord(entry);
      if (!record || typeof record.id !== "string") {
        throw new IncompleteReadError("stripe");
      }
      rows.push(record);
    }
    if (!body.has_more) {
      return rows;
    }
    const last = data[data.length - 1];
    const lastRecord = asRecord(last);
    if (!lastRecord || typeof lastRecord.id !== "string") {
      throw new IncompleteReadError("stripe");
    }
    startingAfter = lastRecord.id;
  }
  throw new IncompleteReadError("stripe");
}

async function refundSignalForSubscription(
  fetchImpl: FetchLike,
  key: string,
  subscriptionId: string
): Promise<RefundSignal> {
  const query = new URLSearchParams();
  query.set("subscription", subscriptionId);
  query.append("expand[]", "data.charge");
  const invoices = await eachPage(fetchImpl, key, "/v1/invoices", query);
  return combineRefundSignals(invoices.map((invoice) => refundSignalFromInvoice(invoice)));
}

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
  if (!input.restrictedKey.startsWith("rk_")) {
    throw new Error("Refusing a Stripe key that is not a restricted key (rk_).");
  }
  const fetchImpl = input.fetchImpl ?? fetch;
  const query = new URLSearchParams();
  query.set("status", "all");
  let subscriptions: Record<string, unknown>[];
  try {
    subscriptions = await eachPage(fetchImpl, input.restrictedKey, "/v1/subscriptions", query);
  } catch (error) {
    if (error instanceof IncompleteReadError || error instanceof ProviderHttpError) {
      throw error;
    }
    throw new IncompleteReadError("stripe");
  }

  const snapshots: ProviderSubscriptionSnapshot[] = [];
  for (const subscription of subscriptions) {
    const id = subscription.id;
    const status = subscription.status;
    const customerId = customerIdOf(subscription);
    if (typeof id !== "string" || typeof status !== "string" || customerId === null) {
      throw new IncompleteReadError("stripe");
    }
    let refund: RefundSignal = "none";
    if (status === "active") {
      refund = await refundSignalForSubscription(fetchImpl, input.restrictedKey, id);
    }
    snapshots.push({
      provider: "stripe",
      customerId,
      subscriptionId: id,
      bucket: classifyStatus(status, refund),
    });
  }
  return snapshots;
}

import { IncompleteReadError, ProviderHttpError, getJson } from "../http.js";
import type { FetchLike } from "../http.js";
import type { ProviderSubscriptionSnapshot } from "../invariants.js";
import { classifyStatus } from "../rules.js";
import type { RefundSignal } from "../rules.js";

/**
 * Read-only Stripe snapshot.
 *
 * One paginated list call per 100 subscriptions, account-wide:
 *   GET /v1/subscriptions?status=all&limit=100&expand[]=data.latest_invoice.charge
 *   https://docs.stripe.com/api/subscriptions/list
 *   https://docs.stripe.com/api/expanding_objects (list expansions use the data. prefix)
 * Every request sends Stripe-Version: STRIPE_API_VERSION, so the account's default
 * API version cannot change the shapes read here. In that version an invoice has
 * `charge`; `payments` is also honoured when present.
 *
 * Refunds use the latest-period rule: only the subscription's latest invoice
 * counts. A full refund, or a dispute, on that invoice's charge makes an active
 * subscription ambiguous. A partial refund leaves it paid. Refunds on earlier
 * invoices are history and are ignored.
 * A paid latest invoice whose charge cannot be read is ambiguous, not paid.
 * cancel_at_period_end is ignored while status is active.
 *
 * Never charges, refunds, or writes. Secret keys (sk_) are refused before any request.
 */

/** Pinned so the account's default API version cannot change the shapes read here. */
export const STRIPE_API_VERSION = "2025-02-24.acacia";

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
  if (typeof customer === "string" && customer.trim() !== "") {
    return customer.trim();
  }
  const record = asRecord(customer);
  if (record && typeof record.id === "string" && record.id.trim() !== "") {
    return record.id.trim();
  }
  return null;
}

const CHARGE_ID = /^ch_[A-Za-z0-9]+$/;

async function resolveCharge(
  fetchImpl: FetchLike,
  key: string,
  charge: unknown
): Promise<RefundSignal | "absent"> {
  if (typeof charge !== "string") {
    return signalFromCharge(charge);
  }
  if (!CHARGE_ID.test(charge)) {
    return "unknown";
  }
  const body = await stripeGet(fetchImpl, key, `/v1/charges/${charge}`);
  return signalFromCharge(body);
}

async function refundSignalFromInvoice(
  fetchImpl: FetchLike,
  key: string,
  invoice: Record<string, unknown>
): Promise<RefundSignal> {
  const signals: Array<RefundSignal | "absent"> = [];
  signals.push(await resolveCharge(fetchImpl, key, invoice.charge));
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
          signals.push(await resolveCharge(fetchImpl, key, payment.charge));
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
  // Nothing was charged (a 100% coupon, or paid from the customer balance): nothing to refund.
  const paidInvoice = typeof amountPaid === "number" ? amountPaid > 0 : invoice.status === "paid";
  if (!sawCharge && paidInvoice) {
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
  if (record.disputed === true) {
    return "unknown";
  }
  if (record.refunded === true) {
    return "refund";
  }
  if (typeof record.amount_refunded !== "number") {
    return "unknown";
  }
  if (record.amount_refunded === 0) {
    return "none";
  }
  // A partial refund (a goodwill credit) leaves the period paid. Only a full refund,
  // or one we cannot size, makes the subscription ambiguous.
  if (typeof record.amount === "number" && record.amount_refunded < record.amount) {
    return "none";
  }
  return "refund";
}

async function stripeGet(
  fetchImpl: FetchLike,
  key: string,
  pathAndQuery: string
): Promise<unknown> {
  return getJson(fetchImpl, "stripe", `${STRIPE_API}${pathAndQuery}`, {
    Authorization: `Bearer ${key}`,
    "Stripe-Version": STRIPE_API_VERSION,
  });
}

async function eachPage(
  fetchImpl: FetchLike,
  key: string,
  path: string,
  query: URLSearchParams
): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  const seen = new Set<string>();
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
      if (seen.has(record.id)) {
        throw new IncompleteReadError("stripe");
      }
      seen.add(record.id);
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

/** Refund state of the subscription's latest invoice (the latest-period rule). */
async function latestInvoiceSignal(
  fetchImpl: FetchLike,
  key: string,
  subscription: Record<string, unknown>
): Promise<RefundSignal> {
  if (!("latest_invoice" in subscription)) {
    return "unknown";
  }
  const invoice = subscription.latest_invoice;
  if (invoice === null) {
    return "unknown";
  }
  const record = asRecord(invoice);
  if (!record) {
    return "unknown";
  }
  return refundSignalFromInvoice(fetchImpl, key, record);
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
  query.append("expand[]", "data.latest_invoice.charge");
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
      refund = await latestInvoiceSignal(fetchImpl, input.restrictedKey, subscription);
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

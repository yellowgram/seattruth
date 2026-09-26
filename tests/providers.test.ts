import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { IncompleteReadError, ProviderHttpError } from "../src/http.js";
import type { FetchLike } from "../src/http.js";
import { readPolarSnapshot } from "../src/providers/polar.js";
import { readStripeSnapshot } from "../src/providers/stripe.js";
import { runLiveCompare } from "../src/compare.js";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

test("Stripe secret key is refused before any request", async () => {
  let called = false;
  const fetchImpl: FetchLike = async () => {
    called = true;
    return jsonResponse(200, {});
  };
  await assert.rejects(
    () => readStripeSnapshot({ restrictedKey: "sk_test_REPLACE_ME", fetchImpl }),
    /secret key/
  );
  await assert.rejects(
    () => readStripeSnapshot({ restrictedKey: "", fetchImpl }),
    /Missing Stripe restricted key/
  );
  assert.equal(called, false);
});

test("Stripe pagination failure is a run error and does not return a partial list", async () => {
  const urls: string[] = [];
  const fetchImpl: FetchLike = async (url, init) => {
    assert.equal(init?.method ?? "GET", "GET");
    assert.equal(init?.redirect, "error");
    const href = String(url);
    urls.push(href);
    assert.equal(href.includes("/v1/refunds"), false);
    if (href.includes("/v1/subscriptions")) {
      if (!href.includes("starting_after=")) {
        return jsonResponse(200, {
          object: "list",
          has_more: true,
          data: [{ id: "sub_1", object: "subscription", status: "canceled", customer: "cus_1" }],
        });
      }
      return jsonResponse(500, { error: { message: "nope" } });
    }
    throw new Error("unexpected url");
  };
  await assert.rejects(
    () => readStripeSnapshot({ restrictedKey: "rk_test_REPLACE_ME", fetchImpl }),
    (error: unknown) => error instanceof ProviderHttpError && error.code === "stripe_http_500"
  );
  assert.equal(urls.some((url) => url.includes("starting_after=sub_1")), true);
});

test("Stripe active plus any refund is ambiguous, and a readable zero refund is paid", async () => {
  async function readWithInvoice(invoice: Record<string, unknown>, status = "active", extra: Record<string, unknown> = {}) {
    const fetchImpl: FetchLike = async (url, init) => {
      assert.equal(init?.method ?? "GET", "GET");
      const href = String(url);
      assert.doesNotMatch(href, /\/v1\/refunds/);
      if (href.includes("/v1/subscriptions")) {
        assert.match(href, /status=all/);
        return jsonResponse(200, {
          object: "list",
          has_more: false,
          data: [
            {
              id: "sub_live",
              object: "subscription",
              status,
              customer: "cus_1",
              cancel_at_period_end: true,
              quantity: 0,
              ...extra,
            },
          ],
        });
      }
      assert.match(href, /\/v1\/invoices/);
      assert.match(href, /subscription=sub_live/);
      assert.match(href, /data\.charge/);
      return jsonResponse(200, { object: "list", has_more: false, data: [invoice] });
    };
    const [snapshot] = await readStripeSnapshot({ restrictedKey: "rk_test_REPLACE_ME", fetchImpl });
    return snapshot;
  }

  const refunded = await readWithInvoice({
    id: "in_1",
    object: "invoice",
    amount_paid: 2000,
    charge: { id: "ch_1", object: "charge", amount_refunded: 500, refunded: false },
  });
  assert.equal(refunded?.bucket, "ambiguous");

  const clean = await readWithInvoice({
    id: "in_1",
    object: "invoice",
    amount_paid: 2000,
    charge: { id: "ch_1", object: "charge", amount_refunded: 0, refunded: false },
  });
  assert.equal(clean?.bucket, "paid");

  const unreadable = await readWithInvoice({
    id: "in_1",
    object: "invoice",
    amount_paid: 2000,
    charge: null,
  });
  assert.equal(unreadable?.bucket, "ambiguous");

  const disputed = await readWithInvoice({
    id: "in_1",
    object: "invoice",
    status: "paid",
    amount_paid: 2000,
    charge: { id: "ch_1", object: "charge", amount_refunded: 0, refunded: false, disputed: true },
  });
  assert.equal(disputed?.bucket, "ambiguous");

  const canceled = await readWithInvoice(
    { id: "in_1", object: "invoice", amount_paid: 0, charge: null },
    "canceled"
  );
  assert.equal(canceled?.bucket, "canceled");
});

test("an unexpanded Stripe charge id is read with GET and any refund stays ambiguous", async () => {
  const urls: string[] = [];
  const fetchImpl: FetchLike = async (url, init) => {
    assert.equal(init?.method ?? "GET", "GET");
    const href = String(url);
    urls.push(href);
    assert.doesNotMatch(href, /\/v1\/refunds/);
    if (href.includes("/v1/subscriptions")) {
      return jsonResponse(200, {
        object: "list",
        has_more: false,
        data: [{ id: "sub_live", object: "subscription", status: "active", customer: "cus_1" }],
      });
    }
    if (href.includes("/v1/invoices")) {
      return jsonResponse(200, {
        object: "list",
        has_more: false,
        data: [{ id: "in_1", object: "invoice", status: "paid", amount_paid: 2000, charge: "ch_refunded1" }],
      });
    }
    assert.match(href, /\/v1\/charges\/ch_refunded1$/);
    return jsonResponse(200, { id: "ch_refunded1", object: "charge", amount_refunded: 2000, refunded: true });
  };
  const [snapshot] = await readStripeSnapshot({ restrictedKey: "rk_test_REPLACE_ME", fetchImpl });
  assert.equal(snapshot?.bucket, "ambiguous");
  assert.equal(urls.some((url) => url.includes("/v1/charges/ch_refunded1")), true);
});

test("a repeated Stripe page is an incomplete read", async () => {
  const fetchImpl: FetchLike = async (url) => {
    const href = String(url);
    assert.equal(href.includes("/v1/invoices"), false);
    return jsonResponse(200, {
      object: "list",
      has_more: !href.includes("starting_after="),
      data: [{ id: "sub_1", object: "subscription", status: "canceled", customer: "cus_1" }],
    });
  };
  await assert.rejects(
    () => readStripeSnapshot({ restrictedKey: "rk_test_REPLACE_ME", fetchImpl }),
    (error: unknown) => error instanceof IncompleteReadError
  );
});

test("Polar list is complete only when every page is read, and refunds are not requested", async () => {
  const urls: string[] = [];
  const fetchImpl: FetchLike = async (url, init) => {
    assert.equal(init?.method ?? "GET", "GET");
    assert.equal(init?.redirect, "error");
    const href = String(url);
    urls.push(href);
    assert.doesNotMatch(href, /\/v1\/orders/);
    assert.doesNotMatch(href, /\/v1\/refunds/);
    assert.match(href, /\/v1\/subscriptions/);
    if (href.includes("page=1")) {
      return jsonResponse(200, {
        items: [
          {
            id: "11111111-1111-1111-1111-111111111111",
            customer_id: "22222222-2222-2222-2222-222222222222",
            status: "active",
            cancel_at_period_end: true,
            order_status: "refunded",
          },
        ],
        pagination: { total_count: 2, max_page: 2 },
      });
    }
    return jsonResponse(500, { detail: "truncated" });
  };
  await assert.rejects(
    () => readPolarSnapshot({ restrictedToken: "polar_oat_REPLACE_ME", fetchImpl }),
    (error: unknown) => error instanceof ProviderHttpError && error.code === "polar_http_500"
  );
  assert.equal(urls.some((url) => url.includes("page=2")), true);
});

test("Polar active status stays paid when a refund field is present on the subscription", async () => {
  const fetchImpl: FetchLike = async (url) => {
    assert.match(String(url), /limit=100/);
    assert.doesNotMatch(String(url), /active=true/);
    return jsonResponse(200, {
      items: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          customer_id: "22222222-2222-2222-2222-222222222222",
          status: "active",
          cancel_at_period_end: true,
          order_status: "refunded",
        },
      ],
      pagination: { total_count: 1, max_page: 1 },
    });
  };
  const [snapshot] = await readPolarSnapshot({ restrictedToken: "polar_oat_REPLACE_ME", fetchImpl });
  assert.equal(snapshot?.bucket, "paid");
});

test("a repeated Polar page is an incomplete read", async () => {
  const fetchImpl: FetchLike = async (url) => {
    const href = String(url);
    const page = href.includes("page=2") ? 2 : 1;
    return jsonResponse(200, {
      items: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          customer_id: "22222222-2222-2222-2222-222222222222",
          status: "canceled",
        },
      ],
      pagination: { total_count: page === 1 ? 2 : 2, max_page: 2 },
    });
  };
  await assert.rejects(
    () => readPolarSnapshot({ restrictedToken: "polar_oat_REPLACE_ME", fetchImpl }),
    (error: unknown) => error instanceof IncompleteReadError
  );
});

test("a truncated provider page fails the live run instead of looking like no subscription", async () => {
  const fetchImpl: FetchLike = async (url) => {
    const href = String(url);
    if (href.includes("/v1/subscriptions") && !href.includes("starting_after=")) {
      return jsonResponse(200, {
        object: "list",
        has_more: true,
        data: [{ id: "sub_1", object: "subscription", status: "canceled", customer: "cus_1" }],
      });
    }
    return jsonResponse(500, {});
  };
  const dir = mkdtempSync(path.join(tmpdir(), "seattruth-"));
  const mappingPath = path.join(dir, "mapping.yaml");
  writeFileSync(
    mappingPath,
    `version: 1
product:
  engine: postgres
  schema: billing
  relation: billing_access
  columns:
    user_id: id
    is_pro: is_pro
    seats: seat_count
rails:
  stripe:
    customer_id: stripe_customer_id
    subscription_id: null
  polar:
    customer_id: null
    subscription_id: null
entitlement:
  field: is_pro
`
  );
  const result = await runLiveCompare({
    stripeKey: "rk_test_REPLACE_ME",
    polarToken: "",
    databaseUrl: "postgres://example",
    mappingPath,
    fetchImpl,
    readRows: async () => [
      {
        userId: "u1",
        isPro: true,
        seats: 1,
        stripeCustomerId: "cus_1",
        stripeSubscriptionId: null,
        polarCustomerId: null,
        polarSubscriptionId: null,
      },
    ],
  });
  assert.deepEqual(result.findings, []);
  assert.equal(result.unclassifiedUsers, 0);
  assert.equal(result.allClear, false);
  assert.ok(result.errors.includes("stripe_http_500"));
});

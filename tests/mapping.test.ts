import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { MappingError, buildProductSelect, parseMapping } from "../src/mapping.js";
import { normalizeIsPro, normalizeProductRow, normalizeSeats } from "../src/productDb.js";

const example = readFileSync(path.join(process.cwd(), "mapping.example.yaml"), "utf8");

test("mapping.example.yaml is one quoted SELECT", () => {
  const mapping = parseMapping(example);
  const select = buildProductSelect(mapping);
  assert.match(select.text, /^SELECT /);
  assert.match(select.text, /"billing"\."billing_access"/);
  assert.match(select.text, /"id" AS user_id/);
  assert.match(select.text, /"is_pro" AS is_pro/);
  assert.match(select.text, /"seat_count" AS seats/);
  assert.match(select.text, /"stripe_customer_id" AS stripe_customer_id/);
  assert.doesNotMatch(select.text, /\bUPDATE\b/i);
  assert.doesNotMatch(select.text, /\bINSERT\b/i);
  assert.doesNotMatch(select.text, /\bDELETE\b/i);
  assert.doesNotMatch(select.text, /search_path/i);
});

test("schema is required and an empty rail is not disabled", () => {
  assert.throws(() => parseMapping(example.replace("schema: billing\n", "")), (error: unknown) => {
    return error instanceof MappingError && error.code === "missing_schema";
  });
  assert.throws(
    () => parseMapping(example.replace("customer_id: stripe_customer_id", 'customer_id: ""')),
    (error: unknown) => error instanceof MappingError
  );
  assert.throws(
    () =>
      parseMapping(
        example
          .replace("customer_id: stripe_customer_id", "customer_id: null")
          .replace("customer_id: polar_customer_id", "customer_id: null")
      ),
    (error: unknown) => error instanceof MappingError && error.code === "zero_enabled_rails"
  );
  assert.throws(() => parseMapping(example.replace("schema: billing", "schema: billing.secret")), MappingError);
});

test("booleans and seats are not coerced", () => {
  assert.equal(normalizeIsPro(true), true);
  assert.equal(normalizeIsPro(false), false);
  assert.equal(normalizeIsPro(null), null);
  assert.equal(normalizeIsPro("true"), null);
  assert.equal(normalizeIsPro(1), null);
  assert.equal(normalizeSeats(null), null);
  assert.equal(normalizeSeats(0), 0);
  assert.throws(() => normalizeSeats("0"), /seats_not_numeric/);

  const row = normalizeProductRow(
    {
      user_id: "u1",
      is_pro: false,
      seats: null,
      stripe_customer_id: "cus_1",
      stripe_subscription_id: null,
    },
    true,
    false
  );
  assert.equal(row.isPro, false);
  assert.equal(row.seats, null);
  assert.equal(row.polarCustomerId, null);
});

// LaunchGate re-review P4 items fixed in round 2b:
//  ST-R1: unknown mapping keys (a typo such as `statuses: { unpiad: skip }`) were silently ignored.
//         Every level of the mapping now refuses keys it does not know.
//  ST-R2: the READ ONLY product transaction had no committed test.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import pg from "pg";

import { MappingError, parseMapping } from "../src/mapping.js";
import { readProductRows, selectReadOnly } from "../src/productDb.js";

const example = readFileSync(path.join(process.cwd(), "mapping.example.yaml"), "utf8");
const unknownKey = (yaml: string) => {
  try {
    parseMapping(yaml);
  } catch (error) {
    assert.ok(error instanceof MappingError);
    assert.equal(error.code, "mapping_unknown_key");
    return error.detail;
  }
  assert.fail("expected mapping_unknown_key");
};

test("ST-R1: a typo under statuses is refused, not ignored", () => {
  assert.equal(unknownKey(example + "statuses:\n  unpiad: skip\n"), "statuses.unpiad");
  assert.equal(unknownKey(example + "statuses:\n  unpaid: skip\n  past_due: canceled\n"), "statuses.past_due");
});

test("ST-R1: unknown keys are refused at every level of the mapping", () => {
  assert.equal(unknownKey(example + "statues:\n  unpaid: skip\n"), "statues");
  assert.equal(unknownKey(example.replace("  engine: postgres\n", "  engine: postgres\n  search_path: public\n")), "product.search_path");
  assert.equal(unknownKey(example.replace("    seats: seat_count\n", "    seats: seat_count\n    email: email\n")), "product.columns.email");
  assert.equal(unknownKey(example.replace("rails:\n", "rails:\n  paddle:\n    customer_id: x\n")), "rails.paddle");
  assert.equal(unknownKey(example.replace("    customer_id: stripe_customer_id\n", "    custmer_id: stripe_customer_id\n    customer_id: stripe_customer_id\n")), "rails.stripe.custmer_id");
  assert.equal(unknownKey(example.replace("    customer_id: polar_customer_id\n", "    customer_id: polar_customer_id\n    org_id: x\n")), "rails.polar.org_id");
  assert.equal(unknownKey(example.replace("  field: is_pro\n", "  field: is_pro\n  seats: true\n")), "entitlement.seats");
});

test("ST-R1: the example and a valid statuses block still parse", () => {
  assert.equal(parseMapping(example).statuses.unpaid, "canceled");
  assert.equal(parseMapping(example + "statuses:\n  unpaid: skip\n").statuses.unpaid, "skip");
});

test("ST-R2: the product SELECT runs inside BEGIN READ ONLY … COMMIT", async () => {
  const seen: string[] = [];
  const rows = await selectReadOnly({ query: async (text) => (seen.push(text), { rows: text.startsWith("SELECT") ? [{ id: "u1" }] : [] }) }, "SELECT 1");
  assert.deepEqual(seen, ["BEGIN READ ONLY", "SELECT 1", "COMMIT"]);
  assert.deepEqual(rows, [{ id: "u1" }]);
  const failed: string[] = [];
  await assert.rejects(selectReadOnly({ query: async (text) => { failed.push(text); if (text === "SELECT boom") throw new Error("boom"); return { rows: [] }; } }, "SELECT boom"));
  assert.deepEqual(failed, ["BEGIN READ ONLY", "SELECT boom", "ROLLBACK"]);
});

// Needs a Postgres the test may create objects in. CI has none for this repo; the run is recorded locally.
const url = process.env.SEATTRUTH_TEST_DATABASE_URL;
test("ST-R2 (Postgres): a mapped view whose column writes is refused by the read-only transaction", { skip: !url && "SEATTRUTH_TEST_DATABASE_URL not set" }, async () => {
  const schema = `st_r2_${process.pid}`;
  const admin = new pg.Client({ connectionString: url });
  await admin.connect();
  try {
    await admin.query(`CREATE SCHEMA ${schema}`);
    await admin.query(`CREATE TABLE ${schema}.writes (n int)`);
    await admin.query(`CREATE TABLE ${schema}.users (id text, is_pro boolean, seat_count int, stripe_customer_id text, stripe_subscription_id text, polar_customer_id text, polar_subscription_id text)`);
    await admin.query(`INSERT INTO ${schema}.users VALUES ('u1', true, 1, 'cus_1', NULL, NULL, NULL)`);
    await admin.query(`CREATE FUNCTION ${schema}.log_read() RETURNS boolean LANGUAGE plpgsql VOLATILE AS $$ BEGIN INSERT INTO ${schema}.writes VALUES (1); RETURN true; END $$`);
    await admin.query(`CREATE VIEW ${schema}.access AS SELECT id, (is_pro AND ${schema}.log_read()) AS is_pro, seat_count, stripe_customer_id, stripe_subscription_id, polar_customer_id, polar_subscription_id FROM ${schema}.users`);
    const dir = mkdtempSync(path.join(tmpdir(), "st-r2-"));
    const writing = path.join(dir, "writing.yaml");
    writeFileSync(writing, example.replace("schema: billing", `schema: ${schema}`).replace("relation: billing_access", "relation: access"));
    await assert.rejects(readProductRows({ connectionString: url!, mappingPath: writing }), /read-only transaction/);
    assert.equal((await admin.query(`SELECT count(*)::int AS n FROM ${schema}.writes`)).rows[0].n, 0);
    // Control: the plain table reads fine through the same path.
    const plain = path.join(dir, "plain.yaml");
    writeFileSync(plain, example.replace("schema: billing", `schema: ${schema}`).replace("relation: billing_access", "relation: users"));
    const rows = await readProductRows({ connectionString: url!, mappingPath: plain });
    assert.equal(rows.length, 1);
  } finally {
    await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await admin.end();
  }
});

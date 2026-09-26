import { Client } from "pg";

import { MappingError, buildProductSelect, loadMapping } from "./mapping.js";
import type { ProductRow } from "./invariants.js";

/**
 * Read-only product database.
 *
 * One SELECT of the mapped columns on one schema and relation (P18, P19).
 * SQL NULL seats stay null. Booleans are not coerced (P11, P20).
 * Never UPDATE, INSERT, or DELETE.
 */

/** Mirrors mapping.example.yaml. */
export type MappingDocument = {
  version: 1;
  product: {
    engine: "postgres";
    schema: string;
    relation: string;
    columns: {
      user_id: string;
      is_pro: string;
      seats: string;
    };
  };
  rails: {
    stripe: {
      customer_id: string | null;
      subscription_id: string | null;
    };
    polar: {
      customer_id: string | null;
      subscription_id: string | null;
    };
  };
  entitlement: {
    field: "is_pro";
  };
};

export type ProductDbReadInput = {
  connectionString: string;
  mappingPath: string;
};

export class ProductReadError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = "ProductReadError";
    this.code = code;
  }
}

function cellString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "string") {
    throw new ProductReadError("customer_id_not_text");
  }
  return value === "" ? "" : value;
}

/** is_pro stays null when the SQL value is not a real boolean (P11). */
export function normalizeIsPro(value: unknown): boolean | null {
  if (value === true || value === false) {
    return value;
  }
  return null;
}

export function normalizeSeats(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ProductReadError("seats_not_numeric");
  }
  return value;
}

export function normalizeProductRow(
  row: Record<string, unknown>,
  stripeEnabled: boolean,
  polarEnabled: boolean
): ProductRow {
  if (typeof row.user_id !== "string" || row.user_id === "") {
    throw new ProductReadError("user_id_missing");
  }
  if (!("is_pro" in row) || !("seats" in row)) {
    throw new ProductReadError("seats_column_missing");
  }
  return {
    userId: row.user_id,
    isPro: normalizeIsPro(row.is_pro),
    seats: normalizeSeats(row.seats),
    stripeCustomerId: stripeEnabled ? cellString(row.stripe_customer_id) : null,
    stripeSubscriptionId:
      stripeEnabled && "stripe_subscription_id" in row ? cellString(row.stripe_subscription_id) : null,
    polarCustomerId: polarEnabled ? cellString(row.polar_customer_id) : null,
    polarSubscriptionId:
      polarEnabled && "polar_subscription_id" in row ? cellString(row.polar_subscription_id) : null,
  };
}

export async function readProductRows(input: ProductDbReadInput): Promise<readonly ProductRow[]> {
  if (input.connectionString.trim() === "" || input.mappingPath.trim() === "") {
    throw new Error("Missing product database settings. Refusing to query.");
  }
  let mapping;
  try {
    mapping = loadMapping(input.mappingPath);
  } catch (error) {
    if (error instanceof MappingError) {
      throw error;
    }
    throw new ProductReadError("mapping_unreadable");
  }
  const select = buildProductSelect(mapping);
  if (!select.text.startsWith("SELECT ") || /\b(UPDATE|INSERT|DELETE|DROP|ALTER)\b/i.test(select.text)) {
    throw new ProductReadError("product_sql_refused");
  }
  const client = new Client({ connectionString: input.connectionString });
  await client.connect();
  try {
    const result = await client.query(select.text);
    const stripeEnabled = mapping.rails.stripe.customer_id !== null;
    const polarEnabled = mapping.rails.polar.customer_id !== null;
    return result.rows.map((row: Record<string, unknown>) =>
      normalizeProductRow(row, stripeEnabled, polarEnabled)
    );
  } finally {
    await client.end();
  }
}

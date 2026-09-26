import { NotImplementedError } from "./invariants.js";
import type { ProductRow } from "./invariants.js";

/**
 * Read-only product database.
 *
 * Invariants:
 * - One SELECT of the mapped columns on one Postgres schema and relation.
 * - schema, relation, and column names match /^[A-Za-z_][A-Za-z0-9_]*$/
 *   and are 1–63 characters. Quote each identifier after validation.
 *   Never paste the raw YAML into SQL. Do not trust search_path (P18).
 * - One mapping file is one tenant and one database (P19).
 * - SQL NULL seats stay null. Do not coerce NULL to 0 (P11, P20).
 * - Never UPDATE, INSERT, DELETE, or change is_pro / seats.
 * - The connection string must be a SELECT-only role. The tool does not
 *   escalate privileges and does not open a second connection for writes.
 * - TODO(implement): not in DR#3. Next is the 4th DR with LaunchGate APPROVE.
 *   Rules: docs/MVP_SCOPE.md (P11, P17, P18, P20).
 */

/** Mirrors mapping.example.yaml. The loader is not implemented. */
export type MappingDocument = {
  version: 1;
  product: {
    engine: "postgres";
    /** Required. One unquoted identifier. Missing schema is a run error (P18). */
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

export async function readProductRows(
  input: ProductDbReadInput
): Promise<readonly ProductRow[]> {
  if (input.connectionString.trim() === "" || input.mappingPath.trim() === "") {
    throw new Error("Missing product database settings. Refusing to query.");
  }
  throw new NotImplementedError(
    "Product database read is not implemented. Refusing to query. No entitlement writes."
  );
}

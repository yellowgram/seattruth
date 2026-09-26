import { NotImplementedError } from "./invariants.js";
import type { ProductRow } from "./invariants.js";

/**
 * Read-only product database.
 *
 * Invariants:
 * - One SELECT of the mapped columns on one Postgres relation.
 * - Identifiers in the mapping file must match /^[A-Za-z_][A-Za-z0-9_]*$/.
 * - The mapping file is not SQL. No statement text from the operator.
 * - Never UPDATE, INSERT, DELETE, or change is_pro / seats.
 * - The connection string must be a SELECT-only role. The tool does not
 *   escalate privileges and does not open a second connection for writes.
 * - TODO(implement): not in DR#1. Wait for DR×3, then a 4th DR with LaunchGate APPROVE. Do not wait on the founder for that ordinary gate.
 *   Rules: docs/MVP_SCOPE.md (P1, P5, P8).
 */

/** Mirrors mapping.example.yaml. The loader is not implemented. */
export type MappingDocument = {
  version: 1;
  product: {
    engine: "postgres";
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

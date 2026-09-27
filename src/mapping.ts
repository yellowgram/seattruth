import { readFileSync } from "node:fs";

import { parse } from "yaml";

import type { MappingDocument } from "./productDb.js";

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

export class MappingError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = "MappingError";
    this.code = code;
  }
}

export function isIdentifier(value: string): boolean {
  return value.length >= 1 && value.length <= 63 && IDENT.test(value);
}

/** Quote only after isIdentifier. The value is never interpolated raw (P18). */
export function quoteIdent(value: string): string {
  if (!isIdentifier(value)) {
    throw new MappingError("invalid_identifier");
  }
  return `"${value}"`;
}

function identField(value: unknown, code: string): string {
  if (typeof value !== "string" || !isIdentifier(value)) {
    throw new MappingError(code);
  }
  return value;
}

/** YAML null disables a rail. An empty string is a config error (P21). */
function railColumn(value: unknown, code: string): string | null {
  if (value === null) {
    return null;
  }
  if (typeof value !== "string" || value.trim() === "") {
    throw new MappingError(code);
  }
  return identField(value, code);
}

export function parseMapping(raw: string): MappingDocument {
  const doc: unknown = parse(raw);
  if (doc === null || typeof doc !== "object" || Array.isArray(doc)) {
    throw new MappingError("mapping_not_object");
  }
  const root = doc as Record<string, unknown>;
  if (root.version !== 1) {
    throw new MappingError("mapping_version");
  }
  const product = root.product;
  if (product === null || typeof product !== "object" || Array.isArray(product)) {
    throw new MappingError("mapping_product");
  }
  const p = product as Record<string, unknown>;
  if (p.engine !== "postgres") {
    throw new MappingError("mapping_engine");
  }
  if (p.schema === undefined || p.schema === null) {
    throw new MappingError("missing_schema");
  }
  const columns = p.columns;
  if (columns === null || typeof columns !== "object" || Array.isArray(columns)) {
    throw new MappingError("mapping_columns");
  }
  const c = columns as Record<string, unknown>;
  const rails = root.rails;
  if (rails === null || typeof rails !== "object" || Array.isArray(rails)) {
    throw new MappingError("mapping_rails");
  }
  const r = rails as Record<string, unknown>;
  const stripe = r.stripe;
  const polar = r.polar;
  if (stripe === null || typeof stripe !== "object" || Array.isArray(stripe)) {
    throw new MappingError("mapping_stripe");
  }
  if (polar === null || typeof polar !== "object" || Array.isArray(polar)) {
    throw new MappingError("mapping_polar");
  }
  const entitlement = root.entitlement;
  if (entitlement === null || typeof entitlement !== "object" || Array.isArray(entitlement)) {
    throw new MappingError("mapping_entitlement");
  }
  const field = (entitlement as Record<string, unknown>).field;
  if (field !== "is_pro") {
    throw new MappingError("entitlement_field");
  }
  const stripeRail = stripe as Record<string, unknown>;
  const polarRail = polar as Record<string, unknown>;
  const mapping: MappingDocument = {
    version: 1,
    product: {
      engine: "postgres",
      schema: identField(p.schema, "invalid_identifier"),
      relation: identField(p.relation, "invalid_identifier"),
      columns: {
        user_id: identField(c.user_id, "invalid_identifier"),
        is_pro: identField(c.is_pro, "invalid_identifier"),
        seats: identField(c.seats, "missing_seats_column"),
      },
    },
    rails: {
      stripe: {
        customer_id: railColumn(stripeRail.customer_id, "stripe_customer_id"),
        subscription_id: railColumn(stripeRail.subscription_id, "stripe_subscription_id"),
      },
      polar: {
        customer_id: railColumn(polarRail.customer_id, "polar_customer_id"),
        subscription_id: railColumn(polarRail.subscription_id, "polar_subscription_id"),
      },
    },
    entitlement: { field: "is_pro" },
  };
  if (mapping.rails.stripe.customer_id === null && mapping.rails.polar.customer_id === null) {
    throw new MappingError("zero_enabled_rails");
  }
  return mapping;
}

export function loadMapping(path: string): MappingDocument {
  return parseMapping(readFileSync(path, "utf8"));
}

export type ProductSelect = {
  text: string;
};

/**
 * One SELECT. Identifiers are validated then quoted. No other SQL (P18).
 * The product subscription id is selected when mapped and is not a filter.
 */
export function buildProductSelect(mapping: MappingDocument): ProductSelect {
  const cols = [
    `${quoteIdent(mapping.product.columns.user_id)} AS user_id`,
    `${quoteIdent(mapping.product.columns.is_pro)} AS is_pro`,
    `${quoteIdent(mapping.product.columns.seats)} AS seats`,
  ];
  const stripeCustomer = mapping.rails.stripe.customer_id;
  const polarCustomer = mapping.rails.polar.customer_id;
  if (stripeCustomer !== null) {
    cols.push(`${quoteIdent(stripeCustomer)} AS stripe_customer_id`);
  }
  const stripeSub = mapping.rails.stripe.subscription_id;
  if (stripeCustomer !== null && stripeSub !== null) {
    cols.push(`${quoteIdent(stripeSub)} AS stripe_subscription_id`);
  }
  if (polarCustomer !== null) {
    cols.push(`${quoteIdent(polarCustomer)} AS polar_customer_id`);
  }
  const polarSub = mapping.rails.polar.subscription_id;
  if (polarCustomer !== null && polarSub !== null) {
    cols.push(`${quoteIdent(polarSub)} AS polar_subscription_id`);
  }
  const from = `${quoteIdent(mapping.product.schema)}.${quoteIdent(mapping.product.relation)}`;
  return { text: `SELECT ${cols.join(", ")} FROM ${from}` };
}

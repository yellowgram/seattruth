import { IncompleteReadError, ProviderHttpError, getJson } from "../http.js";
import type { FetchLike } from "../http.js";
import type { ProviderSubscriptionSnapshot } from "../invariants.js";
import { classifyStatus } from "../rules.js";

/**
 * Read-only Polar snapshot.
 *
 * Scope: subscriptions:read only.
 * https://polar.sh/docs/api-reference/subscriptions/list
 * The OAT page says to select scopes in the token UI and does not list the strings:
 * https://polar.sh/docs/integrate/oat
 *
 * Pagination (P27): GET /v1/subscriptions?limit=100&page={n}
 * Response pagination.total_count and pagination.max_page.
 * A complete read is pages 1..max_page whose item count equals total_count.
 * Stopping early is a run error, not an empty customer.
 * No status filter, so canceled subscriptions stay in the list.
 * The deprecated `active` query flag is not sent.
 *
 * Classification uses subscription status only. Order and refund objects are not read.
 * cancel_at_period_end does not change status active (P26).
 */

const POLAR_API = "https://api.polar.sh";
const PAGE_LIMIT = 100;
const MAX_PAGES = 10000;

export type PolarReadInput = {
  restrictedToken: string;
  fetchImpl?: FetchLike;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

export async function readPolarSnapshot(
  input: PolarReadInput
): Promise<readonly ProviderSubscriptionSnapshot[]> {
  if (input.restrictedToken.trim() === "") {
    throw new Error("Missing Polar restricted token. Refusing to call Polar.");
  }
  const fetchImpl = input.fetchImpl ?? fetch;
  const items: Record<string, unknown>[] = [];
  let expectedTotal: number | null = null;
  let maxPage = 1;

  try {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_LIMIT));
      params.set("page", String(page));
      const body = asRecord(
        await getJson(fetchImpl, "polar", `${POLAR_API}/v1/subscriptions?${params.toString()}`, {
          Authorization: `Bearer ${input.restrictedToken}`,
        })
      );
      const pagination = asRecord(body?.pagination);
      const pageItems = body?.items;
      if (
        !pagination ||
        typeof pagination.total_count !== "number" ||
        typeof pagination.max_page !== "number" ||
        !Array.isArray(pageItems)
      ) {
        throw new IncompleteReadError("polar");
      }
      if (expectedTotal === null) {
        expectedTotal = pagination.total_count;
        maxPage = pagination.max_page;
      } else if (pagination.total_count !== expectedTotal || pagination.max_page !== maxPage) {
        throw new IncompleteReadError("polar");
      }
      for (const entry of pageItems) {
        const record = asRecord(entry);
        if (!record) {
          throw new IncompleteReadError("polar");
        }
        items.push(record);
      }
      if (maxPage === 0 || page >= maxPage) {
        break;
      }
      if (page === MAX_PAGES) {
        throw new IncompleteReadError("polar");
      }
    }
  } catch (error) {
    if (error instanceof IncompleteReadError || error instanceof ProviderHttpError) {
      throw error;
    }
    throw new IncompleteReadError("polar");
  }

  if (expectedTotal === null || items.length !== expectedTotal) {
    throw new IncompleteReadError("polar");
  }

  const snapshots: ProviderSubscriptionSnapshot[] = [];
  for (const item of items) {
    if (typeof item.id !== "string" || typeof item.customer_id !== "string" || typeof item.status !== "string") {
      throw new IncompleteReadError("polar");
    }
    snapshots.push({
      provider: "polar",
      customerId: item.customer_id,
      subscriptionId: item.id,
      bucket: classifyStatus(item.status, "none"),
    });
  }
  return snapshots;
}

/**
 * GET-only JSON helper. Provider modules must not call anything else.
 * The Slack webhook is the only POST, and it lives in slack.ts.
 */

export type FetchLike = typeof fetch;

export class ProviderHttpError extends Error {
  readonly code: string;

  constructor(provider: string, status: number) {
    const code = `${provider}_http_${status}`;
    super(code);
    this.name = "ProviderHttpError";
    this.code = code;
  }
}

export class IncompleteReadError extends Error {
  readonly code: string;

  constructor(provider: string) {
    const code = `${provider}_incomplete_read`;
    super(code);
    this.name = "IncompleteReadError";
    this.code = code;
  }
}

/** How many times a 429 is retried before the read fails. */
export const RATE_LIMIT_RETRIES = 4;
/** Longest Retry-After SeatTruth will wait. A longer one fails the read. */
export const MAX_RETRY_AFTER_SECONDS = 60;

let sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Tests replace the timer so a retried 429 does not wait in real time. */
export function setSleepForTests(fn: (ms: number) => Promise<void>): void {
  sleep = fn;
}

/**
 * Seconds to wait before retrying a 429: the Retry-After header (seconds or an
 * HTTP date) when present, else 1, 2, 4, 8. null means do not retry.
 */
export function retryDelaySeconds(retryAfter: string | null, attempt: number, now = Date.now()): number | null {
  let seconds = 2 ** attempt;
  if (retryAfter !== null && retryAfter.trim() !== "") {
    const value = retryAfter.trim();
    if (/^\d+$/.test(value)) {
      seconds = Number(value);
    } else {
      const at = Date.parse(value);
      if (Number.isNaN(at)) {
        return null;
      }
      seconds = Math.max(0, Math.ceil((at - now) / 1000));
    }
  }
  return seconds > MAX_RETRY_AFTER_SECONDS ? null : seconds;
}

export async function getJson(
  fetchImpl: FetchLike,
  provider: string,
  url: string,
  headers: Record<string, string>
): Promise<unknown> {
  for (let attempt = 0; ; attempt += 1) {
    let response: Response;
    try {
      response = await fetchImpl(url, { method: "GET", redirect: "error", headers });
    } catch {
      throw new ProviderHttpError(provider, 0);
    }
    if (response.status === 429 && attempt < RATE_LIMIT_RETRIES) {
      const delay = retryDelaySeconds(response.headers?.get("retry-after") ?? null, attempt);
      if (delay !== null) {
        await sleep(delay * 1000);
        continue;
      }
    }
    if (!response.ok) {
      throw new ProviderHttpError(provider, response.status);
    }
    try {
      return await response.json();
    } catch {
      throw new IncompleteReadError(provider);
    }
  }
}

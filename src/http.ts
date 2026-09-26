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

export async function getJson(
  fetchImpl: FetchLike,
  provider: string,
  url: string,
  headers: Record<string, string>
): Promise<unknown> {
  let response: { ok: boolean; status: number; json: () => Promise<unknown> };
  try {
    response = await fetchImpl(url, { method: "GET", headers });
  } catch {
    throw new ProviderHttpError(provider, 0);
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

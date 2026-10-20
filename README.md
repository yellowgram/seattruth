# SeatTruth

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Find the customers whose access does not match their billing. SeatTruth reads your Stripe and/or Polar subscriptions and one table or view in your Postgres, and reports exactly two kinds of disagreement:

1. **`paid_locked_out`** — the customer is paying, and your database says `is_pro = false`.
2. **`canceled_still_entitled`** — every subscription the customer had is canceled, and your database says `is_pro = true`.

Everything else is silence. It is read-only: it never charges, refunds, writes to Stripe, Polar or your database, and there is no auto-fix. You run this, on your own schedule, with your own keys; yellowgram does not operate a hosted endpoint for it. MIT licensed.

## Five-minute quickstart (no keys)

Node.js 20 or newer.

```bash
npx seattruth --dry-run        # or: git clone https://github.com/yellowgram/seattruth && cd seattruth && npm ci
npm run demo                   # in a clone: both findings and a match, on invented rows
```

The demo compares invented Stripe and Polar subscriptions against invented rows and prints:

```text
SeatTruth paid_locked_out user=user-locked provider=stripe customer=cus_demo_locked subscription=sub_demo_locked is_pro=false seats=2
SeatTruth canceled_still_entitled user=user-canceled provider=polar customer=cus_demo_canceled subscription=sub_demo_canceled is_pro=true seats=1
SeatTruth silence on match: user=user-paid-match stripe=paid polar=paid is_pro=true no finding
```

`--dry-run` reads no keys and opens no connections. It exits 0, and that is never an all-clear.

## Run it on your data

You need:

1. **Stripe** (optional): a restricted key (`rk_…`) with **read** on Subscriptions, Invoices and Charges. Secret keys (`sk_…`) are refused before any request.
2. **Polar** (optional): an Organization Access Token with `subscriptions:read` only (Settings → Developers → New Token).
3. **Postgres**: one table or view with a user id, `is_pro`, seats, and the Stripe and/or Polar customer id per user, and a role that can only `SELECT` it.
4. **Slack** (optional): an incoming webhook. SeatTruth posts only when there is a finding, an ambiguous count, or a run error. It never posts an "all clear".

Copy [`.env.example`](.env.example) to `.env` and [`mapping.example.yaml`](mapping.example.yaml) to `mapping.yaml`, fill them in, then:

```bash
npx seattruth --live
```

To run it daily, copy this repository and use the included workflow ([`.github/workflows/compare.yml`](.github/workflows/compare.yml)): store the same values as Actions secrets, plus the mapping file text as `SEATTRUTH_MAPPING_YAML`. The cron runs live at 06:00 UTC once that secret is set, and skips (exit 0, not an all-clear) until then. A manual run stays a dry run unless you set `dry_run` to false. Or call `npx seattruth --live` from the CI you already have.

### Reading a result

```text
SeatTruth paid_locked_out user=user-1 provider=stripe customer=cus_… subscription=sub_… is_pro=false seats=1
SeatTruth ambiguous_users=4
SeatTruth skipped_users=12
SeatTruth run_error=product_query_failed
```

| Exit | Meaning |
| --- | --- |
| `0` | Live run read everything and found nothing to report. |
| `2` | Live run finished, and there are findings or ambiguous users. |
| `1` | Run error (bad mapping, unreadable provider, database failure, missing secret). Nothing was decided. |

- **Ambiguous users** could not be classified safely (for example: a fully refunded or disputed latest Stripe invoice, a customer id with no subscriptions, `is_pro` that is not a real boolean). They block exit 0. They are a count, never a list.
- **Skipped users** are in a trial, an unfinished first payment, `past_due` or `paused`. Products differ on access during those states, so SeatTruth makes no claim. Printed locally, not posted to Slack.
- Alerts name the disagreement and the ids. They never say what to change.

## How it decides

Each subscription gets one bucket: **paid** (`active`), **canceled** (`canceled`, and `unpaid` unless your mapping sets `statuses.unpaid: skip`), **skipped** (trials, incomplete, `past_due`, `paused`), or **ambiguous** (anything else). Per user and provider, paid wins; otherwise any ambiguity wins. A user with both a paid and a canceled provider is still paid. Full rules and the edge-case table: [docs/RULES.md](docs/RULES.md).

Stripe refunds follow a **latest-period rule**: only the subscription's latest invoice matters. A full refund or any dispute there (open, won or lost) makes the user ambiguous until the next invoice. A partial refund, or a refund on an older invoice, does not. A `$0` latest invoice (a 100% coupon) is paid.

Stripe is read with one list call per 100 subscriptions (`expand[]=data.latest_invoice.charge`), with `Stripe-Version: 2025-02-24.acacia` pinned so your account's default API version cannot change what is read. Polar is read page by page. A rate limit (HTTP 429) is retried up to four times, honouring `Retry-After` up to 60 seconds. Any incomplete read is a run error, never "no subscription".

## Limits

What a clean run does **not** prove: [docs/WHAT_THIS_WILL_NOT_CATCH.md](docs/WHAT_THIS_WILL_NOT_CATCH.md). In short:

- Any `active` subscription counts as paid: no price, product or quantity filter. Seats are reported, never compared.
- A Polar refund does not end a Polar subscription and is not read. Only status `canceled` is.
- An empty table or view that was read successfully can finish with exit 0.
- One Postgres relation, one mapping, Stripe and Polar only. No webhooks, no history, no snooze or ignore list.

## Threat model

- **Keys.** Restricted, read-only keys only; `sk_` is refused. Keys, tokens, database URLs and webhook URLs are never logged or posted. Every provider call is a `GET` with redirects refused.
- **Your database.** One `SELECT` of the mapped columns. Identifiers are validated against `^[A-Za-z_][A-Za-z0-9_]*$` and quoted; the mapping holds no SQL. The SELECT runs in a `READ ONLY` transaction, so even a mapped view that calls a writing function is refused by Postgres. Use a role that cannot write anyway. A mapping key SeatTruth doesn't know (a typo such as `statuses.unpiad`) is a run error (`mapping_unknown_key: statuses.unpiad`), never ignored.
- **Slack.** Only an allow-listed set of fields (case, user id, provider, customer id, subscription id, `is_pro`, seats). No emails, names or card data.
- **Not defended:** a compromised machine running SeatTruth (it holds your read keys), or a mapping that points at the wrong relation.

## Support and security

Best-effort GitHub Issues, no SLA: [SUPPORT.md](SUPPORT.md). Vulnerabilities: [SECURITY.md](SECURITY.md), not Issues. Changes: [CHANGELOG.md](CHANGELOG.md). Contact hello@yellowgram.dev · www.yellowgram.dev.

## License

MIT. See [LICENSE](LICENSE). Releases before 0.2.0 (tags `v0.1.0`, `v0.1.1`) were published under the previous license; 0.2.0 and later are MIT. Their digests: [docs/CHECKSUMS.md](docs/CHECKSUMS.md).

---

Part of yellowgram open source tools: https://www.yellowgram.dev/oss

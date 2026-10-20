# Changelog

## 0.3.0 — 2026-10-19

- **`unpaid` counts as canceled.** Stripe's guidance is to revoke access when a subscription becomes `unpaid`, so a user still marked `is_pro` is reported as `canceled_still_entitled`. Set `statuses.unpaid: skip` in the mapping to keep the old behaviour.
- An invoice paid outside Stripe (`paid_out_of_band`) is paid, not ambiguous.
- Provider requests time out after 30 seconds (a failed read, exit 2) instead of hanging.
- The product query runs in a `READ ONLY` transaction.
- `npm pack` builds `dist` first, so a fresh clone packs a working package.

- **Stripe: one account-wide read.** Subscriptions are listed with `expand[]=data.latest_invoice.charge`, one call per 100 subscriptions. 0.2.0 listed every invoice of every active subscription (1 + N calls, plus one per unexpanded charge), which rate-limited large accounts.
- **Latest-period refund rule.** Only the latest invoice of an active subscription is checked. A full refund or a dispute there is ambiguous; a partial refund, a refund on an older invoice, or a $0 invoice is paid. In 0.2.0 any refund ever, even a $1 goodwill refund years ago, kept a paying customer ambiguous forever and every run exiting 2.
- **Pinned `Stripe-Version: 2025-02-24.acacia`.** Accounts whose default version is 2025-03-31 or later no longer return `invoice.charge`, which made every active subscription ambiguous.
- **Rate limits.** HTTP 429 from Stripe or Polar is retried up to four times, honouring `Retry-After` (seconds or HTTP date, up to 60 s), else backing off 1–8 s.
- **`past_due`, `unpaid`, `paused` are skipped** like trials instead of ambiguous, so a normal dunning queue does not fail every run. Live runs print `SeatTruth skipped_users=N` locally.
- The dry-run line now reads `SeatTruth dry-run: no keys read, no network calls. This is not an all-clear. …` instead of reporting build status.
- Docs: new README with a five-minute quickstart, limits and threat model; rules in plain words in `docs/RULES.md`. Internal planning docs (`MVP_SCOPE`, `ACCEPTANCE_NOTES`, `STATUS`, `LIVE_OPERATOR_LOOP`, `DEMO_60S`, `START_HERE`) and internal rule codes in comments and test names were removed. `SECURITY.md` no longer calls this a private repository.

## 0.2.0 — 2026-10-19

- Relicensed to MIT; no longer sold. `LICENSE` is the MIT License (Copyright (c) 2026 yellowgram). The commercial grant, Polar delivery packet, price and refund copy, release pack script, competitive skim, and design/code review packets were removed from the tree (they remain in git history). `BUYER_START_HERE.md` is now `START_HERE.md`.
- npm entry points: `bin` `seattruth` → `dist/src/cli.js` and `main` `dist/src/index.js`. The CLI now resolves symlinked bin paths when deciding it was run directly; compare behavior is unchanged.
- package.json: `license` MIT, no longer `private`, adds `homepage`, `bugs`, `author`, and `files`.
- Tests: the PolyForm license and sales-copy assertions are replaced by MIT assertions. Historical zips are still checked byte-for-byte.
- Releases before 0.2.0 were published under the previous license.

## 0.1.1 — 2026-09-27

License change only; detector behavior is unchanged from 0.1.0. Published under the previous license (PolyForm Noncommercial 1.0.0 with a separate commercial grant). Release zip `seattruth-0.1.1.zip`, tag `v0.1.1`, SHA-256 `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6` (also in `docs/CHECKSUMS.md`).

## 0.1.0 — 2026-09-26

First release of the read-only detector, under the previous license.

- Dual-rail compare of Stripe and Polar against product `is_pro` and seats. Two findings only: `paid_locked_out` and `canceled_still_entitled`. A match is silence. A dry run is not an all-clear.
- No auto-fix, no writes to Stripe, Polar or the product database, no charges.
- Release zip `seattruth-0.1.0.zip`, tag `v0.1.0`; SHA-256 in `docs/CHECKSUMS.md`.

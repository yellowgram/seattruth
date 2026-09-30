# SeatTruth

Source-available kit (zip + docs). You run this. yellowgram does not operate a hosted endpoint for this SKU. Reconcile Stripe and Polar against product `is_pro` / seats. Report the mismatch.

Polar delivers **`seattruth-0.1.1.zip`** (SHA-256 `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6`). Tag `v0.1.0` / `release/seattruth-0.1.0.zip` stay sealed as the prior GitHub Release only. They are not what Polar delivers now.

Product page (Paid catalog demoted 2026-09-30; Polar checkout stays quiet): [www.yellowgram.dev/seattruth](https://www.yellowgram.dev/seattruth) or hello@yellowgram.dev. This repository has no Checkout URL. Start here as an operator: [BUYER_START_HERE.md](BUYER_START_HERE.md).

## What it is

The read-only detector: one organization, one mapping file, restricted keys, a scheduled GitHub Action, and a Slack alert. Two disagreements only:

1. Paid on an applicable rail, no applicable rail ambiguous, and `is_pro` false.
2. Status `canceled` on every applicable rail, and `is_pro` true. A Polar refund is not this case. Stripe `active` with any refund is not this case.

A match is silence. A dry-run is not an all-clear. The kit does not charge, write `is_pro`, or auto-fix. Limits a green run still does not prove: [docs/WHAT_THIS_WILL_NOT_CATCH.md](docs/WHAT_THIS_WILL_NOT_CATCH.md).

## What stays out

- Billing platform, Stripe mirror, and enterprise audit practice.
- Charges, refunds, Checkout, and writes to Stripe, Polar, or the product database.
- Auto-fix, and alert text that tells an operator to flip a flag.
- Coupons, cold invoices, and a Checkout URL in this repository.

## Who it is for

Global English. Indie and small SaaS operators who already bill on Stripe, Polar, or both, and who store access in their own database. Docs and support are in English. Qualification calls, audit PDFs, and high-ticket monitors are outside this product. See [docs/COMPETITIVE_SKIM.md](docs/COMPETITIVE_SKIM.md).

## Price

**$99 once** per organization (one-time, not monthly). First 10 organizations: **$79 once** on the same SKU. Refund **14 days** for the SeatTruth purchase. The kit does not recommend end-customer refunds. Digests: [docs/CHECKSUMS.md](docs/CHECKSUMS.md).

## Paid delta

Without a purchase, [LICENSE](LICENSE) is PolyForm Noncommercial 1.0.0 only (source-available; not an OSI-approved license). Paying for SeatTruth buys the [SeatTruth commercial grant](docs/COMMERCIAL_GRANT.md) for **one organization** and the **named tag** delivered with that purchase, plus the Polar zip and private-repo access when that access is granted outside Polar’s GitHub benefit. Legal seller: Suthirth Solutions, operating as yellowgram. Contact hello@yellowgram.dev.

## Quick start

Node.js 20 or newer. `npm run demo` is the sealed fixture demo (no live Stripe, Polar, Slack, or database keys).

```bash
npm ci
npm run demo
```

A dry-run is not a clean bill of health. This sealed demo is not an all-clear. Watch: [www.yellowgram.dev/seattruth](https://www.yellowgram.dev/seattruth). Proof lines: [docs/DEMO_60S.md](docs/DEMO_60S.md). `npm run demo` is `npm run demo:60s`.

## Run

```bash
npm ci
npm test
npm run compare -- --dry-run
```

`npm test` compiles TypeScript and runs the tests. The smoke test fails if a charge, write, or fix API is exported, or if a dry-run claims all-clear.

`npm run pack:release` writes the versioned zip and `docs/CHECKSUMS.md` from a committed tree. See [release/README.md](release/README.md).

`--dry-run` does not read keys and does not call Stripe, Polar, Slack, or the database. It exits 0. That exit is not an all-clear. `--live` does those reads when the environment variables in `.env.example` are set, and it can post to the Slack webhook. It still does not charge, write, or change `is_pro`. On a live run, exit `0` is an all-clear, exit `2` is a finished run that is not all-clear, and exit `1` is a run error. An unknown flag exits 1 and does not fall through to a dry-run.

## Docs

[docs/README.md](docs/README.md) is the index. Operators: [BUYER_START_HERE.md](BUYER_START_HERE.md). What a run will not catch: [docs/WHAT_THIS_WILL_NOT_CATCH.md](docs/WHAT_THIS_WILL_NOT_CATCH.md). Fixture clip: [docs/DEMO_60S.md](docs/DEMO_60S.md). Support: [SUPPORT.md](SUPPORT.md). Security reports: [SECURITY.md](SECURITY.md). Status: [docs/STATUS.md](docs/STATUS.md). Changelog: [CHANGELOG.md](CHANGELOG.md).

## Status

Detector on `main` (PR #5). Price lock PR #6. Polar listing live. Current Polar delivery: `seattruth-0.1.1.zip` as pinned above. See [docs/STATUS.md](docs/STATUS.md).

## License

SeatTruth is source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE). PolyForm Noncommercial 1.0.0 is not an OSI-approved license. Commercial production use requires a paid [SeatTruth commercial grant](docs/COMMERCIAL_GRANT.md) from Suthirth Solutions, operating as yellowgram. Legal seller: Suthirth Solutions, operating as yellowgram. Contact hello@yellowgram.dev.

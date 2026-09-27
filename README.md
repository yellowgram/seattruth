# SeatTruth

SeatTruth is a read-only check between two billing rails (Stripe and Polar) and the product database fields `is_pro` and seats. It reports two disagreements. The operator decides what to do about them.

This repository is the read-only detector. A dry-run is not a clean bill of health. Version **0.1.1** ships the zip and its SHA-256. Tag `v0.1.0` and `release/seattruth-0.1.0.zip` stay as they were. SeatTruth is for sale via Polar. To buy, use [www.yellowgram.dev](https://www.yellowgram.dev) or email hello@yellowgram.dev. This page is not a Checkout link.

## What it is

One organization, one mapping file, restricted keys, a scheduled GitHub Action, and a Slack alert.

The two disagreements in scope:

1. Paid on an applicable rail, no applicable rail ambiguous, and `is_pro` false. A deliberate skip on another rail does not hide this.
2. Status `canceled` on every applicable rail, and `is_pro` true. A Polar refund is not this case. Stripe `active` with any refund is not this case.

A match is silence. Paid with `is_pro` true, or canceled on every applicable rail with `is_pro` false, is not a finding. Paid on one rail and canceled on the other, with `is_pro` true, is not a finding. A customer id with zero subscriptions after a complete read is ambiguous, not a cancel, and it blocks both cases. Any `active` subscription counts as paid, including quantity 0 and any price. Trials (`trialing`, `incomplete`, `incomplete_expired`) can be included in a live all-clear. An empty relation can be all-clear and does not prove the view is the right population. The kit does not add a price filter, a third case, or an automatic change.

## What stays out

- Billing platform, Stripe mirror, and enterprise audit practice.
- Charges, refunds, and Checkout.
- Writes to Stripe, Polar, or the product database, including `is_pro` and seats.
- Auto-fix, and alert text that tells an operator to flip a flag.
- Soft-WTP and cold invoices. That covers asking strangers what they would pay, fake-door checkout, pay-what-you-want, and an invoice sent to someone who did not buy.
- A Checkout URL in this repository. SeatTruth is for sale via Polar. The purchase path is [www.yellowgram.dev](https://www.yellowgram.dev) or hello@yellowgram.dev.

## Who it is for

Global English. Indie and small SaaS operators who already bill on Stripe, Polar, or both, and who store access in their own database. You can create a restricted key and a read-only database role. Docs and support are in English.

Teams that want a qualification call, an audit PDF, or a monitor priced for hundreds of pounds a month are outside this product. See [docs/COMPETITIVE_SKIM.md](docs/COMPETITIVE_SKIM.md).

## Price

**$99 once** per organization. That is a one-time purchase, not a monthly fee. Launch hook: the first 10 organizations at **$79 once**, on the same SKU. The number is locked. It is not negotiable. Soft-WTP stays forbidden. The refund window is **14 days**. The kit does not recommend end-customer refunds.

The current zip is [release/seattruth-0.1.1.zip](release/seattruth-0.1.1.zip). The SHA-256 values are in [docs/CHECKSUMS.md](docs/CHECKSUMS.md). [release/seattruth-0.1.0.zip](release/seattruth-0.1.0.zip) is unchanged and remains the file attached on the Polar product. SeatTruth is for sale via Polar at this locked price. The first 10 organizations are **$79 once** on that SKU; the SKU is **$99 once** after that. Soft-WTP stays off. To buy, use [www.yellowgram.dev](https://www.yellowgram.dev) or email hello@yellowgram.dev. This page is not a Checkout link.

## Contact

hello@yellowgram.dev

Prefer [www.yellowgram.dev](https://www.yellowgram.dev).

## Run

Node.js 20 or newer.

```bash
npm ci
npm test
npm run compare -- --dry-run
```

`npm test` compiles TypeScript and runs the tests. The smoke test fails if a charge, write, or fix API is exported. It also fails if a dry-run result claims all-clear.

`npm run pack:release` writes the versioned zip and `docs/CHECKSUMS.md` from a committed tree. See [release/README.md](release/README.md).

`--dry-run` does not read keys and does not call Stripe, Polar, Slack, or the database. It exits 0. That exit is not an all-clear. `--live` does those reads when the environment variables in `.env.example` are set, and it can post to the Slack webhook. It still does not charge, write, or change `is_pro`. On a live run, exit `0` is an all-clear, exit `2` is a finished run that is not all-clear, and exit `1` is a run error. An unknown flag exits 1 and does not fall through to a dry-run.

## Docs

[docs/README.md](docs/README.md) is the index. Operators start at [BUYER_START_HERE.md](BUYER_START_HERE.md). Support email is [SUPPORT.md](SUPPORT.md). The 0.1.1 note is [CHANGELOG.md](CHANGELOG.md).

## Status

The detector is on `main` (pull request #5) and is read-only. The price lock is pull request #6. Version **0.1.1** is this pack. Version **0.1.0** remains the Polar attachment and is not rewritten. The Polar listing is live. This pack does not change that listing, its price, or its zip attachment. Soft-WTP stays off. SeatTruth is for sale via Polar. To buy, use [www.yellowgram.dev](https://www.yellowgram.dev) or email hello@yellowgram.dev. [docs/STATUS.md](docs/STATUS.md).

## License

SeatTruth is source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE). PolyForm Noncommercial 1.0.0 is not an OSI-approved license. Commercial production use requires a paid [Suthirth Commercial Grant](docs/COMMERCIAL_GRANT.md) from Suthirth solutions. Seller: Suthirth solutions. Contact hello@yellowgram.dev.

# SeatTruth

SeatTruth is a read-only check between two billing rails (Stripe and Polar) and the product database fields `is_pro` and seats. It reports two disagreements. The operator decides what to do about them.

This repository is the read-only detector and its design pack. A dry-run is not a clean bill of health. There is still nothing to buy here: no zip, and the Polar listing is dark.

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
- A public Polar listing. The listing stays dark until a versioned zip, its SHA-256, and `POLAR_DELIVERABLES` are real. Nothing in this repo is a Checkout link.

## Who it is for

Global English. Indie and small SaaS operators who already bill on Stripe, Polar, or both, and who store access in their own database. You can create a restricted key and a read-only database role. Docs and support are in English.

Teams that want a qualification call, an audit PDF, or a monitor priced for hundreds of pounds a month are outside this product. See [docs/COMPETITIVE_SKIM.md](docs/COMPETITIVE_SKIM.md).

## Price

**$99 once** per organization. That is a one-time purchase, not a monthly fee. Optional launch hook: the first 10 organizations at **$79 once**. The number is locked. It is not negotiable. Soft-WTP stays forbidden. The refund window is **14 days**.

There is nothing to buy here today. The Polar listing stays dark until a versioned zip, its SHA-256, and `POLAR_DELIVERABLES` are real.

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

`--dry-run` does not read keys and does not call Stripe, Polar, Slack, or the database. It exits 0. That exit is not an all-clear. `--live` does those reads when the environment variables in `.env.example` are set, and it can post to the Slack webhook. It still does not charge, write, or change `is_pro`. On a live run, exit `0` is an all-clear, exit `2` is a finished run that is not all-clear, and exit `1` is a run error. An unknown flag exits 1 and does not fall through to a dry-run.

## Docs

[docs/README.md](docs/README.md) is the index. Operators start at [BUYER_START_HERE.md](BUYER_START_HERE.md).

## Status

**Implement PR** on this branch. DR#1–#3 are pull requests #1–#3. LaunchGate approved the 4th DR on pull request #4. CR×3 is done. Next is the 4th code review, which needs LaunchGate APPROVE before squash-merge. Ordinary code gates do not wait on the founder. The detector is implemented and read-only. The zip, its SHA-256, and `POLAR_DELIVERABLES` are absent, so the Polar listing stays dark. [docs/STATUS.md](docs/STATUS.md). The ask is [docs/CODE_REVIEW_CR4.md](docs/CODE_REVIEW_CR4.md).

## License

Commercial, single organization. Use and modification for that organization are allowed. Resale as a competing kit is not. There is no warranty that an entitlement comparison is correct. See [LICENSE](LICENSE).

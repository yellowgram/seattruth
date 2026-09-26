# SeatTruth

SeatTruth is a read-only check between two billing rails (Stripe and Polar) and the product database fields `is_pro` and seats. It is being designed to report two disagreements. The operator decides what to do about them.

This repository is a design pack and a thin scaffold. The detector is not built. A dry-run is not a clean bill of health.

## What it is

One organization, one mapping file, restricted keys, a scheduled GitHub Action, and a Slack alert.

The two disagreements in scope:

1. Paid on an applicable rail, no applicable rail ambiguous, and `is_pro` false. A deliberate skip on another rail does not hide this.
2. Status `canceled` on every applicable rail, and `is_pro` true. A Polar refund is not this case. Stripe `active` with any refund is not this case.

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

Self-serve, in the band **$49–99 per month**, once there is a real deliverable to sell. The exact number inside that band is a founder (via CoS) decision. It does not block the design reviews. There is nothing to buy here today.

## Contact

hello@yellowgram.dev

Prefer [www.yellowgram.dev](https://www.yellowgram.dev).

## Run the scaffold

Node.js 20 or newer.

```bash
npm ci
npm test
npm run compare -- --dry-run
```

`npm test` compiles TypeScript and runs the smoke test. The test imports the stubs and fails if a charge, write, or fix API is exported. It also fails if a dry-run result claims all-clear.

`--live` exits 2. It does not read keys and does not call Stripe, Polar, Slack, or the database.

## Docs

[docs/README.md](docs/README.md) is the index. Operators start at [BUYER_START_HERE.md](BUYER_START_HERE.md).

## Status

**4th DR** on this branch. DR#1 is pull request #1. DR#2 is pull request #2. DR#3 is pull request #3. This pull request is the LaunchGate gate packet. An implement PR waits for LaunchGate APPROVE. Then CR×3, then a 4th code review with LaunchGate APPROVE before squash-merge. Ordinary design and code gates do not wait on the founder. The detector is not implemented. The zip, its SHA-256, and `POLAR_DELIVERABLES` are absent. [docs/STATUS.md](docs/STATUS.md).

## License

Commercial, single organization. Use and modification for that organization are allowed. Resale as a competing kit is not. There is no warranty that an entitlement comparison is correct. See [LICENSE](LICENSE).

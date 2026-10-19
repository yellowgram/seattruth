# SeatTruth

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

MIT-licensed open source. You run this. yellowgram does not operate a hosted endpoint for it. Reconcile Stripe and Polar against product `is_pro` / seats. Report the mismatch.

Install: `npm install seattruth` (CLI: `npx seattruth --dry-run`) or clone https://github.com/yellowgram/seattruth. Start here as an operator: [START_HERE.md](START_HERE.md). SeatTruth is no longer sold. Releases before 0.2.0 (tags `v0.1.0`, `v0.1.1` and the zips in `release/`) were published under the previous license; 0.2.0 and later are MIT.

## What it is

The read-only detector: one organization, one mapping file, restricted keys, a scheduled GitHub Action, and a Slack alert. Two disagreements only:

1. Paid on an applicable rail, no applicable rail ambiguous, and `is_pro` false.
2. Status `canceled` on every applicable rail, and `is_pro` true. A Polar refund is not this case. Stripe `active` with any refund is not this case.

A match is silence. A dry-run is not an all-clear. The kit does not charge, write `is_pro`, or auto-fix. Limits a green run still does not prove: [docs/WHAT_THIS_WILL_NOT_CATCH.md](docs/WHAT_THIS_WILL_NOT_CATCH.md).

## What stays out

- Billing platform, Stripe mirror, and enterprise audit practice.
- Charges, refunds, Checkout, and writes to Stripe, Polar, or the product database.
- Auto-fix, and alert text that tells an operator to flip a flag.

## Who it is for

Global English. Indie and small SaaS operators who already bill on Stripe, Polar, or both, and who store access in their own database. Docs are in English. Audit PDFs and hosted monitoring are outside this project.

## Quick start

Node.js 20 or newer. `npm run demo` is the sealed fixture demo (no live Stripe, Polar, Slack, or database keys).

```bash
npm ci
npm run demo
```

A dry-run is not a clean bill of health. This sealed demo is not an all-clear. Proof lines: [docs/DEMO_60S.md](docs/DEMO_60S.md). `npm run demo` is `npm run demo:60s`.

## Run

```bash
npm ci
npm test
npm run compare -- --dry-run
```

`npm test` compiles TypeScript and runs the tests. The smoke test fails if a charge, write, or fix API is exported, or if a dry-run claims all-clear.

The historical release zips are described in [release/README.md](release/README.md).

`--dry-run` does not read keys and does not call Stripe, Polar, Slack, or the database. It exits 0. That exit is not an all-clear. `--live` does those reads when the environment variables in `.env.example` are set, and it can post to the Slack webhook. It still does not charge, write, or change `is_pro`. On a live run, exit `0` is an all-clear, exit `2` is a finished run that is not all-clear, and exit `1` is a run error. An unknown flag exits 1 and does not fall through to a dry-run.

## Docs

[docs/README.md](docs/README.md) is the index. Operators: [START_HERE.md](START_HERE.md). What a run will not catch: [docs/WHAT_THIS_WILL_NOT_CATCH.md](docs/WHAT_THIS_WILL_NOT_CATCH.md). Fixture clip: [docs/DEMO_60S.md](docs/DEMO_60S.md). Support: [SUPPORT.md](SUPPORT.md). Security reports: [SECURITY.md](SECURITY.md). Status: [docs/STATUS.md](docs/STATUS.md). Changelog: [CHANGELOG.md](CHANGELOG.md).

## Status

Detector on `main`. See [docs/STATUS.md](docs/STATUS.md).

## Support

No support contract and no SLA. Best-effort GitHub Issues; see [SUPPORT.md](SUPPORT.md). Contact hello@yellowgram.dev at www.yellowgram.dev.

## License

MIT. See [LICENSE](LICENSE). Releases before 0.2.0 (tags `v0.1.0`, `v0.1.1` and the zips in `release/`) were published under the previous license; 0.2.0 and later are MIT.

---

Part of yellowgram open source tools: https://www.yellowgram.dev/oss

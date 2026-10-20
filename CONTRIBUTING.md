# Contributing

Issues and pull requests are welcome on https://github.com/yellowgram/seattruth.

- **Bugs:** include the SeatTruth version, Node version, the command, and the redacted output line (`SeatTruth run_error=…`, a finding line, or the exit code). Never paste keys, tokens, database URLs, webhook URLs, or customer rows.
- **Rule changes:** [docs/RULES.md](docs/RULES.md) is the contract. A change to a bucket, to the two findings, or to what exit 0 means needs a test in `tests/rules.test.ts` or `tests/providers.test.ts` and a CHANGELOG entry.
- **Out of scope:** writes of any kind (to Stripe, Polar or the product database), auto-fix or suggested SQL, a third finding type, other billing providers, a hosted service, an ignore list or snooze.
- Run `npm test` before you open a pull request. It builds, runs every test, and fails if a charge, write or fix API is exported.

Contributions are accepted under the MIT License ([LICENSE](LICENSE)).

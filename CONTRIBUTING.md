# Contributing

Standing rule for later SeatTruth changes. Historical gates for the detector already on `main` are in [docs/STATUS.md](docs/STATUS.md). Issue: https://github.com/yellowgram/seattruth/issues/19

## Product code

Changes to the detector, compare path, rules, or provider behavior use this cadence. Do not collapse it. A collapsed gate is a fail. Future agents treat a skipped or folded DR×3 or CR×3 as a fail.

1. **DR×3.** Three design-review passes, as separate pull requests. Do not fold them into one review.
2. **LaunchGate DR4.** Gate `960de7bc-341e-48b2-b475-bc496f189325`.
3. **Implement.**
4. **CR×3.** Three code-review passes. Do not fold them into one review.
5. **LaunchGate CR4.** Same gate. The ask is APPROVE squash-merge or REQUEST CHANGES.
6. **Squash-merge.**

The next product change starts this cadence again. It does not skip LaunchGate.

## Taste-gate

Non-trivial public work, SDK work, and docs that change a contract get an architect draft, then a harsh exemplary-bar review, before anyone calls them done. Contract here means price, license, the detect cases, or what all-clear means.

Docs-only process notes may land without a full DR×3 when they do not change the detector, the compare path, the rules, or provider behavior, and they do not change that contract. [docs/SHIP_ATOMIC_PIN.md](docs/SHIP_ATOMIC_PIN.md), [docs/WHAT_THIS_WILL_NOT_CATCH.md](docs/WHAT_THIS_WILL_NOT_CATCH.md), [docs/LIVE_OPERATOR_LOOP.md](docs/LIVE_OPERATOR_LOOP.md), and the park marker in [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md) are that kind of note.

## Out

This file does not authorize a hosted endpoint or an SLA. You run the kit. yellowgram does not operate a hosted endpoint for this SKU. This repository has no Checkout URL.

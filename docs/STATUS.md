# Status

Updated 2026-09-26. Design only.

| Item | State |
| --- | --- |
| Design pack | Iteration 0. Scoped so an adversary can attack it. |
| Detector | Not started. Stubs throw rather than pretend to compare. |
| `npm test` | Smoke test on the stub surface. |
| GitHub Action `compare` | Cron and manual dispatch, dry-run only. No live secrets. |
| Polar listing | Dark. |
| Versioned zip, SHA-256, `POLAR_DELIVERABLES` | Absent. Do not create a listing that implies Checkout. |
| Package version | `0.0.0`, private. Not a release. |
| Exact price inside $49–99 | Unset. Setting it before a zip exists would be a fake door. |

## Process

1. **This branch.** Iteration-0 design pack and a thin runnable scaffold.
2. **Three design iterations.** Expert A, then Expert B, then Expert C, in that order. Each one tries to break the provisional rules in [MVP_SCOPE.md](MVP_SCOPE.md) and records a delta in [MINIMUM_SUPPORT_CHECKLIST.md](MINIMUM_SUPPORT_CHECKLIST.md). Not started.
3. **Founder halt.** Stop. Wait for an explicit go-ahead to implement. A green CI run on this scaffold is not that go-ahead.
4. **Implement** inside the rules that survive the halt.
5. **Three deep adversarial code reviews** before merge to `main`.

Skipping from this scaffold to a live Stripe or Polar call is a process break.

## Contact

hello@yellowgram.dev

Prefer [www.yellowgram.dev](https://www.yellowgram.dev).

## Sibling repos

The doc set follows the founder's HookSteel list: scope, minimum support, buyer needs beyond the checklist, status, and a buyer front door. A private kit, with a versioned zip later, is the same distribution idea.

`yellowgram/hooksteel` was not readable while this scaffold was written (GitHub returned 404 for the token in use). No HookSteel billing code is in this repository. SeatTruth is a different product: a read-only entitlement drift detector.

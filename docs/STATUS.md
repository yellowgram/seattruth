# Status

Updated 2026-09-26. **This pull request is DR#1 only.**

DR#1 is the scaffold plus the design-pack seed: [MVP_SCOPE.md](MVP_SCOPE.md), [MINIMUM_SUPPORT_CHECKLIST.md](MINIMUM_SUPPORT_CHECKLIST.md) v1, [BUYER_NEEDS_BEYOND_CHECKLIST.md](BUYER_NEEDS_BEYOND_CHECKLIST.md) v1, [COMPETITIVE_SKIM.md](COMPETITIVE_SKIM.md), and this file.

DR#2 is not done. DR#3 is not done. This PR does not contain those reviews.

| Item | State |
| --- | --- |
| Design review | DR#1 only. Seed, not a finished design. |
| DR#2 | Not started. Separate design PR. |
| DR#3 | Not started. Separate design PR after DR#2. |
| Detector | Not started. Stubs throw rather than pretend to compare. |
| `npm test` | Smoke test on the stub surface. |
| GitHub Action `compare` | Cron and manual dispatch, dry-run only. No live secrets. |
| Polar listing | Dark. |
| Versioned zip, SHA-256, `POLAR_DELIVERABLES` | Absent. Do not create a listing that implies Checkout. |
| Package version | `0.0.0`, private. Not a release. |
| Exact price inside $49–99 | Unset. Setting it before a zip exists would be a fake door. |

## Next steps

These stay separate. Do not fold them into this PR.

1. **DR#2** — its own design PR. It may revise the DR#1 seed. It is not started here.
2. **DR#3** — its own design PR, after DR#2. It is not started here.
3. **Founder halt.** Stop. Wait for an explicit go-ahead to implement.
4. **Implement PR.** The detector. Not this PR.
5. **CR×3** — three code reviews before that implement PR merges.

A green CI run on this scaffold is not the founder halt, and it is not permission to implement. Skipping from these stubs to a live Stripe or Polar call is a process break.

## Contact

hello@yellowgram.dev

Prefer [www.yellowgram.dev](https://www.yellowgram.dev).

## Sibling repos

The doc set follows the founder's HookSteel list: scope, minimum support, buyer needs beyond the checklist, status, and a buyer front door. A private kit, with a versioned zip later, is the same distribution idea.

`yellowgram/hooksteel` was not readable while this scaffold was written (GitHub returned 404 for the token in use). No HookSteel billing code is in this repository. SeatTruth is a different product: a read-only entitlement drift detector.

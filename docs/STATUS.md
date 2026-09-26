# Status

Updated 2026-09-26. **This pull request is DR#1 only.**

DR#1 is the scaffold plus the design-pack seed: [MVP_SCOPE.md](MVP_SCOPE.md), [MINIMUM_SUPPORT_CHECKLIST.md](MINIMUM_SUPPORT_CHECKLIST.md) v1, [BUYER_NEEDS_BEYOND_CHECKLIST.md](BUYER_NEEDS_BEYOND_CHECKLIST.md) v1, [COMPETITIVE_SKIM.md](COMPETITIVE_SKIM.md), and this file.

DR#2, DR#3, the 4th design review, and every code review are not done. This PR does not contain them.

| Item | State |
| --- | --- |
| Design review | DR#1 only. Seed, not a finished design. |
| DR#2 | Not started. Separate design PR. |
| DR#3 | Not started. Separate design PR after DR#2. |
| 4th DR | Not started. LaunchGate APPROVE required before any implement PR. |
| Detector | Not started. Stubs throw rather than pretend to compare. |
| CR×3 and 4th CR | Not started. 4th CR needs LaunchGate APPROVE before squash-merge. |
| `npm test` | Smoke test on the stub surface. |
| GitHub Action `compare` | Cron and manual dispatch, dry-run only. No live secrets. |
| Polar listing | Dark until a versioned zip, its SHA-256, and `POLAR_DELIVERABLES` exist. Listing go-live is a founder decision on top of that. |
| Versioned zip, SHA-256, `POLAR_DELIVERABLES` | Absent. Do not create a listing that implies Checkout. |
| Package version | `0.0.0`, private. Not a release. |
| Exact price inside $49–99 | Unset. Founder (via CoS) sets it. Setting it before a zip exists would be a fake door. |
| Refund window | Unset. Founder (via CoS) sets it. |

## Cadence

Ordinary design and code gates do not wait on the founder. LaunchGate is the 4th gate, twice: once before implementation, once before squash-merge.

1. **DR×3.** Three separate design PRs. This PR is DR#1 only. DR#2 and DR#3 each get their own PR. They are not started here.
2. **4th DR → LaunchGate APPROVE** before any implement PR. The 4th design review is its own PR. It is not started here.
3. **Implement PR.** The detector. Not this PR.
4. **CR×3.** Three code reviews of that implement work. Not started.
5. **4th CR → LaunchGate APPROVE** before squash-merge. Not started.

A green CI run on this scaffold is not a LaunchGate approval, and it is not permission to implement. Skipping from these stubs to a live Stripe or Polar call is a process break.

## Founder (via CoS)

The founder is not in the ordinary DR or CR path. Founder (via CoS) decides only:

- price inside the $49–99 band
- refund window
- Polar listing go-live
- Soft-WTP (the standing answer is no)
- spending money
- scope that becomes Chargebee, Autumn, or auto-fix

Polar stays dark until the zip, the SHA-256, and `POLAR_DELIVERABLES` are real. Go-live still needs the founder after those files exist.

## Contact

hello@yellowgram.dev

Prefer [www.yellowgram.dev](https://www.yellowgram.dev).

## Sibling repos

The doc set follows the founder's HookSteel list: scope, minimum support, buyer needs beyond the checklist, status, and a buyer front door. A private kit, with a versioned zip later, is the same distribution idea.

`yellowgram/hooksteel` was not readable while this scaffold was written (GitHub returned 404 for the token in use). No HookSteel billing code is in this repository. SeatTruth is a different product: a read-only entitlement drift detector.

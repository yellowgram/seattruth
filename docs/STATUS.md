# Status

Updated 2026-09-26. **This pull request is the implement PR.** LaunchGate approved the 4th DR on pull request #4 at `eed8afdb210a46e489b5815b5261f8574f906336`. The detector is implemented. It is not merged. Squash-merge waits on CR×3 and a 4th code review with LaunchGate APPROVE.

| Item | State |
| --- | --- |
| DR#1 | Done. https://github.com/yellowgram/seattruth/pull/1 |
| DR#2 | Done. https://github.com/yellowgram/seattruth/pull/2 |
| DR#3 | Done. https://github.com/yellowgram/seattruth/pull/3 |
| 4th DR | Approved. https://github.com/yellowgram/seattruth/pull/4 at `eed8afdb210a46e489b5815b5261f8574f906336` |
| Implement PR | **This PR.** https://github.com/yellowgram/seattruth/pull/5 |
| CR#1 | **Done.** Expert A, billing path. [CODE_REVIEW_CR1.md](CODE_REVIEW_CR1.md). |
| CR#2 | **Done.** Expert B, operator safety. [CODE_REVIEW_CR2.md](CODE_REVIEW_CR2.md). |
| CR#3 | **Next.** Not started. |
| 4th CR | Not started. LaunchGate APPROVE is required before squash-merge. |
| Detector | Implemented. Dry-run does not call the network. `--live` reads Stripe, Polar, and Postgres and can post to Slack. |
| `npm test` | Smoke test plus fixtures for P26, P27, and P28. Export names still ban charge, write, and fix APIs. |
| GitHub Action `compare` | Daily cron is live. Manual dispatch stays dry-run unless the operator turns that off. Secrets are not in the workflow file. A green dry-run is not an entitlement pass. |
| Polar listing | Dark until a versioned zip, its SHA-256, and `POLAR_DELIVERABLES` exist. Those three are absent. Listing go-live is a founder decision on top of that. |
| Versioned zip, SHA-256, `POLAR_DELIVERABLES` | Absent. This PR does not add them. |
| Package version | `0.0.0`, private. Not a release. |
| Exact price inside $49–99 | Unset. Founder (via CoS) sets it. |
| Refund window | Unset. Founder (via CoS) sets it. The kit does not recommend end-customer refunds. |

## Cadence

Ordinary design and code gates do not wait on the founder. LaunchGate is the 4th gate, twice: once before implementation, once before squash-merge.

1. **DR×3.** Done. Pull requests #1, #2, and #3.
2. **4th DR → LaunchGate APPROVE.** Done. Pull request #4.
3. **Implement PR.** This pull request.
4. **CR×3.** CR#1 and CR#2 are done on this pull request. CR#3 is next.
5. **4th CR → LaunchGate APPROVE** before squash-merge. Not started.

A green CI run on this pull request is not the 4th code-review approval, and it is not permission to squash-merge.

## Scope that shipped

- Two detect cases only: `paid_locked_out` and `canceled_still_entitled`, matching the P26 and P28 summaries LaunchGate approved.
- Active rules: P6, P7, P11, P17–P24, P25–P30. No new rule ids.
- P2 notes are implemented and written in [ACCEPTANCE_NOTES.md](ACCEPTANCE_NOTES.md): Polar scope `subscriptions:read`, the Stripe invoice-and-charge refund recipe, the P28 fixture table, and the Stripe and Polar pagination contracts.
- Hard locks stay closed: no auto-fix, no Soft-WTP, no Chargebee, no Autumn, Polar listing dark.

## Founder (via CoS)

The founder is not in the ordinary CR path. Founder (via CoS) decides only:

- price inside the $49–99 band
- refund window
- Polar listing go-live
- Soft-WTP (the standing answer is no)
- spending money
- scope that becomes Chargebee, Autumn, or auto-fix

Polar stays dark until the zip, the SHA-256, and `POLAR_DELIVERABLES` are real. None of the three files exist in this PR.

## Code review

- CR#1: [CODE_REVIEW_CR1.md](CODE_REVIEW_CR1.md). P0/P1 from that pass are fixed on this branch. Deferred limits are listed there.
- CR#2: [CODE_REVIEW_CR2.md](CODE_REVIEW_CR2.md). P0/P1 from that pass are fixed on this branch. Deferred limits are listed there. CR#3 is next.

## Where the reviews live

- Rules: [MVP_SCOPE.md](MVP_SCOPE.md).
- 4th DR packet: [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md).
- P2 notes: [ACCEPTANCE_NOTES.md](ACCEPTANCE_NOTES.md).
- Checklist v3: [MINIMUM_SUPPORT_CHECKLIST.md](MINIMUM_SUPPORT_CHECKLIST.md).

## Contact

hello@yellowgram.dev

Prefer [www.yellowgram.dev](https://www.yellowgram.dev).

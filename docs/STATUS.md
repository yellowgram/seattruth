# Status

Updated 2026-09-26. **This pull request is the 4th DR.** It is the LaunchGate gate packet. LaunchGate has not approved it. Implementation stays blocked until that approval.

| Item | State |
| --- | --- |
| DR#1 | Done. https://github.com/yellowgram/seattruth/pull/1 |
| DR#2 | Done. https://github.com/yellowgram/seattruth/pull/2 |
| DR#3 | Done. https://github.com/yellowgram/seattruth/pull/3 |
| 4th DR | **This PR.** Gate packet: [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md). Awaiting LaunchGate APPROVE or REQUEST CHANGES. |
| Implement PR | **Blocked** until LaunchGate approves this packet. |
| CR×3 and 4th CR | Not started. The 4th CR needs LaunchGate APPROVE before squash-merge. |
| Detector | Not started. Stubs throw rather than pretend to compare. |
| `npm test` | Smoke test on the stub surface. This PR does not change it. |
| GitHub Action `compare` | Cron and manual dispatch, dry-run only. No live secrets. A green run is not an entitlement pass. |
| Polar listing | Dark until a versioned zip, its SHA-256, and `POLAR_DELIVERABLES` exist. Those three are absent. Listing go-live is a founder decision on top of that. |
| Versioned zip, SHA-256, `POLAR_DELIVERABLES` | Absent. This PR does not add them. |
| Package version | `0.0.0`, private. Not a release. |
| Exact price inside $49–99 | Unset. Founder (via CoS) sets it. This review does not. |
| Refund window | Unset. Founder (via CoS) sets it. The kit does not recommend end-customer refunds. |

## Cadence

Ordinary design and code gates do not wait on the founder. LaunchGate is the 4th gate, twice: once before implementation, once before squash-merge.

1. **DR×3.** Done. DR#1 is pull request #1. DR#2 is pull request #2. DR#3 is pull request #3.
2. **4th DR → LaunchGate APPROVE** before any implement PR. This pull request is that gate. Approval has not happened.
3. **Implement PR.** The detector. Blocked on that approval.
4. **CR×3.** Three code reviews of that implement work. Not started.
5. **4th CR → LaunchGate APPROVE** before squash-merge. Not started.

A green CI run on this scaffold is not a LaunchGate approval, and it is not permission to implement.

## What LaunchGate is deciding

The packet is [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md). In short:

- Two detect cases only: `paid_locked_out` and `canceled_still_entitled`.
- Active rules: P6, P7, P11, P17–P24, P25–P30. No new ids in this PR.
- Limits to accept or reject: no price filter (P29); trials do not block `allClear` (P25, P30); no primary rail (P28); Polar refunds do not classify the subscription (P26); a partial provider page is a run error (P27); zip absent; price unset.
- Hard locks stay closed: no auto-fix, no Soft-WTP, no Chargebee, no Autumn, Polar listing dark.

## Founder (via CoS)

The founder is not in the ordinary DR or CR path. Founder (via CoS) decides only:

- price inside the $49–99 band
- refund window
- Polar listing go-live
- Soft-WTP (the standing answer is no)
- spending money
- scope that becomes Chargebee, Autumn, or auto-fix

Polar stays dark until the zip, the SHA-256, and `POLAR_DELIVERABLES` are real. Go-live still needs the founder after those files exist. None of the three files exist in this PR.

## Where the reviews live

- Rules: [MVP_SCOPE.md](MVP_SCOPE.md). Unchanged from DR#3.
- DR#2 attacks: [DESIGN_REVIEW_DR2.md](DESIGN_REVIEW_DR2.md).
- DR#3 attacks: [DESIGN_REVIEW_DR3.md](DESIGN_REVIEW_DR3.md).
- 4th DR packet: [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md).
- Checklist v3: [MINIMUM_SUPPORT_CHECKLIST.md](MINIMUM_SUPPORT_CHECKLIST.md). Not a new version.

## Contact

hello@yellowgram.dev

Prefer [www.yellowgram.dev](https://www.yellowgram.dev).

## Sibling repos

The doc set follows the founder's HookSteel list: scope, minimum support, buyer needs beyond the checklist, status, and a buyer front door. A private kit, with a versioned zip later, is the same distribution idea.

`yellowgram/hooksteel` was not readable while the scaffold was written (GitHub returned 404 for the token in use). No HookSteel billing code is in this repository. SeatTruth is a different product: a read-only entitlement drift detector.

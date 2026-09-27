# 4th code review — LaunchGate gate packet

This is the ask **before squash-merge** of implement pull request #5. It is not another adversarial pass. It does not add a rule id. It does not squash-merge. It does not contact LaunchGate. SeatTruth sends this packet.

Reviews: [CODE_REVIEW_CR1.md](CODE_REVIEW_CR1.md), [CODE_REVIEW_CR2.md](CODE_REVIEW_CR2.md), [CODE_REVIEW_CR3.md](CODE_REVIEW_CR3.md). Rules stay in [MVP_SCOPE.md](MVP_SCOPE.md).

## Ask

**APPROVE** squash-merge of https://github.com/yellowgram/seattruth/pull/5, or **REQUEST CHANGES**.

Approval is the merge gate only. It does not set the price, the refund window, or Polar listing go-live. It does not allow auto-fix, Soft-WTP, Chargebee, or Autumn.

## Freeze

Two detect cases, unchanged:

1. **`paid_locked_out`.** At least one applicable rail is paid, no applicable rail is ambiguous, and `is_pro` is boolean false. A deliberate skip on another rail does not block this.
2. **`canceled_still_entitled`.** Every applicable rail is status `canceled`, at least one rail applies, and `is_pro` is boolean true. A Polar refund is not this case. Stripe `active` with any refund is ambiguous, so this case does not fire.

Active rules: P6, P7, P11, P17–P30. No new rule ids. The detector is read-only. Dry-run does not call the network. Live reads do not charge, write, or change `is_pro`.

## What CR×3 fixed

| Review | Lens | P0 | P1 that landed on this branch |
| --- | --- | --- | --- |
| CR#1 | Billing path | None | Repeated provider pages, unexpanded Stripe charges, blank customer ids, Slack host, semicolon on the product `SELECT` |
| CR#2 | Operator safety | None | Unknown flags, live docs, redirects, email-shaped Slack fields, padded customer ids, bigint seats, the charges GET in `.env.example` |
| CR#3 | Buyer path | None | `mapping_unreadable` and `product_query_failed`, `export` in `.env`, whole-number numeric seats, all-clear wording, the missing P28 rows, silence and P29 on the front door |

`npm test` is green on this branch. No zip, SHA-256, or `POLAR_DELIVERABLES` was added. The Polar listing stays dark.

## Deferred P2 to accept with the merge

These are known limits, not a third detect case. Rejecting one is REQUEST CHANGES, not a silent widen during merge.

| Limit | Why it stays out |
| --- | --- |
| Credit notes that never touch a charge | Outside the charge `amount_refunded` recipe. |
| A dispute that is not on the charge object we read | No separate dispute API. |
| A complete-looking provider page that omits rows | The client cannot see the omission. |
| A database role that can write | The operator's credential. This process sends one `SELECT`. |
| No price, product, or quantity filter | P29, accepted at the 4th DR. Any `active` subscription counts as paid. |
| A customer id that is not text | Run error. Not coerced. |
| Quoted identifiers are case-sensitive | The mapping example says so. |
| npm does not set `engine-strict` | Documented Node is 20 or newer. CI uses Node 20. |
| A user id with no `@` and no key shape is posted | Map a non-email user id. |
| Cron runs on the default branch after merge | It does not run on the pull request. |
| Zip, SHA-256, `POLAR_DELIVERABLES` absent | Listing go-live stays a founder (via CoS) decision after those exist. |

## What this review is not

A green CI check is not this approval. This file is not LaunchGate's answer. Soft-WTP remains no. The exact price inside $49–99 and the refund window stay unset.

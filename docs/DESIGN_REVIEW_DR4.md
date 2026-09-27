# 4th design review — LaunchGate gate packet

This pull request is the **4th DR**. It is the packet LaunchGate approves or rejects **before any implement PR**. It is not another adversarial pass. It does not add a rule id. It does not implement the detector. It does not contact LaunchGate; SeatTruth sends this packet after the pull request exists.

Rules stay in [MVP_SCOPE.md](MVP_SCOPE.md). LaunchGate REQUEST CHANGES on the detect-case summaries is applied in this revision: those two sentences now match P26 and P28. Items that wait for the implement PR, and do not block re-approval, are in [ACCEPTANCE_NOTES.md](ACCEPTANCE_NOTES.md).

**Later price lock.** This review froze an unset monthly band and an unset refund window. It did not set either. Founder later locked **$99 once** per organization, optional first 10 at **$79 once**, and a **14-day** refund window. The price and refund sentences below stay as the review wrote them.

## Product

SeatTruth is a read-only check of Stripe and Polar against one product database. It reports two disagreements and stops.

1. **`paid_locked_out`.** At least one applicable rail is paid, no applicable rail is ambiguous, and `is_pro` is boolean false. A deliberate skip on another applicable rail does not block this case (P28).
2. **`canceled_still_entitled`.** Every applicable rail is canceled (provider status `canceled` only), at least one rail applies, and `is_pro` is boolean true (P26, P28). A Polar refund does not make a rail canceled. A Stripe subscription with status `active` and any refund is ambiguous, so this case does not fire.

Seats ride along on the alert. The operator decides what to do.

Shape: restricted keys, one mapping file, one Postgres relation, a daily GitHub Action, Slack on the operator's channel. Self-serve, **$49–99 per month**, exact price unset. Contact hello@yellowgram.dev. Prefer https://www.yellowgram.dev.

## Hard outs

These are closed. This packet does not reopen them.

- Charges, refunds, Checkout, invoices, or a customer portal created by the kit.
- Writes to Stripe, Polar, or the product database, including `is_pro` and seats.
- Auto-fix, suggested SQL, and alert text that tells an operator to flip a flag (P24).
- Soft-WTP and cold invoices.
- Chargebee, Autumn, Paddle, or any processor besides Stripe and Polar.
- Plan drift, orphan findings, seat-count inequality, ignore lists, and snooze.
- A public Polar listing. The listing stays dark until a versioned zip, its SHA-256, and `POLAR_DELIVERABLES` exist. Those three are absent. Go-live after that is a founder (via CoS) decision, not this review.

## Active rules

Controlling text is [MVP_SCOPE.md](MVP_SCOPE.md). Superseded ids stay in that table and are not implemented. Active ids after DR#3:

| Id | What LaunchGate is approving |
| --- | --- |
| P6 | Slack may carry case id, user id, provider, customer id, subscription id, `is_pro`, and `seats`. No email, name, or card data. |
| P7 | A rail is on only with a real customer-id column. A missing credential on an enabled rail is a run error. |
| P11 | `is_pro` must be a real boolean. `NULL` is not a guess. `NULL` seats are not `0`. Seats never decide the case. |
| P17 | Duplicate provider customer ids exclude those users only. The run continues for everyone else. |
| P18 | `product.schema` is required. Identifiers are checked, then quoted. No raw SQL. No `search_path` fallback. |
| P19 | One mapping file is one tenant, one schema, one relation, one database URL. |
| P20 | The seats column is required. Omitting it is a run error. |
| P21 | Only a YAML null disables a rail. An empty string is a config error. |
| P22 | Zero enabled rails is a run error. |
| P23 | Do not log keys, tokens, database URLs, or webhook URLs. |
| P24 | No fix, refund, or SQL advice. No daily all-clear Slack message. |
| P25 | Ambiguous users increment `unclassifiedUsers` and block `allClear`. Deliberate skips (`trialing`, `incomplete`, `incomplete_expired`) increment `deliberateSkipUsers` and do not. |
| P26 | Paid is status `active` (Stripe: no refund on that subscription). Canceled is status `canceled` only. Polar refunds do not classify the subscription. |
| P27 | An incomplete provider read is a run error. A short page is not "no subscription." |
| P28 | No primary rail. Case 1 still fires when one rail is paid and another is only a deliberate skip. Case 2 needs every applicable rail canceled. |
| P29 | Any `active` subscription counts as paid. Price, product, and quantity are not filters. |
| P30 | `allClear` requires a live complete read, zero findings, zero errors, and `unclassifiedUsers` of 0. `deliberateSkipUsers` may be above zero. Dry-run is not a pass. |

The detect-case sentences in [MVP_SCOPE.md](MVP_SCOPE.md) are the same two sentences as in Product, above. P26 and P28 are the controlling rules.

## Design stack

| Gate | Pull request |
| --- | --- |
| DR#1 | https://github.com/yellowgram/seattruth/pull/1 |
| DR#2 | https://github.com/yellowgram/seattruth/pull/2 |
| DR#3 | https://github.com/yellowgram/seattruth/pull/3 |
| 4th DR | This pull request. |

Attack logs, if a reason needs the earlier delta: [DESIGN_REVIEW_DR2.md](DESIGN_REVIEW_DR2.md), [DESIGN_REVIEW_DR3.md](DESIGN_REVIEW_DR3.md).

## Limits to accept or reject

Each line is already in the design. Approving the implement PR accepts all of them. Rejecting one is REQUEST CHANGES, not a silent edit during implementation.

| Limit | Rule | What "accept" means |
| --- | --- | --- |
| No price filter | P29 | An add-on, a non-pro price, or quantity `0` on an `active` subscription still counts as paid. A price allow-list is out. |
| Trials do not block `allClear` | P25, P30 | A population that is only `trialing`, `incomplete`, or `incomplete_expired` can be all-clear. `past_due`, `paused`, and `unpaid` cannot. |
| No primary rail | P28 | The kit does not pick the "real" subscription. A paid rail still reports `paid_locked_out` when the other rail is a trial. |
| Polar refunds do not classify the subscription | P26 | Cited [Polar refunds](https://polar.sh/docs/features/refunds), read 2026-09-26: refunding an order tied to a subscription returns the money and does not end the subscription. Order objects are not read. Case 2 on Polar is status `canceled` only. |
| Partial page is an error | P27 | Truncated pagination fails the run. It does not become a wave of cancels. |
| Zip absent | Checklist v3 | No zip, no SHA-256, no `POLAR_DELIVERABLES`. Polar listing stays dark. This PR does not add them. |
| Price unset | Founder via CoS | The band is $49–99. The exact number and the refund window are unset. They do not block this review, and this review does not set them. |

## Kill criteria

From [MVP_SCOPE.md](MVP_SCOPE.md). This packet's reading:

1. **Does not fire.** Both cases are still decidable from provider status plus boolean `is_pro`, without a write, a fuzzy match, or a guessed schema. DR#2 and DR#3 did not drop a case. Dropping one would be REQUEST CHANGES.
2. **Stands as a decline rule.** A buyer who wants a qualification call, an executive PDF, or DriftExact-shaped pricing is outside the product. Not a reason to widen this packet.
3. **Condition on the implement PR.** The scaffold smoke test already fails charge, write, and fix exports. Implementation has not started.
4. **Not observable yet.** If support becomes "fix this row," the product is the wrong shape. The kit still will not do that work.
5. **Does not fire on the 2026-09-26 skim.** See differentiation. This PR did not re-fetch those pages.
6. **This review is that decision.** A LaunchGate rejection stops implementation. Founder (via CoS) items — price, refund window, Polar go-live, Soft-WTP, spending money, Chargebee, Autumn, auto-fix — are unset or refused. They are not the question in front of LaunchGate.

## Differentiation

Public skim **2026-09-26**, sources in [COMPETITIVE_SKIM.md](COMPETITIVE_SKIM.md). This PR did not add prices, customer counts, or accuracy figures.

The published **Polar ↔ product-database entitlement** gap is open among the named peers:

- DriftExact, Venwai, and EntitleGuard are Stripe-only on the pages reviewed.
- ProdVerdict is Stripe and Paddle. Its public README does not mention Polar. Pro Cloud is about $39/project/mo in the changelog. prodverdict.com returned 503 that day.
- RevReclaim names Polar, for billing-leak hygiene, and paid plans market auto-fix. That is a different product.

SeatTruth's wedge on those same pages is **$49–99/mo**, **Stripe and Polar**, read-only, **no auto-fix**. DriftExact's published band is £399–£1,500+/mo, best-fit copy around 500+ subscriptions. That buyer is kill criterion 2.

Polar's subscription status enum and refund doc were read for P26. That is Polar's API, not a competitor shipping this reconcile.

## What this PR does not ask

- Do not approve a Polar listing, a zip, or a price.
- Do not approve auto-fix, Soft-WTP, Chargebee, Autumn, or a third detect case.
- Do not move parked items (seat inequality, CSV export, a second database, an id-pair list, a second relation, a Polar refund-object map) into scope. They stay in the Later section.
- Do not treat a green scaffold CI run as this approval.

## Ask

LaunchGate REQUEST CHANGES on the two case summaries is applied. Those sentences now match P26 and P28. P2 items are recorded in [ACCEPTANCE_NOTES.md](ACCEPTANCE_NOTES.md) and do not block this ask.

**Re-APPROVE** an implement PR that builds only the active rules above, behind the hard outs, with the limits in the table accepted as written.

**or**

**REQUEST CHANGES** and name the rule, the limit, or the kill criterion that fails. Do not leave a change for the implementer to invent.

This document is the request. It is not the approval. The detector stays unimplemented until LaunchGate re-approves.

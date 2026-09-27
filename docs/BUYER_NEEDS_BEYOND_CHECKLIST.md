# Buyer needs beyond the checklist (v3)

**v3, unchanged in the 4th DR.** Revision of the v2 list from DR#3. Operators will ask for these. The v3 checklist does not promise them. Each line is **decided**, **deferred**, or **refuse**. The LaunchGate packet does not reopen a refusal. See [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md). Workflows that only work if the kit writes `is_pro`, names a price, or hides a finding stay refused here.

Contact for the ones that are just questions: hello@yellowgram.dev. Prefer [www.yellowgram.dev](https://www.yellowgram.dev).

## Decided in the MVP rules

These are real needs, and the answer is already a rule. The kit meets them by refusing the roomier version.

| Need | Answer |
| --- | --- |
| "Put the customer's email in Slack so I can act." | Refused by P6. The operator joins email in their own database. Slack keeps ids and the two fields. |
| "Tell me whether to turn `is_pro` on." | Refused by P24. The alert names the disagreement. A suggested `UPDATE` that the kit does not run is the same refusal. |
| "Just fix the row." | Refused. Auto-fix is a hard out. The license does not warrant entitlement correctness. |
| "Treat `past_due` as canceled." | Refused. P26 keeps it ambiguous. The run is not all-clear (P25, P30). There is no case finding. Polar's grace period does not become the kit's policy. |
| "Ignore trials so the daily job can go green." | Decided in P25. `trialing`, `incomplete`, and `incomplete_expired` are a deliberate skip for every customer. They do not block `allClear`. There is no per-customer toggle. |
| "A Polar refund should lock them out." | Refused by P26. Polar's refund doc says the refund returns the money and does not end the subscription. The kit does not read order objects. Case 2 is status `canceled` only. |
| "We only bill on Polar." | Supported. Set Stripe `customer_id` to null (P7). |
| "Prove the GitHub Action is not using a secret key." | Supported by the `sk_` refusal and by the workflow shipping without secrets. The Slack webhook is a secret too (P23). |

## Deferred

Real needs. Not in this revision. The 4th DR packet left them deferred. They move only by a later edit to [MVP_SCOPE.md](MVP_SCOPE.md). This file does not slip them in.

| Need | Why it waits |
| --- | --- |
| Export a CSV for a finance note. | Useful, and easy to inflate into an audit pack. A flat file of the same fields as the Slack alert can wait until a buyer has run the two cases for a month. |
| Seat count differs from provider quantity, while `is_pro` agrees. | The field is on the alert. A separate finding is a third detect case. The product promise is two cases. |
| Ids live in another table, so the operator wants a hand-written pair list. | A second mapping path doubles join bugs. The design keeps one relation with the columns on it. |
| MySQL, SQLite, or a hosted auth database that is not Postgres. | One engine is the whole read path. A second engine is a second P18. |
| More than one product table (workspace and user both have `is_pro`). | Same reason. |
| A page of history inside yellowgram. | Hosting buyer customer rows is out. History stays in the operator's Slack and Actions logs. |
| Hourly cron. | Daily is the indie cadence. Faster polling is a different cost and a different secret-exposure story. |

## Refuse

Asking well does not put these in the backlog. These answers are explicit. They are not a later version of the same feature.

| Need | Why it is a refusal |
| --- | --- |
| A call to qualify the architecture before access. | That is the enterprise motion this product stays out of. |
| An executive PDF or a board appendix. | Audit-practice territory. |
| A price negotiated over email, or an invoice sent before a purchase. | Soft-WTP and cold invoices are hard outs. |
| The kit refunds the operator's end customer, or cancels their subscription. | The kit does not move money. |
| "Support" that edits production `is_pro`. | Lawsuit-shaped, and outside the license. |
| Paddle, or a generic "any billing API" adapter, in v1. | Polar is the gap being filled. A third processor is a new product. |
| A public Polar listing so people can click Buy on this scaffold. | The listing stays dark until the zip, the SHA-256, and `POLAR_DELIVERABLES` exist. Those three are absent. |
| Non-English support. | The ICP is global English. The docs do not pretend otherwise. |
| A guarantee that a green run means nobody is locked out. | `allClear` has a narrow definition (P30). A green dry-run does not count. Trials can be green. `past_due` cannot. The license states the rest. |
| "Snooze this customer" or "stop repeating the same row." | Hiding a repeat is an ignore list. The next day's alert is the product. |
| "Send the `UPDATE`, I will run it." | Refused by P24. |
| "Price SeatTruth as a cut of the revenue the finding saved." | Soft-WTP. Refused. The band is $49–99. The exact number is a founder (via CoS) decision, not a negotiation. |
| "Add Chargebee or Autumn. Same idea, one more key." | Refused. That scope change is founder-only, and the design answer is no. |
| "Should we refund this end customer?" | Refused by P24. The SeatTruth refund window is a founder decision and is not advice about the operator's customer. |
| "We'll put the row in a private GitHub Issue so you can fix it." | Refused. Support is email. Private Issues are not readable as a support desk, and they are the wrong place for keys and customer ids. |
| "Add an ignore-trials switch per customer." | Refused in DR#3. The trial split is one written rule (P25), not a snooze list. |
| "Only alert when the pro price is the active one." | Refused. That is plan drift (P29). Any `active` subscription counts as paid, including an add-on. |
| "Send an all-clear Slack message so we know the cron ran." | Refused (P24, P30). A red GitHub Actions check is the failure signal. An all-clear post is false comfort and a step toward "just clear these." |
| "Discount this month if the first week is noisy." | Soft-WTP. Refused. The price is a published number in the band, or it is unset. It is not a mood. |
| "We'll add you as a collaborator on the private repo so you can patch `is_pro`." | Refused. Support is email. A repo seat is not a license to write the product database. |

## What the buyer still has to own

The checklist can ship the kit. It cannot own the business decision.

- Which rail is enabled when both Stripe and Polar ids exist on old rows. There is no primary rail (P28). A paid rail still reports `paid_locked_out` when the other rail is only a trial. Case 2 waits until every applicable rail is canceled. Disable a stale rail, or accept an ambiguous count when the extra rail is not a clean paid, canceled, or deliberate-skip state.
- What the company does on Monday morning when Slack shows `paid_locked_out`. The kit will not do it for them.
- Comps. A null billing id is skipped, not case 2 (P28). A canceled id with `is_pro` true is case 2 every day. The way to drop comps is a view the operator owns. The kit will not store an exception or a snooze.
- Rotation of restricted keys and of the Slack webhook, in the order in the checklist, and who in the company can read the GitHub secrets.
- The read-only database role, including a schema the mapping names (P18). The kit does not create the role and cannot stop a superuser URL from being pasted in.
- An empty view can still be `allClear` (P30). The operator confirms the view has the rows they meant before trusting the first green live run. A green run with only trials is not a promise that nobody is past due.

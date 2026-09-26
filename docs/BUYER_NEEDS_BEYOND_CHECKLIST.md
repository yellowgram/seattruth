# Buyer needs beyond the checklist

Operators will ask for these. The minimum-support checklist does not promise them. Each line is **decided**, **deferred**, or **refuse**, so a later implementer does not absorb them as "small."

Contact for the ones that are just questions: hello@yellowgram.dev. Prefer [www.yellowgram.dev](https://www.yellowgram.dev).

## Decided in the MVP rules

These are real needs, and the answer is already a rule. The kit meets them by refusing the roomier version.

| Need | Answer |
| --- | --- |
| "Put the customer's email in Slack so I can act." | Refused by P6. The operator joins email in their own database. Slack keeps ids and the two fields. |
| "Tell me whether to turn `is_pro` on." | Refused by P10. The alert names the disagreement. |
| "Just fix the row." | Refused. Auto-fix is a hard out. The license does not warrant entitlement correctness. |
| "Treat `past_due` as canceled." | Refused by P2. It stays unclassified, the run is not all-clear, and there is no case finding. Expert A is chartered to attack this silence. |
| "We only bill on Polar." | Supported. Set Stripe `customer_id` to null (P7). |
| "Prove the GitHub Action is not using a secret key." | Supported by the `sk_` refusal and by the workflow shipping without secrets. |

## Deferred

Real needs. Not in v1. They move only by an edit to [MVP_SCOPE.md](MVP_SCOPE.md) during a design iteration.

| Need | Why it waits |
| --- | --- |
| Stop repeating the same Slack message every day. | Deduping needs memory. Memory of "ignore this customer" becomes a second entitlement store. Any design has to show it cannot grant or hide access. |
| Export a CSV for a finance note. | Useful, and easy to inflate into an audit pack. A flat file of the same fields as the Slack alert can wait until a buyer has run the two cases for a month. |
| Seat count differs from provider quantity, while `is_pro` agrees. | The field is on the alert. A separate finding is a third detect case. The product promise is two cases. |
| Ids live in another table, so the operator wants a hand-written pair list. | A second mapping path doubles join bugs (Expert B). v1 is one relation with the columns on it. |
| MySQL, SQLite, or a hosted auth database that is not Postgres. | One engine is the whole read path. A second engine is a second P8. |
| More than one product table (workspace and user both have `is_pro`). | Same reason. |
| A page of history inside yellowgram. | Hosting buyer customer rows is out. History stays in the operator's Slack and Actions logs. |
| Hourly cron. | Daily is the indie cadence. Faster polling is a different cost and a different secret-exposure story. |

## Refuse

Asking well does not put these in the backlog.

| Need | Why it is a refusal |
| --- | --- |
| A call to qualify the architecture before access. | That is the enterprise motion this product stays out of. |
| An executive PDF or a board appendix. | Audit-practice territory. |
| A price negotiated over email, or an invoice sent before a purchase. | Soft-WTP and cold invoices are hard outs. |
| The kit refunds the operator's end customer, or cancels their subscription. | The kit does not move money. |
| "Support" that edits production `is_pro`. | Lawsuit-shaped, and outside the license. |
| Paddle, or a generic "any billing API" adapter, in v1. | Polar is the gap being filled. A third processor is a new product. |
| A public Polar listing so people can click Buy on this scaffold. | The listing stays dark until the zip, the SHA-256, and `POLAR_DELIVERABLES` exist. |
| Non-English support. | The ICP is global English. The docs do not pretend otherwise. |
| A guarantee that a green run means nobody is locked out. | `allClear` has a narrow definition (P9). The license states the rest. |

## What the buyer still has to own

The checklist can ship the kit. It cannot own the business decision.

- Which rail is enabled when both Stripe and Polar ids exist on old rows.
- What the company does on Monday morning when Slack shows `paid_locked_out`.
- Whether a comped employee with `is_pro` true and no subscription is something the team will see every day (they will, under P1 and P4, if every enabled rail is canceled). The v1 answer is to disable the rail that does not apply, or to keep comps out of the mapped view. The kit will not store an exception.
- Rotation of restricted keys, and who in the company can read the GitHub secrets.
- The read-only database role. The kit does not create it and cannot stop a superuser URL from being pasted in.

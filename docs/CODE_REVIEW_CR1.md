# Code review CR#1

Expert A, billing money-path and entitlement correctness. This is the first of three separate code reviews of implement pull request #5. It is not CR#2 or CR#3. It does not squash-merge, and it does not contact LaunchGate.

Reviewed against P6, P7, P11, P17–P30 and [ACCEPTANCE_NOTES.md](ACCEPTANCE_NOTES.md).

## Findings fixed in this pass

### P1 — A repeated provider page could look complete

Stripe stops on `has_more: false`. Polar stops when `page` reaches `max_page` and the item count equals `total_count`. Neither check noticed a page that repeated an id already seen. A stuck cursor could then hide the rest of the customers. Those hidden ids are exactly the P27 failure: absence must not be inferred from a short read.

**Fix.** A subscription id that appears twice fails the read (`stripe_incomplete_read` or `polar_incomplete_read`). The compare does not run on that partial list.

### P1 — An unexpanded Stripe charge was treated as "no refund"

`expand[]=data.charge` still leaves `charge` as an id on some invoices, and the same id shows up under `payments`. The old code marked that id `unknown` only sometimes, and a paid invoice with no `amount_paid` field and no charge object fell through to "no refund," which classifies `active` as **paid**. That is a false `paid_locked_out`, or a missed refund that should have stayed ambiguous (P26).

**Fix.** A `ch_…` id is loaded with `GET /v1/charges/{id}` (read only). Any `amount_refunded > 0` or `refunded: true` is a refund. A charge with `disputed: true` is not "no refund"; the subscription stays ambiguous, which matches the scope out that disputes are not case 1 or case 2. A paid invoice with no readable charge stays ambiguous.

### P1 — A blank customer id hid a lockout

P28 says a null customer id means the rail does not apply. The compare treated `""` as a present id with zero subscriptions, so the rail became ambiguous and blocked `paid_locked_out` on the other rail.

**Fix.** A blank or whitespace customer id does not apply, and it is not a cancel. A blank id on a provider subscription fails the provider read instead of joining that row to every blank cell.

### P1 — Slack could post customer ids to a non-Slack URL

P23 allows the operator's incoming webhook and forbids leaking ids elsewhere. Any `https` URL in `SLACK_WEBHOOK_URL` was posted to.

**Fix.** Delivery accepts only `https://hooks.slack.com/…`. The refused URL is not copied into the error text.

### P1 — The product query was one statement only by convention

P18 quotes identifiers after the grammar check, so a semicolon cannot come from a valid name. The query runner did not also reject `;`.

**Fix.** `readProductRows` refuses a statement that contains `;` or a write keyword before it calls Postgres.

## Checked, no defect

- Case 2 is status `canceled` only. Stripe `active` plus any refund stays ambiguous and does not become case 2.
- Polar classification passes refund signal `none` and does not call order or refund URLs. A `order_status: refunded` field on the subscription object does not change `active` to canceled.
- `cancel_at_period_end` is not read for the bucket.
- P28 fixture rows in `tests/rules.test.ts` match `compareSnapshots`, including paid plus a deliberate skip, paid plus canceled, paid plus ambiguous, canceled plus a deliberate skip, all canceled, and zero subscriptions after a complete read.
- Dry-run does not call `fetch`. Secret keys (`sk_`) are refused before a request. Stripe and Polar reads are GET. The product statement is one `SELECT`. The only POST is the Slack webhook.
- Slack text is the case id and the P6 fields. It does not say to change `is_pro`. An all-clear is not posted.

## Deferred P2

These stay visible for the founder and for CR#2. They are not new detect cases, and this pass does not build them.

- A `NUMERIC` or `bigint` seats column comes back from the driver as a string. The run errors with `seats_not_numeric` instead of coercing it. Integer and null seats are unchanged (P11, P20).
- A credit note that never touches a charge is outside the charge `amount_refunded` recipe. The kit does not add a second refund object.
- A dispute that is not on the charge object we read, and not on a paid invoice we already mark unknown, is not a separate dispute API. The known signal is `charge.disputed`.
- The mapped user id is posted as-is. If an operator maps an email column, that email reaches Slack. The kit cannot tell an email from another id (P6). Map a non-email user id.
- If Stripe or Polar returns `has_more: false` or a matching `total_count` while omitting rows and not repeating an id, the client cannot see the omission.
- A database URL with a role that can write is the operator's credential. This process still sends one `SELECT`.
- Price, product, and quantity still do not filter `active` (P29). That limit was accepted at the 4th DR.

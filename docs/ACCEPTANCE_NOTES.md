# Acceptance notes

LaunchGate P2 on the 4th DR. The implement pull request specifies and builds these four items. They are not new detect rules. Active scope remains P6, P7, P11, and P17–P30.

## 1. Polar Organization Access Token read scope

Grant **`subscriptions:read`** only.

- The list-subscriptions operation names that scope, next to `subscriptions:write`: [List subscriptions](https://polar.sh/docs/api-reference/subscriptions/list). SeatTruth does not grant the write scope.
- The token is created under organization Settings → Developers → New Token. [Organization Access Tokens](https://polar.sh/docs/integrate/oat) says "Select the required scopes" and does not list the strings. Confirm the token UI checkbox matches `subscriptions:read` before saving.
- The client calls `GET /v1/subscriptions` only. It does not call order or refund endpoints.

The same note is in [.env.example](../.env.example) and the read-path section of [MVP_SCOPE.md](MVP_SCOPE.md).

## 2. Stripe refund detection

For each Stripe subscription whose status is `active`:

1. Paginate `GET /v1/invoices?subscription={id}&limit=100&expand[]=data.charge` until `has_more` is false. [List invoices](https://docs.stripe.com/api/invoices/list) documents the `subscription` filter. [Expanding objects](https://docs.stripe.com/api/expanding_objects) requires the `data.` prefix on list expansions.
2. On each invoice, read the expanded charge's `amount_refunded` and `refunded`. [Charge object](https://docs.stripe.com/api/charges/object). If the charge is only an id (`ch_…`), `GET /v1/charges/{id}` reads that same object. Any `amount_refunded > 0`, or `refunded: true`, on any invoice is a refund. A charge with `disputed: true` is not "no refund." There is no "latest charge" choice.
3. If a paid invoice (`status` `paid`, or `amount_paid > 0`) has no readable charge object, or the nested `payments` list has `has_more: true`, the refund state is unknown.
4. A refund or an unknown refund state makes that `active` subscription **ambiguous** (P26). A complete invoice list with every charge showing no refund leaves it **paid**.

Subscriptions that are not `active` do not need this invoice read. Status `canceled` stays canceled.

## 3. P28 fixture table

Normative edges. Tests in `tests/rules.test.ts` lock this table. One finding per paid rail for case 1. One finding per applicable rail for case 2. Seats never decide the case.

| Edge | Stripe rail | Polar rail | `is_pro` | Result |
| --- | --- | --- | --- | --- |
| Paid plus a deliberate skip | paid | deliberate skip | false | `paid_locked_out` on Stripe only |
| Paid plus canceled | paid | canceled | false | `paid_locked_out` on the paid rail only |
| Paid plus canceled | paid | canceled | true | No finding. Not case 2 |
| Paid plus ambiguous | paid | ambiguous | false | No finding. `unclassifiedUsers` |
| Canceled plus a deliberate skip | canceled | deliberate skip | true | No finding. `deliberateSkipUsers`. Case 2 does not fire |
| Every applicable rail canceled | canceled | canceled | true | `canceled_still_entitled` on each rail |
| Customer id, zero subscriptions after a complete read | no subscriptions | rail off | false | No finding. `unclassifiedUsers` |
| Deliberate skip only | deliberate skip | rail off | false | No finding. `deliberateSkipUsers`. `allClear` may stay true |
| Null customer ids | does not apply | does not apply | true | Skipped. Not case 2 |
| Seats greater than 0 | paid | rail off | false | `paid_locked_out`. Seats do not block it |
| Non-boolean `is_pro` | paid | rail off | null | No finding. `unclassifiedUsers` |
| Product subscription id points at an old canceled row, another sub is paid | paid and canceled | rail off | false | `paid_locked_out` on the paid subscription. The product column is not a filter |
| Duplicate provider customer id | same id on two users | rail off | either | Those users are excluded. Other users are still compared. Run error |

Same-rail rollup, also tested: any paid subscription makes the rail paid; a deliberate skip plus a canceled subscription on that same rail is ambiguous; zero subscriptions is ambiguous.

## 4. P27 pagination contract

**Stripe.** `GET /v1/subscriptions?status=all&limit=100`, then `starting_after` the last id while `has_more` is true. [Pagination](https://docs.stripe.com/api/pagination). Invoice lists for the refund recipe use the same `has_more` / `starting_after` contract. A page that ends with `has_more: true` and then fails, a list body without `has_more`, or a subscription id that appears twice is `stripe_incomplete_read` or `stripe_http_*`. The partial ids are not compared.

**Polar.** `GET /v1/subscriptions?limit=100&page={n}` with no `status` filter and without the deprecated `active` flag. [List subscriptions](https://polar.sh/docs/api-reference/subscriptions/list). The body has `pagination.total_count` and `pagination.max_page`. A complete read fetches pages `1..max_page` and the collected item count equals `total_count`. Stopping early, a changing `max_page`, a repeated subscription id, or a count mismatch is `polar_incomplete_read` or `polar_http_*`. Absence is counted only after that complete list.

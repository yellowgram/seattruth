# How SeatTruth decides

SeatTruth reads every subscription on each enabled provider, reads one Postgres relation, and compares them per user. This page is the whole rule set. The tests in `tests/rules.test.ts` and `tests/providers.test.ts` lock it.

## 1. Which providers apply to a user

A provider (a "rail") is **enabled** when `mapping.yaml` names its `customer_id` column and its key is set. `customer_id: null` turns a rail off; an empty string is a config error, not "off". At least one rail must be enabled.

For each row, a rail **applies** when that row's customer-id cell is not null. A null cell means the person does not bill on that provider. It does not mean canceled. The same provider customer id on two rows is a run error, and those rows are left out; every other row is still compared.

## 2. One bucket per subscription

| Status (Stripe and Polar) | Bucket |
| --- | --- |
| `active` | **paid**, unless the Stripe refund rule below makes it ambiguous. `cancel_at_period_end` does not matter while it is still active. |
| `canceled` | **canceled** |
| `trialing`, `incomplete`, `incomplete_expired` | **skipped** (not paid yet) |
| `past_due`, `unpaid`, `paused` | **skipped** (payment trouble or a pause; products differ on access) |
| anything else, or missing | **ambiguous** |

**Stripe refund rule (latest period).** For an `active` Stripe subscription, only its latest invoice is checked:

- charge fully refunded (`refunded: true`, or `amount_refunded` ≥ `amount`) → ambiguous;
- charge disputed (Stripe keeps `disputed: true` after the dispute is won or lost) → ambiguous;
- partially refunded → paid;
- `amount_paid` is 0 (100% coupon, paid from balance) → paid;
- paid but the charge cannot be read, or no latest invoice → ambiguous.

Refunds on older invoices are history and are ignored. Polar refunds are not read: a Polar refund does not end the subscription, and only status `canceled` counts as canceled.

## 3. One state per user per rail

After a complete read of that rail:

1. any paid subscription → **paid**;
2. otherwise any ambiguous subscription, or a customer id with zero subscriptions → **ambiguous**;
3. otherwise a mix of skipped and canceled → **ambiguous**;
4. otherwise all skipped → **skipped**; all canceled → **canceled**.

## 4. The two findings

`is_pro` must be a real boolean. `NULL`, strings and numbers are never coerced and make the user ambiguous. Seats are copied onto the alert and never decide anything (`NULL` seats stay `NULL`, not 0).

| Rails that apply | `is_pro` | Result |
| --- | --- | --- |
| any rail ambiguous | any | no finding; counted in `ambiguous_users` |
| ≥ 1 paid, none ambiguous | `false` | **`paid_locked_out`**, one per paid rail |
| ≥ 1 paid | `true` | silence |
| every rail canceled | `true` | **`canceled_still_entitled`**, one per rail |
| every rail canceled | `false` | silence |
| ≥ 1 skipped, none paid, none ambiguous | any | no finding; counted in `skipped_users` |

Examples: paid on Stripe and canceled on Polar with `is_pro = false` is `paid_locked_out` on Stripe only. Canceled on Stripe and trialing on Polar with `is_pro = true` is no finding (the trial blocks case 2).

## 5. What "all clear" means

Exit `0` only when a live run read every enabled rail and the relation completely, with no findings, no ambiguous users, and no errors. Skipped users do not block it. A dry run is never an all-clear. A partial provider read (HTTP error, truncated or repeated page) is a run error, exit `1`; missing ids on a partial page are never treated as "no subscription".

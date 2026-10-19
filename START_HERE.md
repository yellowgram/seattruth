# Start here

SeatTruth is the read-only detector in this repository, MIT licensed. Install it with `npm install seattruth` or clone the repository. You run it with your own keys. Releases before 0.2.0 were published under the previous license; see [release/README.md](release/README.md).

Contact: hello@yellowgram.dev


## You are the operator

You run the kit inside your own GitHub repository and your own database. yellowgram does not host your customer rows, and yellowgram does not join your Slack workspace. There is no money relationship with yellowgram. The tool never charges your customers, and it does not recommend refunds of those customers.

## What you can do today

- Read [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md) and decide whether the two detect cases match a real argument you have had with your database.
- Copy [.env.example](.env.example) and [mapping.example.yaml](mapping.example.yaml) and see whether your schema can fill them in without a custom join.
- Run `npm test` and `npm run compare -- --dry-run`. Both succeed without keys. The dry-run text says it is not an all-clear. That success is not evidence your entitlements match.
- Run `npm run demo:60s` for the fixture clip in [docs/DEMO_60S.md](docs/DEMO_60S.md). Invented rows only. No keys. The dry-run line in that clip is not an all-clear.

## What a live run needs

The detector is already in this repository. A live run still needs your keys. A dry-run does not. The one-org proof checklist is [docs/LIVE_OPERATOR_LOOP.md](docs/LIVE_OPERATOR_LOOP.md). Those boxes are open. This page does not claim that proof is done.

1. A Stripe restricted key (`rk_`) with read access only: Subscriptions, Invoices, and Charges. Secret keys (`sk_`) are refused. Or leave the Stripe rail disabled with `customer_id: null`.
2. A Polar Organization Access Token with `subscriptions:read` only, or leave the Polar rail disabled the same way. Create it in the Polar organization settings. Overview: https://polar.sh/docs/integrate/oat
3. One Postgres view or table that already has `user id`, `is_pro`, `seats`, and the provider customer and subscription ids you use. Map a user id that is not an email address. Seats may be an integer, a bigint, or null. Null is not zero.
4. A database role that can `SELECT` that relation and cannot change it.
5. A Slack incoming webhook on `https://hooks.slack.com/…` for a channel your operators already watch.
6. GitHub Actions secrets for those values, plus `SEATTRUTH_MAPPING_YAML`. The workflow file names those secrets and does not contain the values. The daily cron is the live path once `SEATTRUTH_MAPPING_YAML` is set. A manual dispatch stays a dry-run unless you set `dry_run` to false. If that mapping secret is unset, the schedule skips and exits 0. That skip is not an all-clear. A manual live dispatch fails if the mapping secret is missing. After the mapping secret is set, a missing database URL, a missing credential on an enabled rail, or a missing Slack webhook when a post is required still fails the job.

Limits a green run still does not prove: [docs/WHAT_THIS_WILL_NOT_CATCH.md](docs/WHAT_THIS_WILL_NOT_CATCH.md).

## How to read a result

Ids below are invented. They are not customers.

A dry-run prints: `SeatTruth dry-run: detector is implemented. This is not an all-clear. No charges. No entitlement changes.` Exit 0 on that line is not a pass.

A live finding looks like this, and it is the whole instruction. It does not say which change to make:

```text
SeatTruth paid_locked_out user=user-1 provider=stripe customer=cus_example subscription=sub_example is_pro=false seats=1
SeatTruth canceled_still_entitled user=user-2 provider=polar customer=cus_example subscription=sub_example is_pro=true seats=null
SeatTruth ambiguous_users=4
SeatTruth run_error=mapping_unreadable
```

`ambiguous_users` is a count, not a list of people. `mapping_unreadable` means the mapping file is missing or is not valid YAML. `product_query_failed` means the database read failed. Neither line includes the file text, the query, or the database URL.

Copy `mapping.example.yaml` to `mapping.yaml` before `--live`. Column names are case-sensitive. Set a rail you do not use to `customer_id: null`. An empty string does not turn a rail off. A null customer id on a row skips that rail. A customer id with no subscription, after a complete read, is ambiguous and blocks both cases. It is not a cancel.

These are quiet on purpose, and they are not a request to change a row:

- Paid, and `is_pro` true.
- Canceled on every applicable rail, and `is_pro` false.
- Paid on one rail and canceled on the other, with `is_pro` true.
- A trial, `incomplete`, or `incomplete_expired` only. A live all-clear can include those.
- Stripe `active` with any refund. That user is ambiguous, so neither case fires, and the run is not all-clear.

Any `active` subscription counts as paid, including quantity 0 and any price. There is no price filter. An empty relation can be all-clear and does not prove the view is the population you meant. A local all-clear line says Slack was not posted. That line is not a certification, and it is not sent to Slack.

## What the tool will never do

- Charge a card, refund an order, or open Checkout.
- Change `is_pro`, seats, or a subscription.
- Tell you the SQL to "fix" a row.
- Certify that your billing is correct.

If a row looks wrong, a person on your team changes your product, using your own process.

## Where to read next

| Read | Why |
| --- | --- |
| [docs/WHAT_THIS_WILL_NOT_CATCH.md](docs/WHAT_THIS_WILL_NOT_CATCH.md) | Active means paid, an empty relation can all-clear, a Polar refund is not canceled, dry-run and a skipped schedule are not an all-clear. |
| [docs/DEMO_60S.md](docs/DEMO_60S.md) | One-command fixture clip. Stripe and Polar in the same take. No live keys. |
| [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md) | What the two cases are, and the active rules after DR#3. |
| [SUPPORT.md](SUPPORT.md) | Best-effort, no SLA. |
| [SECURITY.md](SECURITY.md) | Private vulnerability reports. Do not post exploits in Issues. |
| [docs/STATUS.md](docs/STATUS.md) | Where the work actually is. |
| [LICENSE](LICENSE) | MIT. |

## Support

Best-effort GitHub Issues or email to hello@yellowgram.dev. No SLA, no concierge, and no call required to understand the kit.

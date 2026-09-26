# Buyer start here

SeatTruth is not for sale from this repository. The detector can run a read-only compare when you supply your own keys. The Polar listing is dark. This page is the front door you will use once a versioned zip exists, and it is the outline of what an operator has to prepare.

Contact: hello@yellowgram.dev · prefer [www.yellowgram.dev](https://www.yellowgram.dev)

## You are the operator

You run the kit inside your own GitHub repository and your own database. yellowgram does not host your customer rows, and yellowgram does not join your Slack workspace. The tool's only money relationship with you is the SeatTruth subscription, later, when a real deliverable exists. The tool never charges your customers.

## What you can do today

- Read [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md) and decide whether the two detect cases match a real argument you have had with your database.
- Copy [.env.example](.env.example) and [mapping.example.yaml](mapping.example.yaml) and see whether your schema can fill them in without a custom join.
- Run `npm test` and `npm run compare -- --dry-run`. Both succeed without keys. The dry-run text says it is not an all-clear. That success is not evidence your entitlements match.

## What a live run needs

The detector is already in this repository. A live run still needs your keys. A dry-run does not.

1. A Stripe restricted key (`rk_`) with read access only: Subscriptions, Invoices, and Charges. Secret keys (`sk_`) are refused. Or leave the Stripe rail disabled with `customer_id: null`.
2. A Polar Organization Access Token with `subscriptions:read` only, or leave the Polar rail disabled the same way. Create it in the Polar organization settings. Overview: https://polar.sh/docs/integrate/oat
3. One Postgres view or table that already has `user id`, `is_pro`, `seats`, and the provider customer and subscription ids you use. Map a user id that is not an email address. Seats may be an integer, a bigint, or null. Null is not zero.
4. A database role that can `SELECT` that relation and cannot change it.
5. A Slack incoming webhook on `https://hooks.slack.com/…` for a channel your operators already watch.
6. GitHub Actions secrets for those values, plus `SEATTRUTH_MAPPING_YAML`. The workflow file names those secrets and does not contain the values. The daily cron is the live path. A manual dispatch stays a dry-run unless you set `dry_run` to false. Until the secrets exist, a live job fails. That failure is not an all-clear.

## What the tool will never do

- Charge a card, refund an order, or open Checkout.
- Change `is_pro`, seats, or a subscription.
- Tell you the SQL to "fix" a row.
- Certify that your billing is correct.
- Sell you an audit engagement.

If a row looks wrong, a person on your team changes your product, using your own process.

## Where to read next

| Read | Why |
| --- | --- |
| [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md) | What the two cases are, and the active rules after DR#3. |
| [docs/MINIMUM_SUPPORT_CHECKLIST.md](docs/MINIMUM_SUPPORT_CHECKLIST.md) | What "supported" will mean. |
| [docs/BUYER_NEEDS_BEYOND_CHECKLIST.md](docs/BUYER_NEEDS_BEYOND_CHECKLIST.md) | Needs that will not be in the first kit. |
| [docs/STATUS.md](docs/STATUS.md) | Where the work actually is. |
| [LICENSE](LICENSE) | Single-organization commercial terms. No warranty of entitlement correctness. |

## Support

English email to hello@yellowgram.dev. The boundary of that support is in the minimum-support checklist. There is no concierge, and there is no call required to understand the kit.

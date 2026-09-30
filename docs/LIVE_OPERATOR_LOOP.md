# Live operator loop

Prove one organization on a live run. This file is the checklist. It does not contain secrets. It does not say a live org has been proved. The boxes stay open until an operator checks them on a real org (yellowgram or a friendly org).

You run the kit in your own GitHub repository and your own database. yellowgram does not operate a hosted endpoint for this SKU and does not join the Slack workspace.

Read [WHAT_THIS_WILL_NOT_CATCH.md](WHAT_THIS_WILL_NOT_CATCH.md) before treating a green check as revenue assurance. A dry-run, and a schedule that skips because `SEATTRUTH_MAPPING_YAML` is unset, are not an all-clear.

Issue: https://github.com/yellowgram/seattruth/issues/17

## Before the first live day

- [ ] Copy [../mapping.example.yaml](../mapping.example.yaml) to `mapping.yaml`. Column names match one Postgres relation. One tenant. The file has no SQL text.
- [ ] Store that file as the GitHub Actions secret `SEATTRUTH_MAPPING_YAML`. The workflow file does not contain the file text. See [../.github/workflows/compare.yml](../.github/workflows/compare.yml) and [../scripts/live-compare-gate.sh](../scripts/live-compare-gate.sh).
- [ ] Stripe: a restricted key (`rk_`) with read on Subscriptions, Invoices, and Charges, stored as `STRIPE_RESTRICTED_KEY`. Secret keys (`sk_`) are refused. Or set Stripe `customer_id` to null and store no Stripe key.
- [ ] Polar: an Organization Access Token with scope `subscriptions:read` only, stored as `POLAR_RESTRICTED_TOKEN`. Do not grant `subscriptions:write`. Or disable the Polar rail the same way. Overview: https://polar.sh/docs/integrate/oat
- [ ] Postgres: a role that can `SELECT` the mapped relation and cannot write. The URL is `PRODUCT_DATABASE_URL`. The kit does not create the role.
- [ ] Slack: an incoming webhook on a channel operators already watch, stored as `SLACK_WEBHOOK_URL`.
- [ ] Confirm `.env` and `mapping.yaml` are not committed. Placeholders live in [../.env.example](../.env.example).

## One live proof

Do not paste secrets or customer rows into git. Write the result where your org already keeps ops notes.

- [ ] Manual dispatch of `compare` with `dry_run` set to false. The job reads the enabled rails and the relation. It does not charge, write `is_pro`, or auto-fix.
- [ ] The run ends in an honest result:
  - a real finding (`paid_locked_out` or `canceled_still_entitled`), or a non-zero ambiguous count, posted to Slack; or
  - a live all-clear (exit 0) after the operator has checked that the relation is the population they meant. An empty relation can all-clear without proving that.
- [ ] The daily cron `0 6 * * *` runs live because `SEATTRUTH_MAPPING_YAML` is set. The next scheduled run is not the skip line. A skip is not an all-clear.
- [ ] Slack stays quiet on a live all-clear. The kit does not post a daily all-clear (P24, P30). A red GitHub Actions check is the failure signal.

## Not claimed here

No dogfood result is recorded in this repository. No sample secret is included. Operator boxes above are the proof. Support stays email to hello@yellowgram.dev. Boundary: [../SUPPORT.md](../SUPPORT.md).

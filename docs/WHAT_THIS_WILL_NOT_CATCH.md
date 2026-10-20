# What a clean run does not prove

SeatTruth reports two disagreements. Exit 0 means it found neither, not that revenue and access match. It is read-only and has no auto-fix. You run it; yellowgram does not operate a hosted endpoint for it. Rules: [RULES.md](RULES.md).

## Any active subscription counts as paid

Status `active` is paid. Price, product and quantity are not filters. An add-on counts. Quantity `0` on an active subscription still counts as paid. If your product has several tiers behind `is_pro`, SeatTruth cannot tell which tier was paid for.

## An empty relation can finish clean

A relation that was read successfully and returned no rows has nothing to disagree with. Check that the view is the population you meant before you trust the first clean run.

## Refunds and disputes

- Stripe: only the latest invoice of an active subscription is checked. A full refund or a dispute there makes the user ambiguous; a partial refund does not. A won dispute still counts until the next invoice replaces it. A full refund on an earlier invoice, for example just before a mid-period upgrade, is not seen.
- Polar: refunds are not read. A refunded Polar subscription that is still `active` counts as paid.

## Dunning and pauses are skipped

`past_due`, `unpaid` and `paused` are counted as skipped. If your product cuts access on `unpaid` and a user still has `is_pro = true`, SeatTruth does not report it.

## Dry runs and skipped schedules

`--dry-run` exits 0 and is never an all-clear. The included workflow's daily schedule exits 0 without comparing until `SEATTRUTH_MAPPING_YAML` is set; that skip is not an all-clear either.

## Scope

One Postgres relation, one mapping file, Stripe and Polar only. No webhook receiver, no history between runs, no ignore list or snooze: a repeated finding stays visible every run.

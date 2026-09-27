# 60-second demo script

**This clip is the product.** One continuous take. Stripe and Polar in the same clip. Not two provider demos.

**Script only.** This repo has no video. SeatTruth (the product agent) films the screen and captions take after LaunchGate SR APPROVE. LaunchGate runs FR after the mp4 and the srt land. The founder does not film. The founder still owns Polar go-live and distribution decisions.

## Kill criterion

If this one clip cannot beat a Stripe-only free substitute or a ProdVerdict-style screenshot, it fails the gate. Those substitutes do not show Stripe and Polar in the same minute: `paid_locked_out` on Stripe with `is_pro` false, `canceled_still_entitled` on Polar with `is_pro` true, and silence when paid and `is_pro` is true. If the clip cannot, stop. Do not add a third detect case. Do not add auto-fix. Do not split the proof into a Stripe video and a Polar video and call either one the gate.

## Off camera

No live Stripe key. No live Polar key. No database URL. No Slack webhook. The demo does not read `.env`.

```bash
npm ci
npm run build
```

## On camera — one clip

Camera stays on this terminal. One command. No second take for the other provider.

```bash
npm run demo:60s
```

That command builds if needed, then runs `scripts/demo-60s.ts`. The script calls `dryRunResult`, `classifyStatus`, `compareSnapshots`, and `buildSlackAlert` on invented rows. Both rails are enabled. It does not call Stripe, Polar, Slack, or Postgres.

Leave these proof lines on screen, in this order, in the same clip:

1. `SeatTruth dry-run: detector is implemented. This is not an all-clear. No charges. No entitlement changes.`
2. `SeatTruth paid_locked_out user=user-locked provider=stripe customer=cus_demo_locked subscription=sub_demo_locked is_pro=false seats=2`
3. `SeatTruth canceled_still_entitled user=user-canceled provider=polar customer=cus_demo_canceled subscription=sub_demo_canceled is_pro=true seats=1`
4. `SeatTruth silence on match: user=user-paid-match stripe=paid polar=paid is_pro=true no finding`
5. `SeatTruth honesty: read-only compare. No charges. No auto-fix.`

The command exits non-zero if the wall clock reaches 60 seconds, any of those lines is missing, or the lines are not this set in this order.

Ids are invented. They are not customers. The rows behind those lines:

- `user-locked` is Stripe `active` (paid) and Polar `canceled`, `is_pro` false, seats 2. The only finding is Stripe `paid_locked_out`. The Polar cancel does not hide it.
- `user-canceled` is Polar `canceled`, no Stripe customer, `is_pro` true, seats 1. The finding is Polar `canceled_still_entitled`.
- `user-paid-match` is Stripe `active` and Polar `active`, `is_pro` true. That match is silence. The script prints the silence line because the compare returned no finding for that user.

## Locked captions / VO (burn first)

Burn these on the same take, in this order. It is the proof-line order. Do not cut away.

1. Dry-run. The detector is in. This is not an all-clear. No charges. No entitlement changes.
2. Paid on Stripe, `is_pro` false. That is `paid_locked_out`.
3. Canceled on Polar, `is_pro` true. That is `canceled_still_entitled`.
4. Paid, and `is_pro` true, is silence. No finding.
5. Read-only compare. No charges. No auto-fix.
6. www.yellowgram.dev or hello@yellowgram.dev.

## Price and CTA

Soft-WTP stays off. This file has no Polar Checkout URL.

Say a price only if the take mentions one, and only this: **$99 once** per organization. The first 10 organizations are **$79 once**. The refund window is **14 days**. That window is the SeatTruth purchase, not an end-customer refund.

CTA, if the take ends on one: [www.yellowgram.dev](https://www.yellowgram.dev) or hello@yellowgram.dev.

## If it does not fit in one clip

`npm run demo:60s` is the whole take, and only after `npm ci` and the build have already finished off camera. If that command cannot finish inside the minute, the take fails the kill criterion. Do not swap in a screenshot. Do not cut Polar to save time. Do not drop Stripe to save time. Do not approve two clips, one per provider.

`npm test` remains the code ship gate. It is not a second demo. The thing that has to beat a Stripe-only substitute is this one clip.

## Not in this file

No recording in this repo yet. SeatTruth films the take after LaunchGate SR APPROVE. The founder does not film. No live keys. No Polar checkout. Soft-WTP off. The purchase-refund window stays 14 days. This clip is not that refund. Do not change the Polar listing. Do not reseal a release zip. Do not create a version tag.

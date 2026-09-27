# Design review DR#3

This pull request is **DR#3 only**. Three experts attack the post-DR#2 rules in sequence. This is the last design pass before the 4th DR. It does not contact LaunchGate, and it does not implement the detector.

- DR#1: https://github.com/yellowgram/seattruth/pull/1
- DR#2: https://github.com/yellowgram/seattruth/pull/2

The winning rule text is in [MVP_SCOPE.md](MVP_SCOPE.md).

## Expert A — residual false cases

**Attack.** `trialing`, `incomplete`, and `incomplete_expired` sit in the same bucket as `past_due` and unknown strings. Every trial forces `allClear` false. A normal Polar or Stripe trial population makes the daily job red forever, and operators mute it. That mute is how a real lockout gets missed.

**Delta.** **P25** supersedes P14's single bucket. Those three statuses are a deliberate skip. They do not emit a finding and do not, by themselves, force `allClear` false. `past_due`, `paused`, and `unpaid` stay ambiguous and still block `allClear`. A green run is allowed while people are on a trial. It is not allowed while people are past due.

**Attack.** P15 says every applicable rail must be paid or canceled before any finding. A Stripe `active` subscription plus a Polar trial then hides `paid_locked_out`. That is a false negative on the case the product exists to catch.

**Delta.** **P28** supersedes P13 and P15. A deliberate-skip rail does not veto a paid rail. Case 1 still fires when `is_pro` is false and some applicable rail is paid, as long as none is ambiguous. Case 2 still requires every applicable rail to be canceled, so a trial blocks "still entitled." There is still no primary rail.

**Attack.** "Latest paid charge" is not one object when an annual invoice and a proration both exist. An implementer will pick one and invent a cancel.

**Delta.** **P26** supersedes P12's refund test. On Stripe, any refund on an `active` subscription is ambiguous. The kit does not decide which charge was the real one. Status `canceled` is the only canceled bucket. If refund presence cannot be determined, the subscription is ambiguous, not paid.

**Attack.** Any `active` subscription, including an add-on or quantity `0`, makes the rail paid. That false-pays a customer whose pro price is canceled.

**Delta.** **P29** records the limit and refuses the fix. A price allow-list is plan drift. DR#3 does not add it. LaunchGate has to see that limit in the open.

**Held.** The two case names stay. Kill criterion 1 does not fire.

## Expert B — Polar refunds, missing subscriptions, enums

Ran after Expert A's deltas.

**Attack.** Polar order status `refunded` looks like case 2. DR#2 left "a Polar refund while active" unclassified and did not cite the refund doc, so a later implementer can still join orders and call the subscription canceled.

**Delta.** P26 cites [Polar refunds](https://polar.sh/docs/features/refunds), read 2026-09-26: refunding an order tied to a subscription returns the money and does not end the subscription. The kit does not read Polar order or refund objects for classification. Order statuses are not subscription statuses. Case 2 on Polar is subscription status `canceled` only.

**Attack.** Webhook name `subscription.revoked` will be stuffed into the status field. It is not in the subscription enum. Mapping it to `canceled` is a guess.

**Delta.** P25. Event names are not statuses. A missing or non-enum status is ambiguous.

**Attack.** A truncated subscription list makes everyone past the last page look like "no subscription," which P13 called unclassified and which a sloppy port will call canceled.

**Delta.** **P27.** An incomplete provider read is a run error. Absence counts only after a complete list. A partial page never becomes a wave of cancels.

**Attack.** Customer id set, complete read, zero subscriptions. Still tempting to call that canceled.

**Delta.** P28 keeps that row ambiguous, not canceled. Null customer id still means the rail does not apply. No new "orphan" finding.

**Held.** No new Polar field was invented. The order enum was cited only to say it is not used.

## Expert C — support v3, temptation, 4th DR

Ran after Expert B's deltas.

**Attack.** Checklist v2 still lets a reader think the zip is imminent, or that a quiet Slack channel means the cron ran. A Slack webhook in the workflow file is the same leak as a key in git. Private Issues remain a back door into free fixes.

**Delta.** Checklist v3 states, in the header and in the zip section, that the zip, the SHA-256, and `POLAR_DELIVERABLES` are absent and this PR does not add them. Slack webhook URLs are GitHub Actions secrets, rotated in the same order as provider keys, and never written into the workflow file, logs, or message body (P23). Cron failure visibility is a red GitHub Actions check on a non-zero exit, plus the operator's GitHub failure notification. The kit does not send a daily all-clear Slack message (P24, P30). That message would be a false comfort and a step toward "just clear these." Support stays email only. A collaborator seat on the buyer's private repo is not the support path.

**Attack.** New ways to drag the kit into auto-fix or Soft-WTP:

- "Ignore trials in the UI" as a per-customer toggle. The status split is a written rule, not a snooze list.
- "Only alert on the pro price" so the channel is quieter. That is plan drift, refused here.
- "Send all-clear so we know you ran." Refused.
- "Discount this month if the first week is noisy." Soft-WTP. Refused.
- "We'll add you to the private repo and you can patch `is_pro`." Refused.

**Delta.** Those lines are in [BUYER_NEEDS_BEYOND_CHECKLIST.md](BUYER_NEEDS_BEYOND_CHECKLIST.md) as refusals. No price was chosen. No refund window was chosen.

**Attack.** Is this pack ready for the 4th DR?

**Delta.** **Yes, as input to that review. Not as approval.** The cases are still decidable without a write or a guessed schema. The contradictions DR#3 found are now rules. The limits LaunchGate must accept or reject are listed in [MVP_SCOPE.md](MVP_SCOPE.md). This PR does not contact LaunchGate.

## What DR#3 did not do

- Did not open the 4th DR.
- Did not request LaunchGate APPROVE.
- Did not implement provider reads, SQL, or Slack delivery.
- Did not set price or the refund window.
- Did not create a zip, a checksum, or `POLAR_DELIVERABLES`.
- Did not add Chargebee, Autumn, auto-fix, or Soft-WTP.

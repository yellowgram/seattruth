# Design review DR#2

This pull request is **DR#2 only**. Three experts attack in sequence inside this one review. That is the progressive pass for this PR. It is not DR#3, and it does not ask LaunchGate to approve.

DR#1: https://github.com/yellowgram/seattruth/pull/1

The rule text that won is in [MVP_SCOPE.md](MVP_SCOPE.md). This file is the attack log. Detector code stays unimplemented.

## Expert A — billing state

**Charter.** False positives and false negatives in P1–P4 and P9. Polar status holes. Mixed rails. What `allClear` is allowed to mean.

**Attack.** P2 and P3 can both fire. Status `active` plus a full refund of the latest charge is "paid" and "canceled" at once. An implementer will pick one and create either a false lockout or a false "still entitled."

**Delta.** P2 and P3 are superseded by **P12**. When the signals disagree, the subscription is `unclassified`. A partial refund is unclassified even if status is `canceled` or `active`. Status `canceled` alone is `canceled_or_refunded`. Status `active` with no full-refund disagreement is `paid`.

**Attack.** `cancel_at_period_end` is true while status is still `active`. Polar's own docs say the subscription keeps working until period end, and the status stays `active` until revoke. Treating the flag as a cancel is a false case 2 for someone who has paid for the current period.

**Delta.** P12: the flag does not change the bucket. Cited from Polar's subscription docs and the subscription status enum on 2026-09-26, and from Stripe's subscription object for the same flag. Polar's enum in that API page is `incomplete`, `incomplete_expired`, `trialing`, `active`, `past_due`, `canceled`, `unpaid`. Anything else, including a webhook that says `paused` without that enum value, stays unclassified.

**Attack.** Map Polar `past_due` or `unpaid` to canceled because Polar revokes benefits on `unpaid`, and buyers asked DR#1 to treat `past_due` as canceled.

**Delta.** Refused. `past_due` and `unpaid` stay unclassified on both rails. Polar's grace period and the product's `is_pro` are different clocks. Equating them would write the buyer's access policy into the kit. That is the auto-fix temptation in rule form. Case 2 does not grow a new status.

**Attack.** Polar `active` "obviously" means paid, so ship the map by guessing.

**Delta.** The word is mapped because the API enum and the benefit docs were read, and the row is written in P12. A status with no row is unclassified. Guessing remains forbidden. Polar benefit objects are not a stand-in for `is_pro`.

**Attack.** No subscription object for a customer id is the same as canceled. That flags every empty lookup as case 2.

**Delta.** **P13.** No subscription is `unclassified`, not canceled. A null customer-id cell means the rail does not apply. It is not a finding. "Entitled with no billing id" stays out of scope. Comps with null ids are skipped. Comps the operator wants to exclude belong in the view, not in an ignore list.

**Attack.** One `past_due` user, or one failed Polar status, was a run error under P4, so `allClear` is false and the job looks broken every day a trial exists. Operators will mute the channel, which is how a real lockout gets missed.

**Delta.** **P14** supersedes that half of P4. Unclassified users increment a count. They are not a run error. They still forbid `allClear`. Slack gets one count line, not a page per trial. Other users are still compared.

**Attack.** Stripe is `paid`, Polar is `unclassified`, `is_pro` is false. P4 hides the lockout. The "fix" is to declare Stripe the primary rail.

**Delta.** **P15.** No primary rail. The hidden lockout is real, and a guessed primary rail is worse: it will also hide a stale Stripe `active` beside a Polar dunning state. The operator disables the rail that is not theirs, or accepts the unclassified count. DR#2 does not add a primary-rail field.

**Attack.** Coerce `is_pro` from `1`/`0` or `"true"`, and coerce null seats to `0`, so more rows produce findings.

**Delta.** **P11** supersedes P1. Only real booleans count. Null seats are not zero. Seats still do not decide the case, and they do not suppress case 1 when `is_pro` is false and seats are greater than zero. Suppressing that row would hide a lockout behind a quantity column the kit does not interpret.

**Attack.** `allClear` true when findings are empty, even if unclassified users remain, or when the dry-run job is green.

**Delta.** **P16** supersedes P9. Unclassified users block `allClear`. Dry-run exit 0 is not a pass. Live exit codes are specified for the implement PR and are not built here.

**Held.** The two detect cases stay. DR#2 did not need a write, a fuzzy match, or a guessed schema to keep them, so kill criterion 1 does not fire.

## Expert B — mapping file

Ran after Expert A's deltas.

**Attack.** P8's regex blocks quotes, and then an implementer still concatenates the YAML into SQL, or trusts `search_path`. A second schema named like the relation can shadow it. `public.users` needs a dot, and allowing the dot brings injection back.

**Delta.** **P18** supersedes P8. Schema is required. One identifier each, 1–63 characters, then double-quoted. No dot. No `search_path` fallback. Missing schema is a run error. The example mapping and `MappingDocument.schema` match that. The loader is still not implemented.

**Attack.** One file should scan every tenant schema in a shared database.

**Delta.** **P19.** One file, one URL, one schema, one relation. A second tenant is a second workflow. A tenant loop is a multi-tenant product and a way to point the `SELECT` at the wrong people.

**Attack.** Null seats and a missing seats column look the same in JavaScript (`undefined` and a coerced `0`).

**Delta.** **P20.** NULL stays null. A missing column is a run error. `0` stays `0`.

**Attack.** `customer_id: ""` parses loosely and disables a rail, or the file disables both rails and the run reports all-clear.

**Delta.** **P21** and **P22.** Empty string is a config error. Zero enabled rails is a run error. P7's "YAML null disables the rail" stands.

**Attack.** One duplicated Stripe customer id aborts the run under P5, so nobody else is compared that day. That is a false negative for every clean user.

**Delta.** **P17** supersedes P5. The duplicate users drop out with a run error. Everyone else is compared. `allClear` stays false. No row is chosen as the winner.

**Held.** Hand-written id pair lists stay parked. A second join path was the injection's cousin.

## Expert C — support, buyer temptation, skim

Ran after Expert B's deltas.

**Attack.** The v1 checklist says "rotate keys" and does not say in which order. The dangerous order is revoke first, then a red cron, then a buyer asking yellowgram to "just fix today's users."

**Delta.** Checklist v2 states the order: create the new restricted key, update the GitHub secret, run a live dispatch after the detector exists, then revoke the old key. Never put the key in git, Issues, or Slack. **P23** forbids logging it. The steps are not implemented code.

**Attack.** Dry-run and live are easy to swap. A cron that only dry-runs never checks production. A green dry-run badge reads as "billing is fine."

**Delta.** P16, and the checklist: once live exists, the schedule is live, and a manual run is dry unless the operator sets live on purpose. This scaffold still refuses `--live`. The workflow comment already says a green dry-run is not an all-clear.

**Attack.** Buyers will open Issues on their private repo, paste a row, and expect a reply. Yellowgram cannot see that repo. The paste becomes a secret and customer-id leak, and the reply becomes free integration work.

**Delta.** Support is email to hello@yellowgram.dev only. Private-repo Issues are not a support channel. Do not ask for secrets or production rows in email either. A redacted finding id is enough.

**Attack.** Ship `POLAR_DELIVERABLES` now so the listing can go live "when we're ready."

**Delta.** Refused. The file stays absent. The zip, when it exists, is SHA-256 lowercase hex and must not contain `.env`, `mapping.yaml`, or `node_modules`. Listing go-live remains a founder (via CoS) decision after those bytes exist.

**Attack.** Workflows that push the product into Soft-WTP or auto-fix:

- "Set `is_pro` for the three users in the alert."
- "Don't run it, just send the `UPDATE`."
- "Snooze this customer for 30 days."
- "Price it as a percent of what the finding saved."
- "Add Chargebee or Autumn, it's the same connector."
- "Tell us whether to refund them."

**Delta.** All refused. **P24** supersedes P10 and bans the hint as well as the write. Snooze and dedupe-by-hiding are refused, not deferred. Percent-of-savings pricing is Soft-WTP. Chargebee and Autumn are out. Refund advice for the end customer is out. The SeatTruth refund window, if any, is a founder decision and is not this alert. The allowed comp workflow is the operator's own view, not a kit-side exception list.

**Attack.** The Polar gap claim is stale or over-claimed.

**Delta.** No new competitor prices and no new traction numbers. The skim date stays 2026-09-26. DR#2 read Polar's own API enum so the status map would not be invented. That enum is not a competitor. RevReclaim still has Polar for a different job, and it still markets auto-fix. The entitlement-reconciler gap among DriftExact, ProdVerdict, Venwai, and EntitleGuard is unchanged. A later DR that re-fetches those sites may supersede the claim. This one does not decorate it.

## What DR#2 did not do

- Did not run DR#3.
- Did not request LaunchGate.
- Did not implement provider reads, SQL, or Slack delivery.
- Did not set the price inside $49–99 or the refund window.
- Did not open a Polar listing.

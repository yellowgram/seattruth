# MVP scope

**Rules frozen at DR#3.** This branch is the 4th DR. The LaunchGate packet is [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md). No rule id in this file changed for that packet. DR#1 is [pull request #1](https://github.com/yellowgram/seattruth/pull/1). DR#2 is [pull request #2](https://github.com/yellowgram/seattruth/pull/2). DR#3 is [pull request #3](https://github.com/yellowgram/seattruth/pull/3). See [STATUS.md](STATUS.md).

## Cadence

Ordinary design and code gates do not wait on the founder. LaunchGate is the 4th gate.

1. **DR×3.** Done. DR#1, DR#2, and DR#3 are separate pull requests. This file's rules are the DR#3 text.
2. **4th DR → LaunchGate APPROVE** before any implement PR. The packet is [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md). Approval has not happened.
3. **Implement PR.** Detector code. Not started.
4. **CR×3.** Three code reviews of that implement work.
5. **4th CR → LaunchGate APPROVE** before squash-merge.

Founder (via CoS) decides only: price, refund window, Polar listing go-live, Soft-WTP, spending money, or scope that becomes Chargebee, Autumn, or auto-fix. Polar stays dark until a versioned zip, its SHA-256, and `POLAR_DELIVERABLES` are real.

Do not implement the detector from this PR.

SeatTruth compares Stripe and Polar, read-only, with one product database. The product fields in view are `is_pro` and seats. The kit is restricted keys, one mapping file, a GitHub Action on a cron, and a Slack alert.

## In

- Two detect cases, defined below, and nothing else presented as a finding.
- Stripe, via a restricted key (`rk_`), read permissions only.
- Polar, via one Organization Access Token, read scopes only. Token overview: https://polar.sh/docs/integrate/oat. Scope names are confirmed in the Polar token UI at implementation time. This doc does not invent scope strings.
- One mapping file. Shape: [../mapping.example.yaml](../mapping.example.yaml). `schema` is required (P18).
- One Postgres schema and one relation, and one `SELECT` of the mapped columns.
- A database role that can read that relation and cannot write.
- GitHub Actions: daily cron (`0 6 * * *`) plus `workflow_dispatch`. The workflow in this repo dry-runs and has no live secrets. A green dry-run is not an entitlement pass (P30).
- Slack incoming webhook on the operator's channel when a real run has a finding, a non-zero unclassified count, or a run error.
- English docs and English alerts.
- Self-serve price band **$49–99 per month** once a versioned zip exists. The exact number is a founder (via CoS) decision. Design reviews do not wait on it. There is no checkout in this repo.

## Detect cases

A **finding** is one of these. Both are operator review items. Neither is an instruction.

1. **`paid_locked_out`.** An applicable rail classifies the customer as paid, every applicable rail is classified, and the product `is_pro` value is boolean `false`.
2. **`canceled_still_entitled`.** Every applicable rail classifies the customer as canceled or fully refunded, at least one rail applies, and the product `is_pro` value is boolean `true`.

`seats` is copied onto the alert. A difference between provider quantity and `seats` is not a third finding. SQL `NULL` seats are not the number zero (P11, P20).

An **applicable rail** for a row is an enabled rail whose customer-id cell on that row is not null. A null cell means the rail does not apply to that person. It does not mean canceled.

## Rules

DR#1 text that failed review stays in the table, marked superseded. Active rules are the ones that are not superseded.

| Active | Supersedes | Topic |
| --- | --- | --- |
| P6 | — | Slack field allow-list. Stands. |
| P7 | — | When a rail is enabled. Tightened by P21 and P22, not replaced. |
| P11 | P1 | Booleans and null seats. |
| P12 | P2, P3 | **Superseded by P26 (DR#3).** |
| P13 | — | **Superseded by P28 (DR#3).** |
| P14 | P4 | **Superseded by P25 (DR#3).** |
| P15 | P4 | **Superseded by P28 (DR#3).** No primary rail, restated there. |
| P16 | P9 | **Superseded by P30 (DR#3).** |
| P17 | P5 | Duplicate customer ids. Stands. |
| P18 | P8 | Schema, identifier grammar, quoting. |
| P19 | — | One mapping file is one tenant. |
| P20 | — | NULL seats versus a missing column. |
| P21 | — | An empty string does not disable a rail. |
| P22 | — | At least one rail enabled. |
| P23 | — | Do not log secrets. |
| P24 | P10 | No fix, refund, or SQL advice. Stands. |
| P25 | P14 | Ambiguous users versus deliberate skips. |
| P26 | P12 | Status map. Polar refunds do not end a subscription. |
| P27 | — | A partial provider read is a run error. |
| P28 | P13 | Roll up subscriptions after the P25 split. |
| P29 | — | No price, product, or quantity filter. Known limit. |
| P30 | P16 | `allClear` ignores deliberate skips and nothing else. |

| Id | Rule |
| --- | --- |
| P1 | **Superseded by P11 (DR#2).** The entitlement bit is `is_pro`. Boolean `true` means entitled. Boolean `false` means locked out. `NULL` is unclassified. `seats` is payload, including when it is `NULL` or `0`. |
| P2 | **Superseded by P12 (DR#2).** Each provider subscription maps to `paid`, `canceled_or_refunded`, or `unclassified`. Stripe statuses that count as **paid**: `active`, and only when that subscription is not fully refunded. Stripe statuses that count as **canceled_or_refunded**: `canceled`, and a full refund of the latest paid charge on that subscription. Stripe statuses that stay **unclassified**: `trialing`, `past_due`, `incomplete`, `incomplete_expired`, `paused`, `unpaid`, and any status not in this sentence. Polar status strings are copied from Polar's API schema at implementation time into the same three buckets. A Polar string with no written mapping is unclassified. |
| P3 | **Superseded by P12 (DR#2).** A refund counts as `canceled_or_refunded` only when it is a full refund of the latest paid charge (Stripe) or the equivalent latest paid order (Polar, confirmed against their API at implementation time). A partial refund is unclassified. |
| P4 | **Superseded by P14 and P15 (DR#2).** A case finding is emitted only when every **enabled** rail has a classification of `paid` or `canceled_or_refunded`. If any enabled rail is unclassified, or a read fails, there is no case finding for that user. The run records an error. `allClear` stays false. |
| P5 | **Superseded by P17 (DR#2).** The same provider customer id on two product users is a run error (ambiguous map). It is not a finding type and it is not silently picked. |
| P6 | Slack text may include the case id, product user id, provider name, provider customer id, subscription id, `is_pro`, and `seats`. It includes no email, no customer name, and no card data. An unclassified summary may include a count and no per-user dump (P14). |
| P7 | A rail is enabled when the mapping sets its `customer_id` column and the matching restricted credential is present. A mapped rail with a missing credential is a run error. A rail with `customer_id: null` is disabled and is not read. An empty string is not null (P21). Zero enabled rails is a run error (P22). |
| P8 | **Superseded by P18 (DR#2).** The product read is one `SELECT` of the mapped columns. Relation and column names must match `^[A-Za-z_][A-Za-z0-9_]*$`. The mapping file contains no SQL text. |
| P9 | **Superseded by P16 (DR#2).** `allClear` may be true only on a live run that read every enabled rail and the product relation, with zero findings and zero errors. Dry-run, stub, and failed runs set `allClear` false. Empty findings alone are not a clean bill. |
| P10 | **Superseded by P24 (DR#2).** Alert text and CLI text name the disagreement. They do not tell the operator to set `is_pro`, change seats, cancel, refund, or charge. |
| P11 | Entitlement bit remains boolean `is_pro` only. `true` means entitled. `false` means locked out. `NULL`, strings, and numbers are unclassified. Do not coerce `"true"`, `"t"`, `1`, or `0` into a boolean. `seats` never decides the case. SQL `NULL` seats are not `0`, and the implementation must not `COALESCE` them to `0`. `is_pro` false with `seats` greater than 0 is still case 1 when the rail rules say so: seats do not suppress a lockout, and they do not create a finding of their own. |
| P12 | **Superseded by P26 (DR#3).** Written status map. Do not guess from a similar word. `cancel_at_period_end` (Stripe and Polar) does not change the bucket while status is still `active`. Sources for Polar: [subscription status enum](https://polar.sh/docs/api-reference/subscriptions/list) and [subscription behavior](https://polar.sh/docs/features/subscriptions/introduction), read 2026-09-26. Stripe's `cancel_at_period_end` flag is the same shape: [subscription object](https://docs.stripe.com/api/subscriptions/object). **Paid:** Stripe or Polar status `active`, and the refund row below is not "disagree". **Canceled or refunded:** status `canceled`. **Unclassified:** `trialing`, `past_due`, `incomplete`, `incomplete_expired`, `paused`, `unpaid`, any status not in this list, a partial refund, and status `active` together with a full refund of the latest paid Stripe charge. A Polar refund while status is still `active` is unclassified. DR#2 does not cite a Polar order-refund field, so it does not invent one. `past_due` is not canceled on either rail. Polar benefit grants are not `is_pro`. |
| P13 | **Superseded by P28 (DR#3).** On one rail, for one product user: if any subscription is `paid`, the rail is `paid`. Otherwise if any subscription is `unclassified`, or the customer id is set and the provider returns no subscription, the rail is `unclassified`. Otherwise if there is at least one subscription and all are `canceled_or_refunded`, the rail is `canceled_or_refunded`. A null customer-id cell means that rail does not apply to that user. It is not a cancel, and it is not a finding. A user with no applicable rail is skipped. Skipped users do not, by themselves, set `allClear` false. The kit does not grow an "entitled but no billing id" finding. |
| P14 | **Superseded by P25 (DR#3).** An unclassified user produces no case finding and increments `unclassifiedUsers`. That is not a run error, and it does not abort the rest of the run. `allClear` is false while the count is above zero. Slack gets one summary line with the count, not one message per unclassified user, and that line does not tell anyone to change access. A read failure, a bad mapping, a missing credential, or zero enabled rails is a run error (P16). |
| P15 | **Superseded by P28 (DR#3).** There is no primary rail. Case findings for a user require every applicable rail to be `paid` or `canceled_or_refunded`. If any applicable rail is `unclassified`, P14 applies and neither case fires. Case 1 emits one finding per applicable rail that is `paid`. Case 2 emits one finding per applicable rail. The way to ignore a stale second billing id is to disable that rail in the mapping, or to use a product view that does not select those rows. The kit does not pick the "real" subscription. |
| P16 | **Superseded by P30 (DR#3).** `allClear` is true only on a live, implemented run that read every enabled rail and the product relation, with zero findings, zero errors, and `unclassifiedUsers` of 0. An empty relation that was read successfully can be `allClear`. That does not prove the operator's view is the right population. Future live exit codes: `0` only when `allClear` is true; `2` when the run finished and `allClear` is false because of findings or unclassified users; `1` when a run error occurred. Dry-run exits `0`, sets `allClear` false, and says it is not an all-clear. The scaffold's `--live` exit `2` is still the not-implemented refusal. A green dry-run workflow is not a required check that entitlements passed. |
| P17 | The same provider customer id on two product users excludes those users, records a run error, and sets `allClear` false. Other users are still compared. The run does not pick a row and does not stop before that. |
| P18 | `product.schema` is required. Schema, relation, and every column name match `^[A-Za-z_][A-Za-z0-9_]*$` and are 1 to 63 characters. After that check, each identifier is double-quoted in the `SELECT`. The mapping value is never interpolated raw. No dots, no spaces, no quote characters, and no `search_path` fallback. A missing schema is a run error. |
| P19 | One mapping file is one database URL, one schema, and one relation: one tenant. The kit does not take a tenant list or a second database in the same run. Another tenant is another workflow and another secret set. This is not a hosted multi-tenant service. |
| P20 | The seats column is required in the mapping and in the result. SQL `NULL` is reported as null. The number `0` stays `0`. A result row that omits the column is a run error. |
| P21 | Only a YAML null disables a rail. An empty string is a config error, not "disabled" and not a column name. |
| P22 | A run with zero enabled rails is a run error. `allClear` is false. |
| P23 | Logs and Slack must not contain restricted keys, organization tokens, database URLs, or webhook URLs. Rotation steps live in the support checklist. They are not a detect case. |
| P24 | Alert text and CLI text name the disagreement and the ids. They do not say to set `is_pro`, change seats, cancel, charge, or refund the end customer. They do not include an `UPDATE`, a suggested query, "should have access", or "should lose access". A hint that is not executed is still a fix instruction. A daily "all clear" Slack message is not added to make a quiet channel feel safe. |
| P25 | Two non-finding buckets. **Ambiguous** increments `unclassifiedUsers`, produces no case finding, and forces `allClear` false: `past_due`, `paused`, `unpaid`, any status string not in P26, a missing status, a webhook event name used as a status (`subscription.revoked` is an event, not a status), non-boolean `is_pro`, a customer id with no subscription after a complete read, and a Stripe `active` subscription whose refund state is anything but "no refund." **Deliberate skip** increments `deliberateSkipUsers`, produces no case finding, and does not by itself force `allClear` false: `trialing`, `incomplete`, and `incomplete_expired`. Slack still gets one ambiguous-count line when that count is above zero, with no per-user dump and no access instruction. Deliberate skips are not listed per user. |
| P26 | Status map, restated so P12 is not applied beside it. Do not guess from a similar word. `cancel_at_period_end` on Stripe and Polar does not change the bucket while status is `active`. Polar sources, read 2026-09-26: [subscription status enum](https://polar.sh/docs/api-reference/subscriptions/list), [subscription behavior](https://polar.sh/docs/features/subscriptions/introduction), [refunds](https://polar.sh/docs/features/refunds). Stripe flag: [subscription object](https://docs.stripe.com/api/subscriptions/object). **Paid:** status `active`, and for Stripe only, no refund on that subscription. **Canceled or refunded:** status `canceled` only. **Deliberate skip:** `trialing`, `incomplete`, `incomplete_expired`. **Ambiguous:** every other status, including `past_due`, `paused`, and `unpaid`. Polar order status (`paid`, `refunded`, `partially_refunded`, and the rest of the order enum) is not a subscription status. Polar's refund doc says refunding an order tied to a subscription returns the money and does not end the subscription. The kit does not read Polar order or refund objects to classify access. A Polar refund is not case 2. Stripe no longer uses "the latest paid charge." Any refund, partial or full, on an `active` subscription makes that subscription ambiguous. If the implementation cannot tell whether a refund exists, the subscription is ambiguous, not paid. |
| P27 | A provider read is complete or it is a run error. HTTP errors, auth errors, and truncated pagination fail the rail. Ids missing from a partial page are not "no subscription" and are not canceled. Per-customer absence counts only after a complete list. |
| P28 | Roll up one rail for one user after a complete read. If any subscription is paid, the rail is paid. Otherwise if any subscription is ambiguous, or the customer id is set and there are zero subscriptions, the rail is ambiguous. Otherwise if the rail has both a deliberate skip and a canceled subscription, the rail is ambiguous. Otherwise if every subscription is a deliberate skip, the rail is a deliberate skip. Otherwise if every subscription is canceled, the rail is canceled. A null customer-id cell means the rail does not apply. A user with no applicable rail is skipped and is not a finding. Case 1 does not require a deliberate-skip rail to be paid or canceled: a paid rail still produces `paid_locked_out` when `is_pro` is false and no applicable rail is ambiguous. Case 2 requires every applicable rail to be canceled. A deliberate skip blocks case 2. One paid rail and one canceled rail is case 1 only when `is_pro` is false. There is still no primary rail. P15's "every rail first" test is not applied. |
| P29 | Price id, product id, and quantity do not change the bucket. Any `active` subscription counts as paid, including an add-on. A price allow-list is plan-drift scope and is out. Quantity `0` on an `active` subscription is still paid. This is a known limit for the 4th DR, not a third finding. |
| P30 | `allClear` is true only on a live, implemented run that fully read every enabled rail and the product relation, with zero findings, zero errors, and `unclassifiedUsers` of 0. `deliberateSkipUsers` may be above zero. An empty relation that was read successfully can be `allClear`, and that still does not prove the view is the right population. Live exit codes: `0` only when `allClear` is true; `2` when the run finished and `allClear` is false because of findings or ambiguous users; `1` on a run error. Dry-run exits `0`, sets `allClear` false, and says it is not an all-clear. The scaffold's `--live` exit `2` remains the not-implemented refusal. A green dry-run is not an entitlement pass. The live job does not post a daily all-clear Slack message. |

### How the two rails combine

Under P28:

- **Paid and locked out.** At least one applicable rail is `paid`, no applicable rail is ambiguous, and `is_pro` is `false`. A deliberate-skip rail does not block this. One finding per paid rail.
- **Still entitled after cancel.** Every applicable rail is `canceled`, and `is_pro` is `true`. One finding per applicable rail. A trial or `incomplete` rail blocks case 2.
- **Mixed paid and canceled.** `is_pro` true: no case 2. `is_pro` false: case 1 on the paid rail only.
- **Any applicable rail ambiguous.** No case finding. Count the user in `unclassifiedUsers` (P25). Do not invent a primary rail.
- **Deliberate skip only.** No case finding. Count `deliberateSkipUsers`. This does not, by itself, force `allClear` false (P30).
- **Disabled rail.** The mapping column is null. Ignored for every row.
- **Null customer id on an enabled rail.** That rail does not apply to that row. A comp with `is_pro` true and null billing ids is skipped, not case 2.

Staff comps and "we know this row is wrong" are not an ignore list. An ignore list, including a 30-day snooze, stays refused. See buyer needs.

## Mapping file

One YAML file. The committed sample is [../mapping.example.yaml](../mapping.example.yaml). Operators copy it to `mapping.yaml`, which is gitignored.

The file names the Postgres schema and relation, and the columns that hold the product user id, `is_pro`, seats, and each rail's customer and subscription ids. It does not contain customer id values. Explicit pair lists (hand-maintained id joins) stay parked. A second mapping mechanism doubles the ways a row can be mis-joined.

## Cron, GitHub Action, Slack

The shape of a run, once the detector exists:

1. Load the mapping file. Reject unknown `entitlement.field` values. The active rules accept `is_pro` only. Reject a missing schema, an empty-string rail, and zero enabled rails (P18, P21, P22).
2. Read enabled rails with restricted credentials. Do not log the credentials (P23).
3. `SELECT` the mapped columns from `"schema"."relation"`.
4. Apply the active rules. Superseded ids are historical.
5. Post to Slack for findings, a non-zero ambiguous count, or a run error (P6, P24, P25, P30). Do not post a daily all-clear.
6. Exit with the P30 codes. Exit non-zero whenever `allClear` is false. A non-zero exit fails the GitHub Actions check. That red check is the cron-failure signal. The kit does not add a second pager.

Until that exists, [../.github/workflows/compare.yml](../.github/workflows/compare.yml) checks out the repo and runs `npm run compare -- --dry-run`. Dispatch with `dry_run` set false fails the job before the CLI. The workflow does not declare provider, database, or Slack secrets. Its green check is not an entitlement pass.

When a later implement PR turns live mode on, the daily cron is the live path. `workflow_dispatch` stays dry-run unless the operator sets an explicit live input. Dry-run does not read providers, does not query the database, and does not post to Slack.

Cadence is daily. Hourly monitoring is a different product.

## Price

$49–99 per month, self-serve, one organization, when the zip and checksum exist. Global English buyers. No sales call.

Soft-WTP is a hard out: public "what would you pay" tests, fake-door checkout, pay-what-you-want, and cold invoices. The exact number inside the band, and the refund window, are founder (via CoS) decisions. They are not a survey, and they are not a LaunchGate substitute. Design reviews do not wait on them. The kit does not recommend refunding an end customer (P24).

## Kill criteria

Stop the product, or refuse the request, when any of these is true:

1. The 4th DR shows one of the two cases cannot be decided without a write, a fuzzy match, or a guessed schema. Drop the case in that review. Do not widen the product to save it. DR#2 and DR#3 did not drop a case.
2. The buyer being served wants a qualification call, an executive PDF, or pricing aimed at large subscription counts. That is a different business. Decline.
3. The implementation cannot keep the smoke test's ban on charge, write, and fix exports.
4. Most support demand is "change my webhook" or "fix this row." The kit does not do that work. If that is the demand, the product is the wrong shape.
5. A named entitlement reconciler (DriftExact, ProdVerdict, Venwai, or EntitleGuard) ships a maintained Polar read against a product database, at a self-serve price near this band, before SeatTruth has an operator. Reconsider. Do not answer by adding audit features or auto-fix. RevReclaim already names Polar for billing-leak scans and markets auto-fix. That product does not close this gap.
6. LaunchGate does not approve the 4th DR or the 4th CR. Separately, the founder (via CoS) refuses a reserved decision: price, refund window, Polar listing go-live, Soft-WTP, spending money, or scope that becomes Chargebee, Autumn, or auto-fix.

## Differentiation

Public skim **2026-09-26**. Sources, prices, and unknowns: [COMPETITIVE_SKIM.md](COMPETITIVE_SKIM.md). DR#2 and DR#3 did not re-price those pages and did not add metrics. The Polar entitlement gap stands as published there. Polar's refund doc was read for P26. That is Polar's own API behavior, not a competitor closing the gap.

The **Polar ↔ product-database entitlement reconciler** gap is open among the named peers:

- **DriftExact, Venwai, and EntitleGuard** are Stripe-only on the pages reviewed.
- **ProdVerdict** is Stripe and Paddle. The public README does not mention Polar.
- **RevReclaim** does name Polar. It is a different product: billing-leak hygiene, and paid plans market auto-fix.

**SeatTruth's public wedge** is **$49–99/mo**, **Stripe and Polar**, read-only, **no auto-fix**.

Closest shapes, from those same pages:

- **DriftExact** is the closest mid-market peer. Read-only, no auto-fix, published **£399–£1,500+/mo**, best-fit copy around **500+** active Stripe subscriptions. Qualification-gated. That buyer is kill criterion 2.
- **ProdVerdict** is the closest indie peer. Access contract, GitHub Actions, Slack, no write-back described. Pro Cloud is about **$39/project/mo** in the changelog. prodverdict.com returned **503** (deployment paused) during the skim, so that price was not re-checked on a live pricing page.

Venwai ($29/mo after beta, up to 500 subscriptions) and EntitleGuard (monitoring beta $79/mo) sit in the same indie price neighborhood. Neither shows Polar.

This is a gap in published materials. It is not a claim about roadmaps, revenue, customer counts, or accuracy. Polar having a subscription status enum is not a competitor shipping this reconcile.

## Out

Hard outs for the life of this positioning:

- Charges, refunds, Checkout, customer portal, invoices created by the kit.
- Writes to Stripe, Polar, or the product database.
- Auto-fix, suggested SQL, and "set `is_pro`" copy (P24).
- Soft-WTP and cold invoices.
- Plan-name drift, duplicate-customer findings as a product feature, orphan customers, seat-count inequality.
- Treating `past_due`, trials, `unpaid`, disputes, refunds, or `cancel_at_period_end` as case 1 or case 2. Trials are a deliberate skip. The others stay ambiguous (P26).
- Paddle, Chargebee, Autumn, or any processor besides Stripe and Polar. Adding one is a founder (via CoS) scope change, and DR#2's answer is no.
- A webhook receiver, or intercepting the buyer's webhooks.
- Hosting buyer customer rows on yellowgram infrastructure.
- Enterprise audit PDFs, qualification calls, SOC-report packaging.
- A Stripe mirror or warehouse.
- An LLM in the compare path. Fuzzy matching. Schema guessing.
- Email, name, or card data in Slack.
- A public Polar listing, a Checkout URL, or a zip, until `POLAR_DELIVERABLES` is real.
- Exception lists, snooze, and "ack this user" state.
- Support in languages other than English.
- Reading GitHub Issues on a private buyer repo as the support channel.

## Later

Parked. Not promised. The 4th DR packet does not move these into scope. A later implement PR must not slip them in either. Chargebee, Autumn, or auto-fix is not one of those ordinary edits.

- Seat quantity inequality as its own finding.
- A CSV of findings for the operator's own finance notes.
- A second database engine.
- An explicit id-pair list when the ids are not columns on the user relation.
- More than one product relation.
- A cited Polar refund-object map, if a later review can point at the field. DR#2 refused to invent it. DR#3 still refuses: the cited refund doc says a refund does not end the subscription, and P26 does not read order objects.

Deduped or snoozed alerts are not parked. They are refused. A repeated finding stays visible.

## Accepted limits for the 4th DR

These stay in the design on purpose. They are not silent.

- Any `active` subscription counts as paid. Price, product, and quantity are not filters (P29).
- `trialing`, `incomplete`, and `incomplete_expired` do not block `allClear` (P25, P30). `past_due`, `paused`, and `unpaid` do.
- There is no primary rail (P28). P15 is superseded.
- A Polar refund does not classify the subscription. Status `canceled` does (P26).
- The zip, its SHA-256, and `POLAR_DELIVERABLES` are absent. The listing stays dark.
- The exact price and the refund window are unset. Those are founder (via CoS) decisions and do not block the 4th DR.

## 4th DR packet

The ask, the limits, and the kill-criteria reading are in [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md). This section does not add a rule.

DR#3 left the two cases decidable without a write, a fuzzy match, or a new processor. The limits above are what LaunchGate accepts or rejects. This file does not count as approval. An implement PR waits for LaunchGate APPROVE on the 4th DR.

## Scaffold behavior (current)

`compareReadOnly` returns `implemented: false`, `allClear: false`, `unclassifiedUsers: 0`, `deliberateSkipUsers: 0`, and the error `detector_not_implemented`. Provider, database, and Slack functions throw `NotImplementedError` and do not open the network. `runCli(["--live"])` returns 2. The smoke test locks the export surface. `MappingDocument` requires `schema`. None of that is a live compare.

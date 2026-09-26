# MVP scope

**DR#1 seed.** This file is the first design pass, written with the scaffold. It is not DR#2 and it is not DR#3. Those are later pull requests. See [STATUS.md](STATUS.md).

## Next steps

1. **DR#2** — a separate design PR. Not this one.
2. **DR#3** — a separate design PR after DR#2. Not this one.
3. **Founder halt.** Stop until there is an explicit go-ahead to implement.
4. **Implement PR.** Detector code. Not started.
5. **CR×3** before that implement PR merges.

Do not treat the rules below as a finished design, and do not implement them from this PR.

SeatTruth compares Stripe and Polar, read-only, with one product database. The product fields in view are `is_pro` and seats. The kit is restricted keys, one mapping file, a GitHub Action on a cron, and a Slack alert.

## In

- Two detect cases, defined below, and nothing else presented as a finding.
- Stripe, via a restricted key (`rk_`), read permissions only.
- Polar, via one Organization Access Token, read scopes only. Token overview: https://polar.sh/docs/integrate/oat. Scope names are confirmed in the Polar token UI at implementation time. This doc does not invent scope strings. Third-party write-ups mention read scopes for customers, subscriptions, and orders; treat those names as unverified until the token screen shows them.
- One mapping file. Shape: [../mapping.example.yaml](../mapping.example.yaml).
- One Postgres relation (table or view) and one `SELECT` of the mapped columns.
- A database role that can read that relation and cannot write.
- GitHub Actions: daily cron (`0 6 * * *`) plus `workflow_dispatch`. The workflow in this repo dry-runs and has no live secrets.
- Slack incoming webhook on the operator's channel when a real run has a finding or cannot complete a classification.
- English docs and English alerts.
- Self-serve price band **$49–99 per month** once a versioned zip exists. The number inside the band is chosen at the founder halt. There is no checkout in this repo.

## Detect cases

A **finding** is one of these. Both are operator review items. Neither is an instruction.

1. **`paid_locked_out`.** An enabled rail classifies the customer as paid, and the product `is_pro` value is boolean `false`.
2. **`canceled_still_entitled`.** Every enabled rail classifies the customer as canceled or fully refunded, and the product `is_pro` value is boolean `true`.

`seats` is copied onto the alert so a human can see the quantity the product stored. A difference between provider quantity and `seats` is not a third finding.

### Provisional rules

These are DR#1 decisions. DR#2, then DR#3, each in its own PR, may supersede a rule. This PR does not apply those revisions. A superseded rule stays in the text, marked superseded, with the new rule id beside it. Code does not get to widen these rules quietly, and code does not land in this PR.

| Id | Rule |
| --- | --- |
| P1 | The entitlement bit is `is_pro`. Boolean `true` means entitled. Boolean `false` means locked out. `NULL` is unclassified. `seats` is payload, including when it is `NULL` or `0`. |
| P2 | Each provider subscription maps to `paid`, `canceled_or_refunded`, or `unclassified`. Stripe statuses that count as **paid**: `active`, and only when that subscription is not fully refunded. Stripe statuses that count as **canceled_or_refunded**: `canceled`, and a full refund of the latest paid charge on that subscription. Stripe statuses that stay **unclassified**: `trialing`, `past_due`, `incomplete`, `incomplete_expired`, `paused`, `unpaid`, and any status not in this sentence. Polar status strings are copied from Polar's API schema at implementation time into the same three buckets. A Polar string with no written mapping is unclassified. |
| P3 | A refund counts as `canceled_or_refunded` only when it is a full refund of the latest paid charge (Stripe) or the equivalent latest paid order (Polar, confirmed against their API at implementation time). A partial refund is unclassified. |
| P4 | A case finding is emitted only when every **enabled** rail has a classification of `paid` or `canceled_or_refunded`. If any enabled rail is unclassified, or a read fails, there is no case finding for that user. The run records an error. `allClear` stays false. |
| P5 | The same provider customer id on two product users is a run error (ambiguous map). It is not a finding type and it is not silently picked. |
| P6 | Slack text may include the case id, product user id, provider name, provider customer id, subscription id, `is_pro`, and `seats`. It includes no email, no customer name, and no card data. |
| P7 | A rail is enabled when the mapping sets its `customer_id` column and the matching restricted credential is present. A mapped rail with a missing credential is a run error. A rail with `customer_id: null` is disabled and is not read. |
| P8 | The product read is one `SELECT` of the mapped columns. Relation and column names must match `^[A-Za-z_][A-Za-z0-9_]*$`. The mapping file contains no SQL text. |
| P9 | `allClear` may be true only on a live run that read every enabled rail and the product relation, with zero findings and zero errors. Dry-run, stub, and failed runs set `allClear` false. Empty findings alone are not a clean bill. |
| P10 | Alert text and CLI text name the disagreement. They do not tell the operator to set `is_pro`, change seats, cancel, refund, or charge. |

### How the two rails combine

Under P4 and P7:

- **Paid and locked out.** At least one enabled rail is `paid`, every enabled rail is classified, and `is_pro` is `false`. One finding per enabled rail that is `paid`, so both customer ids show up when both rails were paid.
- **Still entitled after cancel.** Every enabled rail is `canceled_or_refunded`, and `is_pro` is `true`. One finding per enabled rail.
- **Mixed.** One rail `paid` and another `canceled_or_refunded`, with `is_pro` true: no case-2 finding, because a rail is still paid. With `is_pro` false: case 1 on the paid rail only.
- **Disabled rail.** Ignored. A Polar-only product leaves Stripe's `customer_id` null, and the reverse.

Staff comps and "we know this row is wrong" are not an ignore list in v1. An ignore list becomes a second entitlement store. See buyer needs.

## Mapping file

One YAML file. The committed sample is [../mapping.example.yaml](../mapping.example.yaml). Operators copy it to `mapping.yaml`, which is gitignored.

The file names the Postgres relation and the columns that hold the product user id, `is_pro`, seats, and each rail's customer and subscription ids. It does not contain customer id values. Explicit pair lists (hand-maintained id joins) are later, because a second mapping mechanism doubles the ways a row can be mis-joined.

## Cron, GitHub Action, Slack

The shape of a run, once the detector exists:

1. Load the mapping file. Reject unknown `entitlement.field` values. v1 accepts `is_pro` only.
2. Read enabled rails with restricted credentials.
3. `SELECT` the mapped columns.
4. Apply P1–P5.
5. Post to Slack if there is a finding or a run error (P6, P9, P10).
6. Exit non-zero when `allClear` is false.

Until that exists, [../.github/workflows/compare.yml](../.github/workflows/compare.yml) checks out the repo and runs `npm run compare -- --dry-run`. Dispatch with `dry_run` set false fails the job before the CLI. The workflow does not declare provider, database, or Slack secrets.

Cadence is daily. Hourly monitoring is a different product.

## Price

$49–99 per month, self-serve, one organization, when the zip and checksum exist. Global English buyers. No sales call.

Soft-WTP is a hard out: public "what would you pay" tests, fake-door checkout, pay-what-you-want, and cold invoices. Choosing the number inside the band is a founder decision with the cost of support in view, done at the halt, not a survey.

## Kill criteria

Stop the product, or refuse the request, when any of these is true:

1. DR#2 or DR#3 shows one of the two cases cannot be decided without a write, a fuzzy match, or a guessed schema. Drop the case in that later PR. Do not widen the product to save it.
2. The buyer being served wants a qualification call, an executive PDF, or pricing aimed at large subscription counts. That is a different business. Decline.
3. The implementation cannot keep the smoke test's ban on charge, write, and fix exports.
4. Most support demand is "change my webhook" or "fix this row." The kit does not do that work. If that is the demand, the product is the wrong shape.
5. DriftExact or ProdVerdict ships a maintained Polar read path at a similar self-serve price before SeatTruth has an operator. Reconsider. Do not answer by adding audit features.
6. The founder halt says stop.

## Differentiation

DriftExact's public pages describe Stripe-only, qualification-gated monitoring at a much higher monthly price, and they do not mention Polar. ProdVerdict's public README describes Stripe and Paddle, a scheduled access check, and a low cloud price, and it does not mention Polar. SeatTruth's wedge is a Polar rail next to Stripe, two detect cases, no fix advice, and an indie self-serve price, shipped before those public materials show Polar.

That is a gap in what they have published. It is not a claim about their roadmap, their revenue, or their accuracy. Sources and unknowns: [COMPETITIVE_SKIM.md](COMPETITIVE_SKIM.md).

## Out

Hard outs for v1 and for the life of this positioning:

- Charges, refunds, Checkout, customer portal, invoices created by the kit.
- Writes to Stripe, Polar, or the product database.
- Auto-fix and "set `is_pro`" copy.
- Soft-WTP and cold invoices.
- Plan-name drift, duplicate-customer findings as a product feature, orphan customers, seat-count inequality.
- Adjudicating `past_due`, trials, disputes, and partial refunds as case 1 or case 2. They stay unclassified (P2, P3).
- Paddle or any processor besides Stripe and Polar.
- A webhook receiver, or intercepting the buyer's webhooks.
- Hosting buyer customer rows on yellowgram infrastructure.
- Enterprise audit PDFs, qualification calls, SOC-report packaging.
- A Stripe mirror or warehouse.
- An LLM in the compare path. Fuzzy matching. Schema guessing.
- Email, name, or card data in Slack.
- A public Polar listing, a Checkout URL, or a zip, until `POLAR_DELIVERABLES` is real.
- Exception lists and "ack this user" state.
- Support in languages other than English.

## Later

Parked. Not promised. A later item moves into scope only by an edit in the DR#2 PR or the DR#3 PR, not by slipping it into this seed.

- Seat quantity inequality as its own finding.
- Deduped alerts that do not become an entitlement store.
- A CSV of findings for the operator's own finance notes.
- A second database engine.
- An explicit id-pair list when the ids are not columns on the user relation.
- More than one product relation.

## Scaffold behavior (current)

`compareReadOnly` returns `implemented: false`, `allClear: false`, and the error `detector_not_implemented`. Provider, database, and Slack functions throw `NotImplementedError` and do not open the network. `runCli(["--live"])` returns 2. The smoke test locks the export surface.

# Minimum support checklist

What "supported" means for SeatTruth once an operator has the kit. The founder should be able to stay out of the room. Items marked done are true of this scaffold. Items left open wait for the detector, the zip, or the design iterations.

HookSteel (`yellowgram/hooksteel`) is the doc pattern this list follows: happy path, safe defaults, docs that replace the founder, CI, a versioned zip, a support and money boundary, and ops. That repo was not readable when this file was written (GitHub 404). The sections below are SeatTruth's, for a read-only drift detector. No HookSteel billing code is included.

Process: three adversarial design iterations, founder halt, implement, then three code reviews. The iteration log is at the bottom. It is empty of deltas on purpose.

## 1. Happy path

The path an operator can finish from the docs, when the detector exists. Today, only the dry-run prefix works.

- [x] Docs say the detector is not implemented and a dry-run is not an all-clear.
- [x] `npm test` passes on the stub without keys.
- [x] `npm run compare -- --dry-run` exits 0 and prints that this is not an all-clear.
- [x] `npm run compare -- --live` exits 2 and does not call Stripe, Polar, Slack, or Postgres.
- [ ] Operator copies `.env.example` to `.env` and `mapping.example.yaml` to `mapping.yaml`.
- [ ] Operator creates a Stripe restricted key (read only) and a Polar Organization Access Token (read scopes only), or disables a rail with `customer_id: null`.
- [ ] Operator creates a Postgres role with `SELECT` on the mapped relation only.
- [ ] Operator stores the four secrets and the mapping path in GitHub Actions.
- [ ] A manual dispatch runs a live compare and posts to Slack only for a finding or a failed classification.
- [ ] The daily cron repeats that run. Exit code is non-zero when `allClear` is false.

## 2. Safe defaults

- [x] CLI defaults to dry-run. Live mode is opt-in and, until implementation, refused.
- [x] The compare workflow does not reference live secrets.
- [x] Dispatch with dry-run turned off fails the job.
- [x] Stub reads throw `NotImplementedError` instead of returning an empty "all clear."
- [x] A Stripe secret key (`sk_`) is refused.
- [x] `.env.example` and `mapping.example.yaml` contain placeholders, not live ids.
- [x] `mapping.yaml` and `.env` are gitignored.
- [ ] Missing credential on an enabled rail is a run error (rule P7). Specified, not implemented.
- [ ] Unknown provider statuses stay unclassified (rule P2). Specified, not implemented.
- [ ] `NULL` `is_pro` is unclassified, not a guessed boolean (rule P1).
- [ ] Slack omits email, name, and card data (rule P6).
- [ ] No ignore list ships with the kit.

## 3. Docs that replace the founder

An operator should not need a call to learn the boundary.

- [x] [../README.md](../README.md) states what the product is, the price band, the hard outs, and the contact.
- [x] [../BUYER_START_HERE.md](../BUYER_START_HERE.md) is the front door.
- [x] [MVP_SCOPE.md](MVP_SCOPE.md) is the rule list, including provisional rules P1–P10.
- [x] [COMPETITIVE_SKIM.md](COMPETITIVE_SKIM.md) records public claims and leaves unknowns unmarked as facts.
- [x] [../.env.example](../.env.example) names each secret and the read-only constraint.
- [x] [../mapping.example.yaml](../mapping.example.yaml) is the whole mapping surface.
- [x] [../LICENSE](../LICENSE) states single-org use, no competing-kit resale, and no warranty of entitlement correctness.
- [ ] A short "first live run" note, written when the detector exists, showing one redacted finding and one failed-read alert. Not before, so the repo does not show fake customers.

## 4. CI

- [x] [../.github/workflows/ci.yml](../.github/workflows/ci.yml) runs `npm test` on push and pull request.
- [x] The smoke test imports the stubs and fails if an export name looks like a charge, write, or fix API.
- [x] The smoke test fails if dry-run sets `allClear`, if live Slack copy is invented, or if README drops the hard outs.
- [ ] After implementation, tests cover P1–P10 with fixtures. Fixtures are invented rows in the test file, not live customers.
- [ ] CI still has no Stripe, Polar, database, or Slack secrets. Live reads stay in the operator's scheduled workflow.

## 5. Versioned zip

Distribution matches the private-kit pattern: this private GitHub repo now, a zip later.

- [x] `package.json` is `private` and version `0.0.0`.
- [ ] A zip of a tagged source tree is built only after the founder halt and a real detector.
- [ ] SHA-256 of that zip is recorded.
- [ ] `POLAR_DELIVERABLES` lists the zip name, the SHA-256, and the tag. The file does not exist yet.
- [ ] Polar listing stays dark until those three are real. No Checkout URL in the repo, the README, or the CLI help.

## 6. Support and money boundary

- [x] Contact is hello@yellowgram.dev. Prefer https://www.yellowgram.dev.
- [x] Support language is English.
- [x] The license refuses a warranty that comparisons are correct.
- [ ] Email support, when a kit has been sold, covers: how to run the documented path, how to read a finding, and defects where the kit breaks its own rules.
- [ ] Email support does not cover: changing the operator's webhook, editing `is_pro`, interpreting a partial refund, writing a custom SQL join, or joining the operator's Slack.
- [ ] The only invoice yellowgram sends is for SeatTruth itself, to an organization that bought it. No cold invoices. No invoices for the operator's end customers.
- [ ] The kit never creates a charge, a refund, or a Checkout session.
- [ ] Price, when a listing exists, is a published number in the $49–99 band. No pay-what-you-want. No "reply with what you'd pay."

## 7. Ops for Slack and cron

- [x] Cron is documented as `0 6 * * *` (06:00 UTC daily).
- [x] Manual dispatch exists for a dry-run.
- [x] Workflow permissions are `contents: read`.
- [ ] The operator owns the Slack app and the webhook. yellowgram is not in that workspace.
- [ ] A finding alert and a run-error alert are different first lines, so a channel can be skimmed. Copy is written at implementation under P6 and P10, then reviewed.
- [ ] Key rotation is the operator's job: replace the GitHub secret, expire the old Polar token in the Polar UI, roll the Stripe restricted key in the Stripe dashboard.
- [ ] A missed cron (Actions outage) is visible because the operator notices the channel went quiet. The kit does not promise a second pager.

## 8. Adversarial iteration log

Three passes, in order. Each pass is one expert trying to break the provisional rules. A **delta** is a rule that changed because the attack held. "None yet" means the pass has not been run. Do not backfill a delta to look finished.

When a delta happens: leave the old rule text in [MVP_SCOPE.md](MVP_SCOPE.md), mark it superseded, add the new rule id, and write one paragraph here. Do not delete the attack.

### Expert A — billing-state adversary

**Status:** not started.

**Charter:** Break the status table. The interesting lie is a customer who is "kind of paid" or "kind of canceled" being forced into case 1 or case 2.

**Seed attacks:**

- Stripe `past_due` with `is_pro` true. P2 says unclassified, so no case 2. Is silence the failure mode the operator actually fears?
- Stripe `active` plus a partial refund. P3 says unclassified. Case 1 also stays silent if classification is incomplete (P4). Confirm that is the intended fail-closed behavior, and that it does not get "fixed" by treating partial as full.
- Stripe `trialing` with `is_pro` false. Must not become `paid_locked_out`.
- Polar statuses that do not match Stripe's enum. Any status missing from the written Polar map must stay unclassified. The attack is an implementer guessing `active` means paid because the word looks right.
- A dispute that is not a refund. P2 does not mention disputes. They should fall through to unclassified. If Polar models disputes as a refund object, Expert A has to say which, from the API schema, not from memory.
- "Latest paid charge" (P3) is the easy phrase to implement wrong when an annual invoice and a one-off invoice both exist.

**Delta:** none yet.

### Expert B — mapping and dual-rail adversary

**Status:** not started. Runs after Expert A's delta is recorded.

**Charter:** Break the join. The interesting lie is two truths about the same person, or a mapping file that becomes SQL.

**Seed attacks:**

- Enabled Stripe rail is `canceled_or_refunded`, enabled Polar rail is `paid`, `is_pro` is true. P4's mix rule says this is not case 2. Attack the product story: the operator may have meant "Polar is the billing system of record" and Stripe is a stale id. Is `customer_id: null` the only way to say that, and is that documented where they will see it?
- The same Stripe customer id on two product users (P5) must error the run, not emit two findings and not pick the first row.
- `is_pro` true and `seats` 0. P1 says seats are payload. Attack whether operators will read the alert as "SeatTruth approved this" because it did not flag the zero.
- A mapping `relation` of `users; drop table users` or a column named with a quote. P8's identifier grammar has to reject it before a query is built. The attack is a future loader that string-concatenates the YAML into SQL.
- A read-only URL that points at a superuser. The tool cannot fully police the role. The attack is a doc that implies the kit enforces read-only when only the operator's role does. The checklist has to keep saying that out loud.
- Both rails disabled. That run should error, not report all-clear.

**Delta:** none yet.

### Expert C — liability and go-to-market adversary

**Status:** not started. Runs after Expert B's delta is recorded.

**Charter:** Break the boundary that keeps this out of auto-fix, Soft-WTP, and enterprise-audit work. The interesting lie is a helpful sentence.

**Seed attacks:**

- Slack copy that says the customer "should have access" is already a fix instruction. P10 has to survive contact with a friendly writer.
- An "acknowledge this user for 30 days" feature. It is the ignore list banned in the scope. The attack will come dressed as noise reduction.
- A Polar product page, a buy button, or a price in the README that looks like Checkout, created before `POLAR_DELIVERABLES` exists.
- Moving the price to match DriftExact, or adding an executive PDF, because a single prospect asked. Kill criterion 2.
- A support reply that includes an `UPDATE` for `is_pro`. That reply is the product failing, even if the code is clean.
- Cold email that attaches an invoice. Soft-WTP rule.
- The dry-run workflow going green on `main` and someone treating the badge as "entitlements checked."

**Delta:** none yet.

## Done means

The checklist is not done. The scaffold portion is done when `npm test` passes, the workflow stays dry-run, and the docs still match the boxes above. The product portion stays unchecked until the halt, the implementation, and the three code reviews.

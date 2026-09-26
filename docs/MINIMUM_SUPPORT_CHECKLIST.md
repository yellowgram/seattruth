# Minimum support checklist (v1)

**DR#1.** This is a solid first checklist, not a final v3. DR#2 and DR#3 are separate design PRs, and each one may revise this file. Those revisions are not in this PR. Do not read the checked boxes as a sign-off from later reviews.

What "supported" means for SeatTruth once an operator has the kit. The founder should be able to stay out of the room for the path below. Items marked done are true of this scaffold. Items left open wait for later design PRs, the implement PR, or the zip.

HookSteel (`yellowgram/hooksteel`) is the doc pattern this list follows: happy path, safe defaults, docs that replace the founder, CI, a versioned zip, a support and money boundary, and ops. That repo was not readable when this file was written (GitHub 404). The sections below are SeatTruth's, for a read-only drift detector. No HookSteel billing code is included.

Next steps, each its own PR: DR#2, then DR#3, then a founder halt, then an implement PR, then CR×3 before that implement PR merges. See [STATUS.md](STATUS.md).

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

## 8. Later revisions of this checklist

DR#2 and DR#3 have not been run. This section does not record their findings. Running those reviews inside DR#1 would collapse them into one pass.

When DR#2 opens, it gets its own PR and may edit this checklist. DR#3 does the same after DR#2, in another PR. Until those PRs exist, v1 above is the support promise of the seed. It is not a v3 final.

## Done means

The DR#1 scaffold portion is done when `npm test` passes, the workflow stays dry-run, and the docs still match the boxes above. The product boxes stay open. They are not closed by this PR, and they are not closed by claiming DR#2, DR#3, or CR×3 happened here.

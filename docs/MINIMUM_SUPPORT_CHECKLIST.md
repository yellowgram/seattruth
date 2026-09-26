# Minimum support checklist (v3)

**Checklist v3, unchanged.** DR#1 shipped v1. DR#2 shipped v2. DR#3 shipped this v3 text. The v1→v2 log is section 8. The v2→v3 log is section 9. The 4th DR does not publish a v4. The LaunchGate packet is [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md).

**Absent, and this pull request does not add them:** a versioned zip, its SHA-256, and `POLAR_DELIVERABLES`. Do not treat a missing file as "coming in this PR." The Polar listing stays dark until those three are real. Listing go-live is a founder (via CoS) decision after that, and it is not requested here.

LaunchGate has not approved the 4th DR. Section 10 is the input list. The ask itself is [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md). See [STATUS.md](STATUS.md).

What "supported" means for SeatTruth once an operator has the kit. The founder should be able to stay out of the room for the path below. Items marked done are true of this scaffold. Items left open wait for the implement PR, or for the zip.

HookSteel (`yellowgram/hooksteel`) is the doc pattern this list follows: happy path, safe defaults, docs that replace the founder, CI, a versioned zip, a support and money boundary, and ops. That repo was not readable when the scaffold was written (GitHub 404). The sections below are SeatTruth's, for a read-only drift detector. No HookSteel billing code is included.

Cadence: DR#1 is pull request #1. DR#2 is pull request #2. DR#3 is pull request #3, which shipped this v3 text. This branch is the 4th DR. LaunchGate APPROVE is still required before any implement PR, then CR×3, then a 4th code review with LaunchGate APPROVE before squash-merge. Ordinary design and code gates do not wait on the founder.

## 1. Happy path

The path an operator can finish from the docs, when the detector exists. Today, only the dry-run prefix works.

- [x] Docs say the detector is not implemented and a dry-run is not an all-clear.
- [x] `npm test` passes on the stub without keys.
- [x] `npm run compare -- --dry-run` exits 0 and prints that this is not an all-clear.
- [x] `npm run compare -- --live` exits 2 and does not call Stripe, Polar, Slack, or Postgres.
- [ ] Operator copies `.env.example` to `.env` and `mapping.example.yaml` to `mapping.yaml`.
- [ ] Operator creates a Stripe restricted key (read only) and a Polar Organization Access Token (read scopes only), or disables a rail with `customer_id: null`.
- [ ] Operator creates a Postgres role with `SELECT` on the mapped relation only.
- [ ] Operator stores the four secrets and the mapping path in GitHub Actions. The Slack webhook is one of those secrets. It is not written into the workflow file.
- [ ] A manual live dispatch posts to Slack only for a finding, a non-zero ambiguous count, or a failed classification. It does not post a daily all-clear (P24, P30).
- [ ] The daily cron repeats that live run. Exit code is non-zero when `allClear` is false. That red Actions check is the failure signal (P30).

## 2. Safe defaults

- [x] CLI defaults to dry-run. Live mode is opt-in and, until implementation, refused.
- [x] The compare workflow does not reference live secrets.
- [x] Dispatch with dry-run turned off fails the job.
- [x] Stub reads throw `NotImplementedError` instead of returning an empty "all clear."
- [x] A Stripe secret key (`sk_`) is refused.
- [x] `.env.example` and `mapping.example.yaml` contain placeholders, not live ids.
- [x] `mapping.yaml` and `.env` are gitignored.
- [ ] Missing credential on an enabled rail is a run error (rule P7). Specified, not implemented.
- [ ] Status buckets follow P26. `past_due`, `paused`, and `unpaid` stay ambiguous. `trialing`, `incomplete`, and `incomplete_expired` are a deliberate skip (P25). Specified, not implemented.
- [ ] `NULL` `is_pro` is ambiguous, not a guessed boolean (rule P11, P25).
- [ ] Slack omits email, name, and card data (rule P6).
- [ ] A truncated provider page is a run error, not "no subscription" (P27).
- [ ] No ignore list ships with the kit.

## 3. Docs that replace the founder

An operator should not need a call to learn the boundary.

- [x] [../README.md](../README.md) states what the product is, the price band, the hard outs, and the contact.
- [x] [../BUYER_START_HERE.md](../BUYER_START_HERE.md) is the front door.
- [x] [MVP_SCOPE.md](MVP_SCOPE.md) is the rule list. Superseded P-rules stay visible. Active rules after DR#3 are P6, P7, P11, P17–P24, and P25–P30.
- [x] [COMPETITIVE_SKIM.md](COMPETITIVE_SKIM.md) records public claims and leaves unknowns unmarked as facts. DR#3 did not add metrics.
- [x] [../.env.example](../.env.example) names each secret and the read-only constraint.
- [x] [../mapping.example.yaml](../mapping.example.yaml) is the whole mapping surface.
- [x] [../LICENSE](../LICENSE) states single-org use, no competing-kit resale, and no warranty of entitlement correctness.
- [ ] A short "first live run" note, written when the detector exists, showing one redacted finding and one failed-read alert. Not before, so the repo does not show fake customers.

## 4. CI

- [x] [../.github/workflows/ci.yml](../.github/workflows/ci.yml) runs `npm test` on push and pull request.
- [x] The smoke test imports the stubs and fails if an export name looks like a charge, write, or fix API.
- [x] The smoke test fails if dry-run sets `allClear`, if live Slack copy is invented, or if README drops the hard outs.
- [ ] After implementation, tests cover the active rules (P6, P7, P11, P17–P24, P25–P30) with fixtures. Fixtures are invented rows in the test file, not live customers. Superseded rule text is not reimplemented.
- [ ] CI still has no Stripe, Polar, database, or Slack secrets. Live reads stay in the operator's scheduled workflow.

## 5. Versioned zip

Distribution matches the private-kit pattern: this private GitHub repo now, a zip later.

The zip, the SHA-256, and `POLAR_DELIVERABLES` **stay absent**. This checklist does not close those boxes by describing them. DR#3 does not add a placeholder file.

- [x] `package.json` is `private` and version `0.0.0`.
- [ ] A zip of a tagged source tree is built with the real detector, after LaunchGate approves the 4th design review. Polar listing go-live stays a founder (via CoS) decision.
- [ ] SHA-256 of that zip is recorded as lowercase hex of the file bytes.
- [ ] The zip does not contain `.env`, `mapping.yaml`, or `node_modules`.
- [ ] `POLAR_DELIVERABLES` lists the zip name, the SHA-256, and the tag. The file does not exist. This PR does not create it.
- [ ] Polar listing stays dark until those three are real. No Checkout URL in the repo, the README, or the CLI help.

## 6. Support and money boundary

- [x] Contact is hello@yellowgram.dev. Prefer https://www.yellowgram.dev.
- [x] Support language is English.
- [x] The license refuses a warranty that comparisons are correct.
- [ ] Email support, when a kit has been sold, covers: how to run the documented path, how to read a finding, and defects where the kit breaks its own rules.
- [x] Support channel is email to hello@yellowgram.dev. GitHub Issues on a private buyer repo are not a channel yellowgram can read. They are not a place to paste keys or production rows. A collaborator seat on that private repo is not support, and it is not permission to patch `is_pro` (DR#2, restated in DR#3).
- [ ] Email support does not cover: changing the operator's webhook, editing `is_pro`, interpreting a partial refund, writing a custom SQL join, sending an `UPDATE` "for convenience", or joining the operator's Slack.
- [ ] The only invoice yellowgram sends is for SeatTruth itself, to an organization that bought it. No cold invoices. No invoices for the operator's end customers.
- [ ] The kit never creates a charge, a refund, or a Checkout session.
- [ ] Price, when a listing exists, is a published number in the $49–99 band. No pay-what-you-want. No "reply with what you'd pay." No discount because the first week of alerts was noisy.

## 7. Ops for Slack and cron

- [x] Cron is documented as `0 6 * * *` (06:00 UTC daily).
- [x] Manual dispatch exists for a dry-run.
- [x] Workflow permissions are `contents: read`.
- [ ] The operator owns the Slack app and the webhook. yellowgram is not in that workspace.
- [ ] A finding alert, an ambiguous-count line, and a run-error alert are different first lines, so a channel can be skimmed. Copy is written at implementation under P6, P24, and P25. Deliberate skips are not listed per user.
- [x] Dry-run versus live is specified (P30, which supersedes P16). This scaffold still refuses `--live`. A green dry-run is not an entitlement pass. When live exists, the daily cron is live, and `workflow_dispatch` stays dry unless the operator sets a live input. Dry-run does not call providers, the database, or Slack.
- [x] Slack webhook URLs are GitHub Actions secrets. They are rotated in the same order as provider keys: create the new webhook, update the GitHub secret, run one live dispatch after the detector exists, then revoke the old webhook. Never write the URL into the workflow file, a log, an Issue, or a Slack message body (P23).
- [x] Key rotation order is specified, and not automated. Create the new restricted key first. Update the GitHub Actions secret. After the detector exists, run one live dispatch. Then revoke the old key in the Stripe or Polar UI. Do not put the new key in git, Issues, or Slack. If a key lands in a log, rotate it. The kit must not log credential values (P23).
- [x] Cron failure visibility is a red GitHub Actions check when the job exits non-zero, plus whatever failure mail the operator already gets from GitHub. A quiet Slack channel is not proof the cron ran, and it is not proof entitlements match. The kit does not send a daily all-clear Slack message (P24, P30). It does not add a second pager. A repeated finding is shown again the next day. Snooze is refused.

## 8. Delta log, v1 → v2

v1 shipped in DR#1 (pull request #1) with no expert deltas. v2 shipped in DR#2 (pull request #2). This section is history. It is not the current checklist.

### Expert A — billing state

- Superseded P1 with P11. No boolean coercion. Null seats are not zero. Seats still do not decide the case.
- Superseded P2 and P3 with P12. A written Stripe and Polar status map. `cancel_at_period_end` is not a cancel. Active plus a full refund, and any partial refund, are unclassified. `past_due` and `unpaid` stay unclassified. No invented Polar refund field.
- Added P13. No subscription is not a cancel. A null customer id skips that rail for that row.
- Superseded P4 with P14 and P15. Unclassified users are a count, not a failed read. No primary rail.
- Superseded P9 with P16. `allClear` is false while unclassified users remain. A green dry-run is not a pass.

### Expert B — mapping

- Superseded P8 with P18. Schema is required. Identifiers are validated and quoted. No `search_path` fallback.
- Added P19. One mapping file is one tenant.
- Added P20. NULL seats versus a missing column.
- Added P21 and P22. Empty string is not "rail off." Zero rails is a run error.
- Superseded P5 with P17. Duplicate ids exclude those users only.

### Expert C — support and temptation

- Superseded P10 with P24. Suggested SQL and refund advice are fix instructions.
- Added P23. Do not log secrets. Rotation order is in section 7.
- Support is email only. Private-repo Issues are not a channel.
- Zip rules gained the checksum shape and the ban on bundling secrets. `POLAR_DELIVERABLES` stays absent.
- Snooze, percent-of-savings pricing, Chargebee, and Autumn are refused. They are not a v2 feature.

DR#2 did not call this file v3. LaunchGate was not asked.

## 9. Delta log, v2 → v3

v3 is this DR#3 pass. Three experts ran in order inside this PR. Their full attacks are in [DESIGN_REVIEW_DR3.md](DESIGN_REVIEW_DR3.md).

### Expert A — residual false cases

- Superseded P14 with P25. `trialing`, `incomplete`, and `incomplete_expired` are a deliberate skip. They do not block `allClear`. `past_due`, `paused`, and `unpaid` stay ambiguous and still block it.
- Superseded P12 with P26. Stripe: any refund on an `active` subscription is ambiguous. There is no "latest charge." Status `canceled` is the only canceled bucket.
- Superseded P13 and P15 with P28. A deliberate-skip rail does not hide `paid_locked_out`. Case 2 still needs every applicable rail canceled. No primary rail.
- Added P29. Any `active` subscription counts as paid, including an add-on and quantity `0`. A price allow-list is refused as plan drift.

### Expert B — Polar refunds and partial reads

- P26 cites Polar's refund doc: refunding a subscription order returns the money and does not end the subscription. The kit does not read Polar order or refund objects. Order statuses are not subscription statuses. No Polar field was invented.
- Webhook names such as `subscription.revoked` are not statuses. They are ambiguous (P25).
- Added P27. An incomplete provider read is a run error. A short page is not a wave of cancels.
- A customer id with a complete read and zero subscriptions stays ambiguous (P28).

### Expert C — support, secrets, cron

- Header and section 5 state that the zip, the SHA-256, and `POLAR_DELIVERABLES` are absent. No placeholder file.
- Slack webhook handling is in section 7, under P23.
- Cron failure is a red Actions check, not a quiet channel and not a daily all-clear Slack message (P30).
- Private-repo Issues stay out. A collaborator seat is not the support path.
- Buyer-needs refusals for an ignore-trials toggle, a pro-price filter, a daily all-clear, a noisy-week discount, and a private-repo patch seat are in [BUYER_NEEDS_BEYOND_CHECKLIST.md](BUYER_NEEDS_BEYOND_CHECKLIST.md).

## 10. What the 4th DR should see

This is the input list for LaunchGate. The decision request is [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md). Checking these boxes here does not approve the design. This section is not a new checklist version.

- Two detect cases only: `paid_locked_out` and `canceled_still_entitled`.
- Active rules: P6, P7, P11, P17–P24, P25–P30. Superseded text stays in [MVP_SCOPE.md](MVP_SCOPE.md).
- Accepted limits: no price filter (P29); trials do not block `allClear` (P25, P30); no primary rail (P28); Polar refunds do not classify the subscription (P26); a partial provider page is a run error (P27).
- Hard locks: no auto-fix, no Soft-WTP, no Chargebee, no Autumn, Polar listing dark.
- Zip, SHA-256, and `POLAR_DELIVERABLES` absent.
- Price and refund window unset. Founder (via CoS) owns those, plus Polar go-live, Soft-WTP, spending money, and scope that becomes Chargebee, Autumn, or auto-fix.
- Detector not implemented.

The 4th DR packet submits this list. The cases are still decidable without a write or a guessed schema. Approval is the ask in [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md), and it has not been given.

## Done means

The scaffold portion is done when `npm test` passes, the workflow stays dry-run, and the docs match the boxes above. The product boxes stay open. They are not closed by this PR, and they are not closed by claiming CR×3, the 4th CR, or a LaunchGate approval happened here.

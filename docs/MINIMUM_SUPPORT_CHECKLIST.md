# Minimum support checklist (v3)

**Checklist v3.** DR#1 shipped v1. DR#2 shipped v2. DR#3 shipped this v3 text. The v1→v2 log is section 8. The v2→v3 log is section 9. The 4th DR did not publish a v4. The LaunchGate packet is [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md).

**0.1.1 pack.** The versioned zip, its SHA-256, and `POLAR_DELIVERABLES` are in the tree. SeatTruth is source-available under the PolyForm Noncommercial License 1.0.0. Commercial use is the Suthirth Commercial Grant. PolyForm Noncommercial 1.0.0 is not an OSI-approved license. `release/seattruth-0.1.0.zip` and tag `v0.1.0` are unchanged. Founder typed Polar go-live on 2026-09-26. CoS confirmed the Polar listing is listed. The Polar listing, price, and zip attachment are unchanged. Soft-WTP stays off. This checklist does not add a Checkout URL.

The detector is on `main` (pull request #5). Section 10 was the input list for the 4th DR. See [STATUS.md](STATUS.md).

What "supported" means for SeatTruth once an operator has the kit. The founder should be able to stay out of the room for the path below. Items marked done are true of this tree. Items left open wait for an operator's own keys.

HookSteel (`yellowgram/hooksteel`) is the doc pattern this list follows: happy path, safe defaults, docs that replace the founder, CI, a versioned zip, a support and money boundary, and ops. That repo was not readable when the scaffold was written (GitHub 404). The sections below are SeatTruth's, for a read-only drift detector. No HookSteel billing code is included.

Cadence: DR#1 is pull request #1. DR#2 is pull request #2. DR#3 is pull request #3, which shipped this v3 text. The 4th DR is pull request #4 and is approved. The implement work is pull request #5, merged to `main`. The price lock is pull request #6. Ordinary code gates did not wait on the founder. Founder typed Polar go-live on 2026-09-26. CoS confirmed the Polar listing is listed.

## 1. Happy path

The path an operator can finish from the docs. The dry-run prefix works without keys. A live run needs the operator's own secrets.

- [x] Docs say a dry-run is not an all-clear.
- [x] `npm test` passes without keys.
- [x] `npm run compare -- --dry-run` exits 0 and prints that this is not an all-clear.
- [x] `npm run compare -- --live` without credentials exits 1. It does not report an all-clear.
- [ ] Operator copies `.env.example` to `.env` and `mapping.example.yaml` to `mapping.yaml`.
- [ ] Operator creates a Stripe restricted key (read only) and a Polar Organization Access Token (read scopes only), or disables a rail with `customer_id: null`.
- [ ] Operator creates a Postgres role with `SELECT` on the mapped relation only.
- [ ] Operator stores the four secrets and the mapping path in GitHub Actions. The Slack webhook is one of those secrets. It is not written into the workflow file.
- [ ] A manual live dispatch posts to Slack only for a finding, a non-zero ambiguous count, or a failed classification. It does not post a daily all-clear (P24, P30).
- [ ] The daily cron repeats that live run once `SEATTRUTH_MAPPING_YAML` is set. Exit code is non-zero when `allClear` is false. That red Actions check is the failure signal (P30). An unset mapping secret skips the schedule instead of failing it.

## 2. Safe defaults

- [x] CLI defaults to dry-run. Live mode is opt-in.
- [x] The compare workflow file does not contain secret values. The live steps read GitHub Actions secrets.
- [x] Dispatch stays dry-run unless the operator sets the live input. A live dispatch fails when `SEATTRUTH_MAPPING_YAML` is unset. The daily schedule exits 0 and skips the compare when that secret is unset. That skip is not an all-clear. After the mapping secret is set, a missing database URL, a missing credential on an enabled rail, or a missing Slack webhook when a post is required still fails the job.
- [x] A missing credential or a Stripe secret key is refused. A failed read is not an all-clear.
- [x] A Stripe secret key (`sk_`) is refused.
- [x] `.env.example` and `mapping.example.yaml` contain placeholders, not live ids.
- [x] `mapping.yaml` and `.env` are gitignored.
- [x] Missing credential on an enabled rail is a run error (rule P7).
- [x] Status buckets follow P26. `past_due`, `paused`, and `unpaid` stay ambiguous. `trialing`, `incomplete`, and `incomplete_expired` are a deliberate skip (P25).
- [x] `NULL` `is_pro` is ambiguous, not a guessed boolean (rule P11, P25).
- [x] Slack omits email, name, and card data (rule P6).
- [x] A truncated provider page is a run error, not "no subscription" (P27).
- [x] No ignore list ships with the kit.

## 3. Docs that replace the founder

An operator should not need a call to learn the boundary.

- [x] [../README.md](../README.md) states what the product is, the locked one-time price, the hard outs, and the contact.
- [x] [../BUYER_START_HERE.md](../BUYER_START_HERE.md) is the front door.
- [x] [MVP_SCOPE.md](MVP_SCOPE.md) is the rule list. Superseded P-rules stay visible. Active rules after DR#3 are P6, P7, P11, P17–P24, and P25–P30.
- [x] [COMPETITIVE_SKIM.md](COMPETITIVE_SKIM.md) records public claims and leaves unknowns unmarked as facts. DR#3 did not add metrics.
- [x] [../.env.example](../.env.example) names each secret and the read-only constraint.
- [x] [../mapping.example.yaml](../mapping.example.yaml) is the whole mapping surface.
- [x] [../LICENSE](../LICENSE) is the PolyForm Noncommercial License 1.0.0, with the required notice. [COMMERCIAL_GRANT.md](COMMERCIAL_GRANT.md) states single-org commercial use, no competing-kit resale, and no warranty of entitlement correctness. Seller: Suthirth solutions. PolyForm Noncommercial 1.0.0 is not an OSI-approved license. SeatTruth is source-available.
- [x] [../SUPPORT.md](../SUPPORT.md) is the email boundary. English, no concierge, and no end-customer refund advice.
- [x] A short first live run note is in [../BUYER_START_HERE.md](../BUYER_START_HERE.md). The ids are invented. It shows a finding, an ambiguous count, and a failed read, and it does not say which change to make.

## 4. CI

- [x] [../.github/workflows/ci.yml](../.github/workflows/ci.yml) runs `npm test` on push and pull request.
- [x] The smoke test imports the stubs and fails if an export name looks like a charge, write, or fix API.
- [x] The smoke test fails if dry-run sets `allClear`, if live Slack copy is invented, or if README drops the hard outs.
- [x] Tests cover the active rules with invented fixtures, including the P28 table, Stripe refund ambiguity, and truncated pages. Superseded rule text is not reimplemented.
- [x] CI still has no Stripe, Polar, database, or Slack secrets. Live reads stay in the operator's scheduled workflow.

## 5. Versioned zip

Distribution is the private GitHub repo `yellowgram/seattruth` plus the versioned zip.

`npm run pack:release` builds `release/seattruth-<version>.zip` from `git archive` of HEAD, using the version in `package.json`. The mtime is pinned to `2026-09-26T00:00:00Z`. The zip comment is `seattruth-<version>`. The archive omits `node_modules/`, `.env`, `.env.local` (`.env.example` stays), `.git/`, `release/`, `docs/CHECKSUMS.md`, dumps, a real `mapping.yaml` (`mapping.example.yaml` stays), and `dist/`. Older zips stay in `release/` and are not rewritten.

- [x] `package.json` is `private` and version `0.1.1`. The license field is `SEE LICENSE IN LICENSE`.
- [x] The 0.1.0 zip remains `release/seattruth-0.1.0.zip`. Its bytes are unchanged. GitHub Release `v0.1.0` is not retagged.
- [x] The current pack is `release/seattruth-0.1.1.zip`, built with the real detector.
- [x] SHA-256 of each zip is recorded as lowercase hex of the file bytes in [CHECKSUMS.md](CHECKSUMS.md).
- [x] The zip does not contain `.env`, `mapping.yaml`, or `node_modules`.
- [x] [POLAR_DELIVERABLES.md](POLAR_DELIVERABLES.md) names the Polar attachment `seattruth-0.1.0.zip` and the tag `v0.1.0`, and the repository pack `release/seattruth-0.1.1.zip` and the tag `v0.1.1`. The SHA-256 paste line is in [CHECKSUMS.md](CHECKSUMS.md), not copied into the packet.
- [x] Polar listing is listed (CoS confirmed). GitHub Release `v0.1.0` exists and `seattruth-0.1.0.zip` stays attached on the Polar product. This license fence does not change the listing, the price, or that attachment. No Checkout URL in the repo, the README, or the CLI help. The purchase path from this repo is https://www.yellowgram.dev or hello@yellowgram.dev.

## 6. Support and money boundary

- [x] Contact is hello@yellowgram.dev. Prefer https://www.yellowgram.dev.
- [x] Support language is English.
- [x] The license refuses a warranty that comparisons are correct.
- [x] Email support, when a kit has been sold, covers: how to run the documented path, how to read a finding, and defects where the kit breaks its own rules. See [../SUPPORT.md](../SUPPORT.md).
- [x] Support channel is email to hello@yellowgram.dev. GitHub Issues on a private buyer repo are not a channel yellowgram can read. They are not a place to paste keys or production rows. A collaborator seat on that private repo is not support, and it is not permission to patch `is_pro` (DR#2, restated in DR#3).
- [x] Email support does not cover: changing the operator's webhook, editing `is_pro`, interpreting a partial refund, writing a custom SQL join, sending an `UPDATE` "for convenience", or joining the operator's Slack. The kit does not recommend end-customer refunds.
- [x] The only invoice yellowgram sends is for SeatTruth itself, to an organization that bought it. No cold invoices. No invoices for the operator's end customers.
- [x] The kit never creates a charge, a refund, or a Checkout session.
- [x] Price is **$99 once** per organization. Launch hook: the first 10 at **$79 once**, one SKU. Not monthly. No pay-what-you-want. No "reply with what you'd pay." No discount because the first week of alerts was noisy. No negotiation off the locked number. Soft-WTP stays forbidden.

## 7. Ops for Slack and cron

- [x] Cron is documented as `0 6 * * *` (06:00 UTC daily).
- [x] Manual dispatch exists for a dry-run.
- [x] Workflow permissions are `contents: read`.
- [ ] The operator owns the Slack app and the webhook. yellowgram is not in that workspace.
- [x] A finding alert, an ambiguous-count line, and a run-error alert are different first lines, so a channel can be skimmed. Copy follows P6, P24, and P25. Deliberate skips are not listed per user.
- [x] Dry-run versus live follows P30. A green dry-run is not an entitlement pass. The daily cron is live when `SEATTRUTH_MAPPING_YAML` is set, and `workflow_dispatch` stays dry unless the operator sets a live input. Dry-run does not call providers, the database, or Slack. An unset mapping secret makes the schedule skip those calls and exit 0. That green check is not an entitlement pass.
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
- Hard locks: no auto-fix, no Soft-WTP, no Chargebee, no Autumn. The 4th DR input also recorded the Polar listing as dark. That line is historical. The listing is listed.
- Zip, SHA-256, and `POLAR_DELIVERABLES` absent.
- Price and refund window unset. Founder (via CoS) owns those, plus Polar go-live, Soft-WTP, spending money, and scope that becomes Chargebee, Autumn, or auto-fix.
- Detector implemented on this branch. Squash-merge still waits on the 4th code review.

The 4th DR packet submitted this list. LaunchGate approved it on pull request #4. This section is that input, not a second approval. The ask text is in [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md). Founder later locked the price at **$99 once** per organization (first 10 at **$79 once**) and the refund window at **14 days**. Founder later typed Polar go-live on 2026-09-26. CoS later confirmed the Polar listing is listed. The 0.1.0 zip, [CHECKSUMS.md](CHECKSUMS.md), and [POLAR_DELIVERABLES.md](POLAR_DELIVERABLES.md) are in the tree. The detector is on `main`. This section does not rewrite that input.

## Done means

The scaffold portion is done when `npm test` passes and the docs match the boxes above. The daily cron is the live path once `SEATTRUTH_MAPPING_YAML` is set. An unset mapping secret skips that cron with exit 0, and that skip is not an all-clear. A green dry-run is not an all-clear. Section 5 is closed for 0.1.1: the current zip, the SHA-256 file, and `POLAR_DELIVERABLES` are real, `release/seattruth-0.1.0.zip` is unchanged, the Polar listing is listed with that 0.1.0 attachment, and the README has no Checkout URL. Operator setup boxes in section 1 stay open until an operator fills their own keys.

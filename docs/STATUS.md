# Status

Updated 2026-09-27. The detector is on `main`. Implement pull request #5 is merged. The price lock is pull request #6. This tree is the **0.1.1** pack. Founder typed **go-live** on 2026-09-26. CoS confirmed the Polar listing is **listed**. Polar delivers `seattruth-0.1.1.zip`. SHA-256 `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6`. GitHub Release `v0.1.0` still carries `seattruth-0.1.0.zip`. That tag and that zip are the sealed prior distribution and are not rewritten. They are not what Polar currently delivers. The price is unchanged. Soft-WTP stays off. This repository does not contain a Checkout URL.

| Item | State |
| --- | --- |
| DR#1 | Done. https://github.com/yellowgram/seattruth/pull/1 |
| DR#2 | Done. https://github.com/yellowgram/seattruth/pull/2 |
| DR#3 | Done. https://github.com/yellowgram/seattruth/pull/3 |
| 4th DR | Approved. https://github.com/yellowgram/seattruth/pull/4 at `eed8afdb210a46e489b5815b5261f8574f906336` |
| Implement PR | **Merged.** https://github.com/yellowgram/seattruth/pull/5. The detector is on `main`. |
| CR#1 | **Done.** Expert A, billing path. [CODE_REVIEW_CR1.md](CODE_REVIEW_CR1.md). |
| CR#2 | **Done.** Expert B, operator safety. [CODE_REVIEW_CR2.md](CODE_REVIEW_CR2.md). |
| CR#3 | **Done.** Expert C, buyer path. [CODE_REVIEW_CR3.md](CODE_REVIEW_CR3.md). |
| 4th CR | Historical gate packet: [CODE_REVIEW_CR4.md](CODE_REVIEW_CR4.md). It is not an open step. The detector from that implement work is already on `main`. |
| Detector | On `main`. Read-only. Dry-run does not call the network. `--live` reads Stripe, Polar, and Postgres and can post to Slack. |
| `npm test` | Smoke test plus fixtures for P26, P27, and P28. Export names still ban charge, write, and fix APIs. |
| GitHub Action `compare` | Daily cron is live when `SEATTRUTH_MAPPING_YAML` is set. If that secret is unset, the schedule skips and exits 0. That skip is not an entitlement pass. Manual dispatch stays dry-run unless the operator turns that off. A live dispatch fails if the mapping secret is unset. Secrets are not in the workflow file. A green dry-run is not an entitlement pass. |
| Polar listing | **Listed.** CoS confirmed. Organization **Suthirth solutions**. Product `9aab6e67-3533-44d1-aa0b-bfdaf6dbc753`. Admin: https://polar.sh/dashboard/suthirth-solutions/products/9aab6e67-3533-44d1-aa0b-bfdaf6dbc753. Checkout is the founding **$79** one-time on this SKU. Raise the same SKU to **$99** after the first 10 organizations. Polar delivers zip `seattruth-0.1.1.zip`, SHA-256 `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6`. GitHub Release `v0.1.0` exists and is not rewritten; it carries the sealed prior zip `seattruth-0.1.0.zip`, which is not the current Polar delivery. Soft-WTP is off (no coupon). GitHub benefit is off (sudo / mobile blocked; known ops limit). Polar has no per-product refund toggle; **14 days** is in the listing copy. No Checkout URL in this repo. |
| License | Source-available under PolyForm Noncommercial 1.0.0 ([../LICENSE](../LICENSE)). Not an OSI-approved license. Commercial use is the Suthirth Commercial Grant ([COMMERCIAL_GRANT.md](COMMERCIAL_GRANT.md)). Seller: **Suthirth solutions**. |
| Versioned zip | Polar delivers `release/seattruth-0.1.1.zip`, built by `npm run pack:release`. Prior zip `release/seattruth-0.1.0.zip` is the sealed prior distribution and is not rewritten. |
| SHA-256 | Polar delivery `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6` for `seattruth-0.1.1.zip`. Both zips are in [CHECKSUMS.md](CHECKSUMS.md). |
| `POLAR_DELIVERABLES` | [POLAR_DELIVERABLES.md](POLAR_DELIVERABLES.md). Names the Polar delivery `seattruth-0.1.1.zip` and the sealed prior tag `v0.1.0`. |
| Package version | `0.1.1`, private. License field `LicenseRef-PolyForm-Noncommercial-1.0.0`. |
| Price | Locked. **$99 once** per organization (one-time, not monthly). First 10 organizations at **$79 once**, one SKU. The live checkout is that founding **$79**. Raise the same SKU to **$99** after those 10. Not negotiable. Soft-WTP stays forbidden. No Soft-WTP coupon. |
| Refund window | Locked. **14 days**, stated in the listing copy. Polar has no per-product refund toggle. The kit does not recommend end-customer refunds. |

## Cadence

The design and code gates that produced the detector are finished. Ordinary gates did not wait on the founder. The Polar listing is listed. What remains on that SKU is the founding-price raise, not another design review.

1. **DR×3.** Done. Pull requests #1, #2, and #3.
2. **4th DR → LaunchGate APPROVE.** Done. Pull request #4.
3. **Implement PR.** Merged. Pull request #5. The detector is on `main`.
4. **CR×3.** Done on that implement work. [CODE_REVIEW_CR1.md](CODE_REVIEW_CR1.md), [CODE_REVIEW_CR2.md](CODE_REVIEW_CR2.md), [CODE_REVIEW_CR3.md](CODE_REVIEW_CR3.md).
5. **Price and refund.** Locked on pull request #6.
6. **Polar listing.** Founder typed go-live on 2026-09-26. CoS confirmed the product is listed. Polar delivers `seattruth-0.1.1.zip` (SHA-256 `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6`). GitHub Release `v0.1.0` exists and is not rewritten. `seattruth-0.1.0.zip` is the sealed prior distribution, not the current Polar delivery.

A green CI run is not what listed the product. This repository does not contain a Checkout URL.

## Scope that shipped

- Two detect cases only: `paid_locked_out` and `canceled_still_entitled`, matching the P26 and P28 summaries LaunchGate approved.
- Active rules: P6, P7, P11, P17–P24, P25–P30. No new rule ids.
- P2 notes are implemented and written in [ACCEPTANCE_NOTES.md](ACCEPTANCE_NOTES.md): Polar scope `subscriptions:read`, the Stripe invoice-and-charge refund recipe, the P28 fixture table, and the Stripe and Polar pagination contracts.
- Hard locks stay closed: no auto-fix, no Soft-WTP, no Chargebee, no Autumn. No Checkout URL in the repo.

## Founder (via CoS)

The founder is not in the ordinary CR path. The price is locked at **$99 once** per organization (first 10 at **$79 once**, one SKU). The live checkout is the founding **$79**. Raise that same SKU to **$99** after the first 10 organizations. The refund window is locked at **14 days** and is stated in the listing copy. Polar has no per-product refund toggle. Founder typed Polar go-live on 2026-09-26. CoS confirmed the listing is listed. Founder (via CoS) still decides:

- spending money
- scope that becomes Chargebee, Autumn, or auto-fix

Soft-WTP stays forbidden. The standing answer is no, and there is no Soft-WTP coupon. The Polar GitHub benefit is off because sudo / mobile blocked enabling it. That is a known ops limit. Operator notes, the product id, and the admin URL are in [POLAR_DELIVERABLES.md](POLAR_DELIVERABLES.md). Polar organization: **Suthirth solutions**. People buying from this repository start at [www.yellowgram.dev](https://www.yellowgram.dev) or hello@yellowgram.dev.

## Code review

- CR#1: [CODE_REVIEW_CR1.md](CODE_REVIEW_CR1.md). P0/P1 from that pass are fixed on this branch. Deferred limits are listed there.
- CR#2: [CODE_REVIEW_CR2.md](CODE_REVIEW_CR2.md). P0/P1 from that pass are fixed on this branch. Deferred limits are listed there.
- CR#3: [CODE_REVIEW_CR3.md](CODE_REVIEW_CR3.md). P0/P1 from that pass are fixed on this branch. Deferred limits are listed there.
- 4th CR packet: [CODE_REVIEW_CR4.md](CODE_REVIEW_CR4.md). Historical. The detector is already on `main`.

## Where the reviews live

- Rules: [MVP_SCOPE.md](MVP_SCOPE.md).
- 4th DR packet: [DESIGN_REVIEW_DR4.md](DESIGN_REVIEW_DR4.md).
- P2 notes: [ACCEPTANCE_NOTES.md](ACCEPTANCE_NOTES.md).
- Checklist v3: [MINIMUM_SUPPORT_CHECKLIST.md](MINIMUM_SUPPORT_CHECKLIST.md).

## Contact

hello@yellowgram.dev

Prefer [www.yellowgram.dev](https://www.yellowgram.dev).

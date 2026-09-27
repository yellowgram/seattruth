# Changelog

## 0.1.1 — 2026-09-27

License fence. The Polar listing, price, and zip attachment are unchanged. Soft-WTP stays off.

- SeatTruth is source-available under the PolyForm Noncommercial License 1.0.0. PolyForm Noncommercial 1.0.0 is not an OSI-approved license.
- Commercial use is the Suthirth Commercial Grant in `docs/COMMERCIAL_GRANT.md`. Seller and licensor: Suthirth solutions. One purchasing organization may use and modify SeatTruth for that organization's own internal operations. Resale as a competing dual-rail access-contract or billing-versus-entitlement kit is not allowed. There is no warranty of entitlement correctness.
- Price stays **$99 once** per organization. The first 10 organizations stay **$79 once**. The refund window stays **14 days** for the SeatTruth purchase. Soft-WTP stays off.
- New zip `release/seattruth-0.1.1.zip`. Tag `v0.1.1`. SHA-256 in `docs/CHECKSUMS.md`.
- `release/seattruth-0.1.0.zip` and tag `v0.1.0` are unchanged. The Polar product still has `seattruth-0.1.0.zip` attached. This repository does not contain a Checkout URL. The purchase path is https://www.yellowgram.dev or hello@yellowgram.dev.

## 0.1.0 — 2026-09-26

First baseline of the read-only SeatTruth detector.

- Dual-rail compare of Stripe and Polar against product `is_pro` and seats. Two findings only: `paid_locked_out` and `canceled_still_entitled`. A match is silence. A dry-run is not an all-clear.
- No auto-fix, no writes to Stripe, Polar, or the product database, and no charges or Checkout inside the kit.
- Price locked at **$99 once** per organization. The first 10 organizations are **$79 once** on the same SKU. Refund window **14 days**. Soft-WTP and cold invoices stay forbidden. The kit does not recommend end-customer refunds.
- Versioned zip `release/seattruth-0.1.0.zip`. SHA-256 in `docs/CHECKSUMS.md`. CoS packet in `docs/POLAR_DELIVERABLES.md`.
- Founder typed Polar go-live on 2026-09-26. CoS confirmed the Polar listing is listed. GitHub Release `v0.1.0` carries `seattruth-0.1.0.zip`. SeatTruth is for sale via Polar. This repository does not contain a buy link. The purchase path is https://www.yellowgram.dev or hello@yellowgram.dev.

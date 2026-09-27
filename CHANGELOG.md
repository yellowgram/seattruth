# Changelog

## 0.1.0 — 2026-09-26

First baseline of the read-only SeatTruth detector.

- Dual-rail compare of Stripe and Polar against product `is_pro` and seats. Two findings only: `paid_locked_out` and `canceled_still_entitled`. A match is silence. A dry-run is not an all-clear.
- No auto-fix, no writes to Stripe, Polar, or the product database, and no charges or Checkout inside the kit.
- Price locked at **$99 once** per organization. The first 10 organizations are **$79 once** on the same SKU. Refund window **14 days**. Soft-WTP and cold invoices stay forbidden. The kit does not recommend end-customer refunds.
- Versioned zip `release/seattruth-0.1.0.zip`. SHA-256 in `docs/CHECKSUMS.md`. CoS packet in `docs/POLAR_DELIVERABLES.md`.
- Founder typed Polar go-live on 2026-09-26. CoS publishes the listing after this pack is on `main` and GitHub Release `v0.1.0` includes the zip. This repository does not contain a buy link.

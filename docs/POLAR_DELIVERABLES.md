# Polar deliverables — SeatTruth 0.1.0

Founder typed **go-live** on 2026-09-26. The listing may go light after this packet is on `main` and the GitHub Release asset exists. This file is the CoS packet. It does not publish the listing, and it does not contain a Checkout URL.

Polar organization for the listing: **Suthirth solutions**. `LICENSE` and `docs/STATUS.md` do not name a different Polar organization.

## Paste-ready listing draft

**Name:** SeatTruth

**Price:** $99 once per organization. One product. One SKU. Not a monthly fee.

**Founding note, same SKU:** The first 10 organizations pay $79 once. Do not create a second Polar product. Do not create a Soft-WTP coupon. Do not send a cold invoice.

**Description:**

SeatTruth is a read-only check between two billing rails, Stripe and Polar, and the product database fields `is_pro` and seats. It reports two disagreements. The operator decides what to do about them.

1. Paid on an applicable rail, no applicable rail ambiguous, and `is_pro` false.
2. Status `canceled` on every applicable rail, and `is_pro` true. A Polar refund is not this case. Stripe `active` with any refund is not this case.

A match is silence. The kit does not charge, refund, open Checkout, write `is_pro`, or auto-fix. Delivery is private repository access to `yellowgram/seattruth` plus the versioned zip. English email support at hello@yellowgram.dev. There is no concierge and no qualification call. The commercial license is one organization, with no warranty that a comparison is correct. The kit does not recommend refunds of an operator's end customers. The 14-day refund window is for the SeatTruth purchase.

## Price, refund, license, support

| Item | Lock |
| --- | --- |
| Price | **$99 once** per organization |
| Launch hook | First 10 organizations at **$79 once**, on this same SKU |
| Refund | **14 days**. Set the Polar refund toggle to 14 days |
| Soft-WTP / cold invoices | Forbidden |
| License | Commercial, one organization. See `LICENSE`. No warranty of entitlement correctness |
| Support | Email hello@yellowgram.dev. English. No concierge. Boundary in `SUPPORT.md` |
| Contact site | https://www.yellowgram.dev |
| Delivery | Private repo `yellowgram/seattruth` plus the versioned zip |

The kit does not recommend end-customer refunds. Case 2 is provider status `canceled` only.

## Zip

| Item | Value |
| --- | --- |
| File | `release/seattruth-0.1.0.zip` |
| Tag | `v0.1.0` |
| Prefix inside the zip | `seattruth-0.1.0/` |
| Entry mtime | `2026-09-26T00:00:00Z` |
| Zip comment | `seattruth-0.1.0` |
| Build | `npm run pack:release` |

### Omit contract

`git archive` of HEAD omits:

- `node_modules/`
- `.env` and `.env.local` (`.env.example` stays)
- `.git/`
- `release/` (the zip does not contain itself)
- `docs/CHECKSUMS.md`
- dumps (`dumps/`, `*.dump`, `*.sql`)
- a real `mapping.yaml` if one is present (`mapping.example.yaml` stays)
- build output `dist/`

## Checksum paste line

Paste the lowercase SHA-256 line from [CHECKSUMS.md](CHECKSUMS.md) into the GitHub Release notes. That line is the hex of the zip bytes. This packet does not copy the hex.

## CoS steps

1. Merge this pack to `main`.
2. Cut GitHub Release `v0.1.0`. Attach `release/seattruth-0.1.0.zip`. Put the SHA-256 paste line from [CHECKSUMS.md](CHECKSUMS.md) in the release notes.
3. In Polar, organization **Suthirth solutions**, set the refund toggle to **14 days**.
4. Publish **one** SKU at **$99 once**, with the founding note that the first 10 organizations are **$79 once**. Do not create a second product. Do not add a Soft-WTP coupon.
5. Grant buyers private access to `yellowgram/seattruth` and the versioned zip. Do not put a Checkout URL in the README.

## Hard outs that stay closed

No auto-fix. No Chargebee. No Autumn. No Soft-WTP. No cold invoices. No writes to Stripe, Polar, or `is_pro`.

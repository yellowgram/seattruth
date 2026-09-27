# Polar deliverables — SeatTruth 0.1.0

Founder typed **go-live** on 2026-09-26. CoS confirmed the Polar listing is **listed**. This file is the operator packet for that product. It does not contain a Checkout URL.

Polar organization: **Suthirth solutions**. `LICENSE` and `docs/STATUS.md` name the same organization.

## Listed product

| Item | Value |
| --- | --- |
| State | **Listed.** CoS confirmed. |
| Organization | **Suthirth solutions** |
| Product ID | `9aab6e67-3533-44d1-aa0b-bfdaf6dbc753` |
| Admin | https://polar.sh/dashboard/suthirth-solutions/products/9aab6e67-3533-44d1-aa0b-bfdaf6dbc753 |
| Checkout price now | **$79** founding, one-time, this SKU |
| After the first 10 organizations | Raise this same SKU to **$99** once. One product. Do not add a second product. |
| Zip on the product | `seattruth-0.1.0.zip` is attached |
| GitHub Release | `v0.1.0` exists and carries that zip |
| Soft-WTP | Off. No Soft-WTP coupon. |
| GitHub benefit | Off. Enabling it was blocked (sudo / mobile). Known ops limit. |
| Refund | Polar has no per-product refund toggle. **14 days** is stated in the listing copy. |

Buyers reach the purchase path from [www.yellowgram.dev](https://www.yellowgram.dev) or hello@yellowgram.dev. Keep Checkout URLs out of the README, `BUYER_START_HERE`, and other buyer-facing files.

## Paste-ready listing draft

**Name:** SeatTruth

**Price:** Locked at **$99 once** per organization. The live checkout is the founding **$79** one-time on this same SKU. After the first 10 organizations, raise this SKU to **$99**. One product. One SKU. Not a monthly fee.

**Founding note, same SKU:** The first 10 organizations pay $79 once. Do not create a second Polar product. Do not create a Soft-WTP coupon. Do not send a cold invoice.

**Description:**

SeatTruth is a read-only check between two billing rails, Stripe and Polar, and the product database fields `is_pro` and seats. It reports two disagreements. The operator decides what to do about them.

1. Paid on an applicable rail, no applicable rail ambiguous, and `is_pro` false.
2. Status `canceled` on every applicable rail, and `is_pro` true. A Polar refund is not this case. Stripe `active` with any refund is not this case.

A match is silence. The kit does not charge, refund, open Checkout, write `is_pro`, or auto-fix. Delivery is the versioned zip `seattruth-0.1.0.zip` (attached on this product and on GitHub Release `v0.1.0`) plus private repository access to `yellowgram/seattruth` when that access is granted outside Polar's GitHub benefit. English email support at hello@yellowgram.dev. There is no concierge and no qualification call. The commercial license is one organization, with no warranty that a comparison is correct. The kit does not recommend refunds of an operator's end customers. The 14-day refund window is for the SeatTruth purchase and is stated in this listing copy.

## Price, refund, license, support

| Item | Lock |
| --- | --- |
| Price | **$99 once** per organization, after the founding window |
| Live checkout | **$79 once**, founding, this SKU, until the first 10 organizations |
| Launch hook | First 10 organizations at **$79 once**, on this same SKU, then raise the SKU to **$99** |
| Refund | **14 days**, stated in the listing copy. Polar has no per-product refund toggle |
| Soft-WTP / cold invoices | Forbidden. Soft-WTP is off. No Soft-WTP coupon |
| GitHub benefit | Off. Known ops limit: sudo / mobile blocked enabling it |
| License | Commercial, one organization. See `LICENSE`. No warranty of entitlement correctness |
| Support | Email hello@yellowgram.dev. English. No concierge. Boundary in `SUPPORT.md` |
| Contact site | https://www.yellowgram.dev |
| Delivery | Zip `seattruth-0.1.0.zip` on the Polar product and on GitHub Release `v0.1.0`. Private repo `yellowgram/seattruth` is not granted by the Polar GitHub benefit |

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
| On Polar | Attached to the listed product |
| On GitHub | Release `v0.1.0` asset |

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

The lowercase SHA-256 of the zip bytes is in [CHECKSUMS.md](CHECKSUMS.md). GitHub Release `v0.1.0` already carries `seattruth-0.1.0.zip`. This packet does not copy the hex.

## Ops record

Done:

1. This pack is on `main`.
2. GitHub Release `v0.1.0` exists. `seattruth-0.1.0.zip` is the release asset. The SHA-256 lives in [CHECKSUMS.md](CHECKSUMS.md).
3. One SKU is listed under **Suthirth solutions**. Product ID `9aab6e67-3533-44d1-aa0b-bfdaf6dbc753`. Checkout is the founding **$79** one-time.
4. `seattruth-0.1.0.zip` is attached on that Polar product.
5. Soft-WTP is off. There is no Soft-WTP coupon.
6. The **14-day** refund window is in the listing copy.

Still operator work:

1. After the first 10 organizations, raise this same SKU from **$79** to **$99**. Do not create a second product. Do not add a Soft-WTP coupon.
2. Leave the GitHub benefit off while sudo / mobile blocks it. That is a known ops limit. The zip on the product and on GitHub Release `v0.1.0` is the file buyers get from the listing.
3. Keep **14 days** in the listing copy. Polar has no per-product refund toggle to set.
4. Keep Checkout URLs out of the README, `BUYER_START_HERE`, and other buyer-facing files.

## Hard outs that stay closed

No auto-fix. No Chargebee. No Autumn. No Soft-WTP. No cold invoices. No writes to Stripe, Polar, or `is_pro`.

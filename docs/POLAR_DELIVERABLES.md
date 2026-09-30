# Polar deliverables — SeatTruth 0.1.1

Founder typed **go-live** on 2026-09-26. CoS confirmed the Polar listing is **listed**. This file is the operator packet for that product. It does not contain a Checkout URL.

This 0.1.1 pack is the source-available license fence. Polar delivers `seattruth-0.1.1.zip`. SHA-256 `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6`. Do not unlist the product. The price stays founding **$79** then **$99** on this same SKU. Coupons and cold invoices stay off. Tag `v0.1.0` and `seattruth-0.1.0.zip` are the sealed prior distribution. They are not what Polar currently delivers. Tag `v0.1.0` is not rewritten.

Live attachment re-checked 2026-09-28 (America/New_York): product `9aab6e67-3533-44d1-aa0b-bfdaf6dbc753` downloadable file id `2c3270fa-312a-4d82-9ab2-bf1e157a2d55` is `seattruth-0.1.1.zip`, SHA-256 `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6`.

## Tip versus Polar pin

Recorded 2026-09-30. These are different commits. Write both here and in [STATUS.md](STATUS.md) whenever they diverge. The ship checklist is [SHIP_ATOMIC_PIN.md](SHIP_ATOMIC_PIN.md). This file does not attach a zip and does not cut a tag.

| | |
| --- | --- |
| `main` tip | `26b6df062bdf9914df8cefd75fa006e38ba623ae` |
| Polar pin tag | `v0.1.1` |
| Polar pin commit | `ceb3da6d73250e4602e47af4797e0870891a4640` |
| Zip Polar delivers | `seattruth-0.1.1.zip` |
| SHA-256 | `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6` |

`v0.1.1` is an ancestor of `main`. Six commits sit on tip only. The attached zip is the pin, not a pack of `main` tip. Observed the same day: [www.yellowgram.dev/seattruth](https://www.yellowgram.dev/seattruth) names that zip and that SHA-256. It does not name `main` tip.

Polar organization (dashboard; not renamed this week): **Suthirth solutions**. Legal seller: **Suthirth Solutions, operating as yellowgram**. `LICENSE`, `docs/COMMERCIAL_GRANT.md`, and `docs/STATUS.md` name the same organization.

## Listed product

| Item | Value |
| --- | --- |
| State | **Listed.** CoS confirmed. |
| Polar organization (dashboard; not renamed this week) | **Suthirth solutions** |
| Product ID | `9aab6e67-3533-44d1-aa0b-bfdaf6dbc753` |
| Admin | https://polar.sh/dashboard/suthirth-solutions/products/9aab6e67-3533-44d1-aa0b-bfdaf6dbc753 |
| Checkout price now | **$79** founding, one-time, this SKU |
| After the first 10 organizations | Raise this same SKU to **$99** once. One product. Do not add a second product. |
| Zip on the product | `seattruth-0.1.1.zip` is attached. SHA-256 `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6` |
| GitHub Release | `v0.1.1` carries that zip. Tag `v0.1.0` is not rewritten and still carries `seattruth-0.1.0.zip` as the sealed prior distribution |
| Repository pack | `release/seattruth-0.1.1.zip`. Tag `v0.1.1`. This is the file Polar delivers |
| License | Source-available under PolyForm Noncommercial 1.0.0. Commercial use is the SeatTruth commercial grant. Not an OSI-approved license |
| Coupons / cold invoices | Forbidden. No coupon. |
| GitHub benefit | Off. Enabling it was blocked (sudo / mobile). Known ops limit. |
| Refund | Polar has no per-product refund toggle. **14 days** is stated in the listing copy. |

Buyers reach the purchase path from [www.yellowgram.dev/seattruth](https://www.yellowgram.dev/seattruth) or hello@yellowgram.dev. Keep Checkout URLs out of the README, `BUYER_START_HERE`, and other buyer-facing files.

## Paste-ready listing draft

**Name:** SeatTruth

**Price:** Locked at **$99 once** per organization. The live checkout is the founding **$79** one-time on this same SKU. After the first 10 organizations, raise this SKU to **$99**. One product. One SKU. Not a monthly fee.

**Founding note, same SKU:** The first 10 organizations pay $79 once. Do not create a second Polar product. Do not create a coupon. Do not send a cold invoice.

**Description:**

Source-available kit (zip + docs). You run this. yellowgram does not operate a hosted endpoint for this SKU. Polar delivers seattruth-0.1.1.zip (SHA-256 `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6`). There is no managed, always-on cloud service in this purchase.

SeatTruth is a read-only check between two billing rails, Stripe and Polar, and the product database fields `is_pro` and seats. It reports two disagreements. The operator decides what to do about them.

1. Paid on an applicable rail, no applicable rail ambiguous, and `is_pro` false.
2. Status `canceled` on every applicable rail, and `is_pro` true. A Polar refund is not this case. Stripe `active` with any refund is not this case.

A match is silence. The kit does not charge, refund, open Checkout, write `is_pro`, or auto-fix. The attached file is `seattruth-0.1.1.zip`. Private repository access to `yellowgram/seattruth` is separate, and only when that access is granted outside Polar's GitHub benefit. Tag `v0.1.0` and `seattruth-0.1.0.zip` are the sealed prior distribution. English email support at hello@yellowgram.dev. There is no concierge and no qualification call. SeatTruth is source-available under the PolyForm Noncommercial License 1.0.0. Commercial use is the SeatTruth commercial grant in `docs/COMMERCIAL_GRANT.md`. Legal seller: Suthirth Solutions, operating as yellowgram. The kit does not recommend refunds of an operator's end customers. The 14-day refund window is for the SeatTruth purchase and is stated in this listing copy. Coupons and cold invoices stay off. Uptime of the process you run is yours. Email support is best-effort, and there is no SLA.

## Price, refund, license, support

| Item | Lock |
| --- | --- |
| Price | **$99 once** per organization, after the founding window |
| Live checkout | **$79 once**, founding, this SKU, until the first 10 organizations |
| Launch hook | First 10 organizations at **$79 once**, on this same SKU, then raise the SKU to **$99** |
| Refund | **14 days**, stated in the listing copy. Polar has no per-product refund toggle |
| Coupons / cold invoices | Forbidden. No coupon |
| GitHub benefit | Off. Known ops limit: sudo / mobile blocked enabling it |
| License | Source-available under PolyForm Noncommercial 1.0.0 (`LICENSE`). Not an OSI-approved license. Commercial use is the SeatTruth commercial grant (`docs/COMMERCIAL_GRANT.md`). Legal seller: Suthirth Solutions, operating as yellowgram |
| Support | Email hello@yellowgram.dev. English. No concierge. Boundary in `SUPPORT.md` |
| Contact site | https://www.yellowgram.dev |
| Delivery | Zip `seattruth-0.1.1.zip` is what Polar delivers. SHA-256 `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6`. Tag `v0.1.0` and `seattruth-0.1.0.zip` are the sealed prior distribution, not the current Polar delivery. Private repo `yellowgram/seattruth` is not granted by the Polar GitHub benefit |

The kit does not recommend end-customer refunds. Case 2 is provider status `canceled` only.

## Zip

### Polar delivery

| Item | Value |
| --- | --- |
| File | `release/seattruth-0.1.1.zip` |
| Tag | `v0.1.1` |
| SHA-256 | `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6` |
| Prefix inside the zip | `seattruth-0.1.1/` |
| Entry mtime | `2026-09-26T00:00:00Z` |
| Zip comment | `seattruth-0.1.1` |
| Build | `npm run pack:release` |
| On Polar | Attached. This is the file Polar delivers |
| On GitHub | Release `v0.1.1` asset |

### Prior distribution (sealed)

| Item | Value |
| --- | --- |
| File | `release/seattruth-0.1.0.zip` |
| Tag | `v0.1.0` |
| Prefix inside the zip | `seattruth-0.1.0/` |
| Zip comment | `seattruth-0.1.0` |
| On Polar | Not the current delivery |
| On GitHub | Release `v0.1.0` asset. Do not rewrite that tag |

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

The lowercase SHA-256 of `seattruth-0.1.1.zip` is `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6`. Both zips are listed in [CHECKSUMS.md](CHECKSUMS.md). GitHub Release `v0.1.1` carries `seattruth-0.1.1.zip`. Tag `v0.1.0` carries `seattruth-0.1.0.zip` as the sealed prior distribution.

## Ops record

Done:

1. This pack is on `main`.
2. GitHub Release `v0.1.0` exists. `seattruth-0.1.0.zip` is that release asset and is the sealed prior distribution. The SHA-256 lives in [CHECKSUMS.md](CHECKSUMS.md).
3. One SKU is listed under Polar org **Suthirth solutions** (dashboard name unchanged this week). Product ID `9aab6e67-3533-44d1-aa0b-bfdaf6dbc753`. Checkout is the founding **$79** one-time.
4. `seattruth-0.1.1.zip` is attached on that Polar product. SHA-256 `8014dae2e692a727999c7b2f88aad15912503f5062f870741027a7b8e7b654f6`.
5. Coupons and cold invoices are off. There is no coupon.
6. The **14-day** refund window is in the listing copy.

Still operator work:

1. After the first 10 organizations, raise this same SKU from **$79** to **$99**. That raise is still open. Do not rewrite buyer-facing copy to a live **$99** checkout before it happens. Do not create a second product. Do not add a coupon. Checklist: [SHIP_ATOMIC_PIN.md](SHIP_ATOMIC_PIN.md).
2. Leave the GitHub benefit off while sudo / mobile blocks it. That is a known ops limit. The zip buyers get from the listing is `seattruth-0.1.1.zip`. Tag `v0.1.0` stays sealed and is not rewritten.
3. Keep **14 days** in the listing copy. Polar has no per-product refund toggle to set.
4. Keep Checkout URLs out of the README, `BUYER_START_HERE`, and other buyer-facing files.

## Hard outs that stay closed

No auto-fix. No Chargebee. No Autumn. No coupons. No cold invoices. No writes to Stripe, Polar, or `is_pro`.

# What this will not catch

SeatTruth reports two disagreements. It is not a certificate that revenue and access match. You run this. yellowgram does not operate a hosted endpoint for this SKU. The kit is read-only. It does not auto-fix, write `is_pro`, or charge.

Rules: [MVP_SCOPE.md](MVP_SCOPE.md). A live proof, with boxes still open, is [LIVE_OPERATOR_LOOP.md](LIVE_OPERATOR_LOOP.md).

## Any active subscription counts as paid

Status `active` is paid. Price, product, and quantity are not filters (P29). An add-on counts. Quantity `0` on an `active` subscription still counts as paid. A price allow-list is not in this kit.

## An empty product relation can all-clear

`allClear` can be true when the mapped relation was read and returned no rows (P30). That read does not prove the view is the population you meant. Check the relation before you trust the first green live run.

## A Polar refund is not canceled

Case 2 is provider status `canceled` on every applicable rail, with `is_pro` true. A Polar refund returns money and does not end the subscription (P26). The kit does not read Polar order or refund objects. Stripe status `active` with any refund is ambiguous. It is not canceled, and it is not case 2.

## Dry-run and a skipped schedule are not an all-clear

`--dry-run` exits 0 and sets `allClear` false. That exit is not a pass. The daily schedule exits 0 without comparing when `SEATTRUTH_MAPPING_YAML` is unset. That skip is not an all-clear. A green dry-run check is not an entitlement pass (P30).

## Read-only, and not a hosted service

The kit does not charge, refund, open Checkout, write the product database, or auto-fix. There is no hosted compare endpoint in this purchase. Uptime of the job you run is yours. Email support at hello@yellowgram.dev is best-effort. There is no SLA.

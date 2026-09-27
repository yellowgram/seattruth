# Code review CR#3

Expert C, indie buyer and integrator. This is the third of three separate code reviews of implement pull request #5, at the head after CR#2 (`b1b453e`). It is not the 4th code review. It does not squash-merge, and it does not contact LaunchGate.

Reviewed for a wrong happy path, confusing docs, a false all-clear, mixed-rail surprises, P28 fixture gaps, and anything that would push a buyer to demand auto-fix or Soft-WTP. Deferred P2 items from CR#1 and CR#2 were re-checked. Only the ones that block a first live run were promoted.

## Findings fixed in this pass

### P1 — A missing mapping file and a database failure looked like a generic crash

The first `--live` without `mapping.yaml`, and a Postgres error, both became `compare_failed`. A buyer cannot tell "copy the example" from "the kit is broken," and the next email is a request to fix the row or the schema. A database error message can also carry a connection string. The old path dropped that message, but the code name did not say what failed.

**Fix.** A missing file or YAML that does not parse is `mapping_unreadable`. A database failure that is not already a coded mapping or product error is `product_query_failed`. The message text is not copied into the result.

### P1 — `export KEY=value` in `.env` was ignored

CR#2 deferred this. Under this lens it is a first-hour blocker: the key looks set, the run says the credential is missing, and the buyer pastes the key into email. Promoted and fixed. An `export ` prefix is accepted. A value already in the environment still wins. The value is not logged.

### P1 — A whole-number `numeric` seats column failed every live run

CR#2 accepted integer digit strings and deferred `3.00`. `pg` returns some `numeric` seats that way. The daily job then exits 1 before any finding. That is the same wrong happy path as the bigint case. Promoted. `"3.00"` is 3. `"3.50"` still fails. SQL `NULL` stays null. A boolean is still not a number.

### P1 — The local all-clear line read as a certification

P30 allows `allClear` when `deliberateSkipUsers` is above zero, and when the relation was read and was empty. The stdout line said only "all-clear" and "Slack was not posted." A buyer can treat that as proof the bill matches, then ask for a daily all-clear in Slack or for the kit to "just clear" the next drift.

**Fix.** The local line says deliberate skips can be included, an empty relation can finish this way, and it is not a certification. It is still not posted to Slack. It does not say to change `is_pro`.

### P1 — P28 mixed-rail edges were specified and not locked

The acceptance table said one finding per paid rail, and that zero subscriptions is not a cancel. The tests did not lock both rails paid, a single canceled rail, canceled with `is_pro` false, paid plus a customer id that has zero subscriptions, or canceled plus that same gap. A later edit could treat "no subscription" as canceled and raise case 2, or collapse two paid rails into one finding. Those are the surprises that produce "add a third case" and "just fix it."

**Fix.** Those rows are in the acceptance table and in `tests/rules.test.ts`. Behavior did not change: zero subscriptions stays ambiguous and blocks both cases; both paid rails each emit `paid_locked_out`; canceled with `is_pro` false is silence; a trial can sit inside an all-clear.

### P1 — The front door still hid what silence means

The README still said the detector was being designed. `BUYER_START_HERE.md` did not show a redacted finding, and it did not say that a match is quiet, that one canceled rail does not fire case 2 while another rail is paid, or that any active subscription counts (P29). A buyer who sees silence asks for auto-fix. A buyer who sees `paid_locked_out` on a $0 add-on asks for a price filter. Both are refused scope.

**Fix.** The README states the quiet cases and the P29 limit. The buyer page shows invented ids for a finding, an ambiguous count, and `mapping_unreadable`, and it says the lines do not name a change. The mapping example says names are case-sensitive and that an empty string does not disable a rail.

## Checked, no defect

- Dry-run text is `SeatTruth dry-run: detector is implemented. This is not an all-clear. No charges. No entitlement changes.` It exits 0, does not call the network, and matches the buyer page.
- Slack lines are the case id and the P6 fields, plus `ambiguous_users` and `run_error`. They do not say to change `is_pro`, and an all-clear is not posted.
- `deliberateSkipUsers` does not, by itself, force `allClear` false. `past_due`, a Stripe refund on `active`, and a non-boolean `is_pro` do.
- Case 2 remains status `canceled` only. Polar is not read for refunds.
- No charge, write, or auto-fix path was added.

## Deferred P2

Kept, with founder visibility. Not promoted. This pass does not build them, and it does not add a detect case.

- A credit note that never touches a charge (CR#1).
- A dispute that is not on the charge object we read (CR#1).
- A provider page that omits rows without repeating an id and still looks complete (CR#1).
- A database role that can write. This process still sends one `SELECT` (CR#1).
- Price, product, and quantity do not filter `active` (P29). Documented on the buyer page. A price allow-list stays out.
- A customer id that is not text is a run error. It is not coerced.
- Quoted identifiers stay case-sensitive. The example says so. The kit does not fold case.
- `engine-strict` is not set. Node 20 or newer is the documented engine. CI uses Node 20.
- A user id with no `@` and no key shape is still posted. Map a non-email user id.
- The daily cron runs on the default branch after merge, not on this pull request.
- No zip, no SHA-256, no `POLAR_DELIVERABLES`. The Polar listing stays dark.

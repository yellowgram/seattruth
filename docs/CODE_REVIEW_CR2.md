# Code review CR#2

Expert B, operator safety and maintainer DX. This is the second of three separate code reviews of implement pull request #5, at the head after CR#1 (`44752b8`). It is not CR#3. It does not squash-merge, and it does not contact LaunchGate.

Reviewed for secret handling, dry-run versus live, the GitHub Action, error text, mapping footguns, and docs that describe live behavior. CR#1 deferred items were re-checked under this lens.

## Findings fixed in this pass

### P1 — An unknown flag fell through to dry-run and exited 0

`seattruth --liv` was not `--live`, so the CLI took the default dry-run, printed the local notice, and exited 0. An operator, or a workflow typo, can read that as a finished compare. Printing the rejected argument would also echo a key if someone passed one on the command line.

**Fix.** Any argument other than `--live`, `--dry-run`, `--help`, or `-h` exits 1 with `unknown_argument` and does not open the network. The argument text is not logged.

### P1 — Live docs still described the scaffold

`BUYER_START_HERE.md` said the detector was something you would need later, and that the scheduled workflow did not have secrets. The README said exit 0 is an all-clear without saying that is the live code only. `MVP_SCOPE.md` still said `dry_run: false` fails before the CLI, that the workflow does not declare secrets, and that `--live` still refuses with the scaffold exit. The active rule is the opposite: the daily cron is live, dispatch stays dry unless `dry_run` is false, and live exit 0 is the only all-clear.

**Fix.** Those pages now describe the implemented live path. Dry-run exit 0 stays "not an all-clear."

### P1 — Redirects could carry the Slack body, and provider GETs followed redirects

`fetch` follows redirects by default. A 307 or 308 from `hooks.slack.com` would resend the finding text, including customer ids, to the next URL. Provider GETs sent the bearer token on the first hop and would follow a redirect. Slack errors used `startsWith("slack_")`, so a message that began with that prefix and then included a URL would have been printed (P23).

**Fix.** Slack accepts only `https://hooks.slack.com/…` with no username or password, posts to that host, and sets `redirect: "error"`. Provider GETs set `redirect: "error"`. Log lines are printed only when the whole message is a fixed code. A fetch failure becomes `slack_http_0` and does not include the webhook.

### P1 — An email-shaped id was posted to Slack

CR#1 deferred this: the mapped user id is copied as-is, so an email column reaches Slack (P6, P23). Under this lens that is a P1. The same hole fits a database URL or an `rk_` / `sk_` value that landed in a mapped column or an error string.

**Fix.** A finding or error line that contains `@`, a postgres URL, `rk_`, `sk_`, `hooks.slack.com`, or `Bearer` is omitted. The alert adds `run_error=slack_field_refused` and still includes the other lines. The omitted value is not printed.

### P1 — A padded customer id did not join

CR#1 made a blank id "does not apply." A `character(n)` column comes back space-padded. That value is not blank, so the rail applied, matched no Stripe or Polar id, and became ambiguous. Every such user blocked `paid_locked_out` and the daily job never went all-clear.

**Fix.** Product customer ids are trimmed. A value that is empty after trim still does not apply.

### P1 — A bigint seats column failed the whole run

CR#1 deferred this. `pg` returns `bigint` as a digit string, and `normalizeSeats` rejected every string. A normal seats column then made every live run exit 1 with `seats_not_numeric` before any finding. That is a support-load failure, not a new detect case. SQL `NULL` is still null, and a boolean is still not a number (P11, P20).

**Fix.** A string of digits, optional leading minus, is accepted when `Number` is a safe integer. `"0"` is 0. `"3.00"`, `"1e2"`, and `true` still fail the run.

### P1 — `.env.example` omitted a live Stripe read

After CR#1 the client calls `GET /v1/charges/{id}` when an invoice leaves `charge` as an id. The example listed Subscriptions and Invoices and said Charges Read, but the "reads used" list did not name that GET. An operator who scoped the key from the list alone would get `stripe_http_403` on the refund check.

**Fix.** The example lists `GET /v1/charges/{id}` next to the other reads. The dashboard line stays Subscriptions Read, Invoices Read, Charges Read. Polar remains `subscriptions:read` only.

## Checked, no defect

- `compare.yml` uses the typed `inputs.dry_run` boolean. Dispatch defaults to dry-run. `dry_run: false` is the live dispatch path. The schedule does not take that input and runs live. The dry-run step has no secret environment. Live steps fail if `SEATTRUTH_MAPPING_YAML` is empty. Secret values are not in the file. `permissions` is `contents: read`. The job does not run on pull requests.
- Live exit codes match P30: `liveExitCode(true, [])` is 0, findings or ambiguous users are 2, any error is 1. Slack delivery failure returns 1. Dry-run returns 0 with `allClear` false.
- P18 still quotes identifiers only after the grammar check. P21 still rejects an empty-string rail. P22 still rejects zero rails. The product statement still refuses `;` and write keywords.
- `sk_` is refused before a request. Dry-run does not call `fetch`. The only POST is the Slack webhook.
- CI (`ci.yml`) runs `npm test` and does not receive provider, database, or Slack secrets.

## Deferred P2

These stay visible for the founder and for CR#3. This pass does not build them. No zip, SHA-256, or `POLAR_DELIVERABLES` file is added.

- A credit note that never touches a charge stays outside the charge recipe (CR#1).
- A dispute that is not on the charge object we read is not a separate dispute API (CR#1).
- A provider that omits rows without repeating an id, while reporting a complete page, cannot be detected (CR#1).
- A database URL whose role can write is the operator's credential. This process still sends one `SELECT` (CR#1).
- Price, product, and quantity still do not filter `active` (P29).
- A `numeric` seats value with a scale, such as `3.00`, still fails with `seats_not_numeric`. Integer and bigint digit strings are accepted.
- A customer id that is not text is a run error. It is not coerced.
- A line `export KEY=value` in `.env` is ignored. The live run then fails with a missing credential instead of reading the key.
- Quoted identifiers are case-sensitive. `UserId` does not match a column created as `userid`.
- `package.json` says `node: ">=20"` and CI uses Node 20. npm is not set to `engine-strict`, so an older Node can still install.
- A mapped user id with no `@` and no key shape is still posted. A name or a card number in that column is not detected. Map a non-email user id.
- The daily cron runs from the default branch after merge. It does not run on this pull request.
- Zip readiness, documented only: version `0.0.0`, private package, no zip, no SHA-256, no `POLAR_DELIVERABLES`. A later zip has to exclude `.env`, `mapping.yaml`, `node_modules`, and `dist`. Those names are already gitignored. The Polar listing stays dark.

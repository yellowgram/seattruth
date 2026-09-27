# Competitive skim

**DR#1 skim, carried into DR#2 and DR#3 unchanged.** Public pages only, fetched **2026-09-26**. No sales calls. DR#2 and DR#3 did not re-fetch these homepages and did not add prices, customer counts, or accuracy figures. The Polar entitlement gap below is still only as good as that date. Polar's own subscription status enum was read on the same date for the status map in [MVP_SCOPE.md](MVP_SCOPE.md). DR#3 also read Polar's refund doc for rule P26. That is Polar's API, not a competitor shipping this reconcile. RevReclaim's Polar support remains a different product.

ARR, logos, accuracy rates, and customer counts are omitted. Where a page was down or two pages disagree, that disagreement stays in the text. Prices below are the figures those pages published. They are not a live quote from yellowgram, and they are not a currency conversion.

SeatTruth, for comparison, is the product stated in [MVP_SCOPE.md](MVP_SCOPE.md): Stripe and Polar, read-only, against product `is_pro` and seats, restricted keys, one mapping file, cron or GitHub Actions, Slack, **$99 once** per organization (optional first 10 at **$79 once**), no auto-fix. That price moved from a monthly $49–99 band to one-time. The competitor prices below are the 2026-09-26 skim and are unchanged.

## Takeaway

The public gap for a **Polar ↔ product-database entitlement reconciler** is open among the named peers.

| Tool | Billing rails on public pages | Reconciles app entitlements? | Auto-fix on public pages? | Public price | Polar ↔ product DB gap |
| --- | --- | --- | --- | --- | --- |
| DriftExact | Stripe | Yes | No | £399–£1,500+/mo by volume | Open. No Polar mention. |
| ProdVerdict | Stripe + Paddle | Yes (Access contract) | No write-back described. MCP lists `suggest_fix`. | Free CLI / GitHub Action; Pro Cloud ~$39/project/mo in the changelog. Site paused. | Open. No Polar mention. |
| Venwai | Stripe | Yes | No | Free beta, then $29/mo up to 500 subscriptions | Open. No Polar mention. |
| EntitleGuard | Stripe | Yes | No | Free CSV audit; monitoring beta $79/mo | Open. No Polar mention. |
| RevReclaim | Stripe + Polar + Paddle | No. Billing-platform leak scan. | Paid plans market auto-fix | Free; Pro $29 or $49 (pages disagree); Team $79 | Polar is present. Different product. |

SeatTruth's public wedge is **$99 once** per organization (optional first 10 at **$79 once**), **Stripe and Polar**, and **no auto-fix**. It moved from a monthly $49–99 band to that one-time price. DriftExact, ProdVerdict, Venwai, and EntitleGuard do not show a Polar entitlement reconcile. RevReclaim does show Polar, for in-billing leak hygiene, and it markets auto-fix.

## DriftExact

Closest **mid-market** peer. Read-only. No auto-fix. Published **£399–£1,500+/mo**. Stated best fit around **500+** active Stripe subscriptions.

**Sources:** [driftexact.com](https://driftexact.com/), [How it works](https://driftexact.com/how-it-works), [Pricing](https://driftexact.com/pricing), [Entitlement reconciliation](https://driftexact.com/stripe-entitlement-reconciliation), [Access reconciliation](https://driftexact.com/stripe-access-reconciliation), [Webhook failure reconciliation](https://driftexact.com/stripe-webhook-failure-reconciliation), [Contact](https://driftexact.com/contact)

**What the pages say they detect**

- Paid in Stripe, access missing.
- Cancelled or refunded, still active in the product.
- Broader Stripe billing versus internal entitlement, seat, or license disagreement.
- Drift after webhook failure, retry, or partial write. The check is final state. The pages do not describe a webhook proxy.

**Rails and access**

- Stripe, with a restricted read-only key.
- Internal access by CSV and/or an optional self-hosted read-only data agent.
- Polar is not mentioned on the pages above. Treat Polar as absent from the public surface. A private Polar plan would be unknown.

**Auto-fix.** The homepage says "No write access. No automated fixes." Reports are for operator review.

**Price, from the pricing page on the fetch date.** Amounts are GBP, by active Stripe subscription count. The page also says final pricing depends on monitoring scope and alerting.

| On-Demand Integrity | Price |
| --- | --- |
| Up to 500 | £399/mo |
| 501–2,500 | £599/mo |
| 2,501–5,000 | £799/mo |
| Above 5,000 | Not available |

| Continuous Monitoring | Price |
| --- | --- |
| Up to 5,000 | £900/mo |
| 5,001–15,000 | £1,500/mo |
| 15,000+ | Contact us |

No open self-serve trial. Access follows qualification. Continuous Monitoring, as described there, adds scheduled checks, email, threshold alerts, and the self-hosted agent. Those pages do not describe Slack.

**ICP.** SaaS where Stripe billing and product access are separate systems. Homepage best fit: teams managing 500+ active Stripe subscriptions. Seats, licenses, and custom entitlement flags. Finance and engineering as a shared control layer. Operated by Clearpoint Systems. Founder named on the about copy: Levi Benjamin. That byline is not a relationship with yellowgram.

**Launch posts.** No Hacker News or Product Hunt launch page turned up under these names in this skim. Absence here is not proof none exists.

SeatTruth does not try to be a cheaper DriftExact for that 500+ finance ICP. That buyer is kill criterion 2 in [MVP_SCOPE.md](MVP_SCOPE.md).

## ProdVerdict

Closest **indie** peer on shape: an Access contract, GitHub Actions, Slack, restricted keys, a database mapping, and no write-back described. Pro Cloud is about **$39/project/mo** in their own changelog. [prodverdict.com](https://prodverdict.com/) returned Vercel `DEPLOYMENT_PAUSED` / HTTP 503 during this skim, so the live pricing page was not re-checked.

**Sources:** [GitHub README](https://github.com/prodv-dev/prodverdict-sdk), [npm `prodverdict`](https://www.npmjs.com/package/prodverdict), [@prodverdict/mcp](https://npm.io/package/@prodverdict/mcp), [DEV: billing drift setup](https://dev.to/mattbaconz/tell-your-ai-to-set-up-billing-drift-detection-ag6), [DEV: CI green, billing broken](https://dev.to/mattbaconz/your-ci-is-green-your-billing-logic-is-broken-4j6j), [DEV: agent shipped a billing bug](https://dev.to/mattbaconz/your-ai-agent-shipped-a-billing-bug-prodverdict-blocks-it-in-ci-2gpc), [Product Hunt tracker](https://www.hunted.space/dashboard/prodverdict)

**Access contract, from the README**

| Check | Their words |
| --- | --- |
| Revenue leak | Active Stripe or Paddle subscription, app paid-access flag false |
| Wrongful access | Cancelled or unpaid, paid access still on |
| Plan drift | Database plan does not match the price mapping |
| Duplicate customer | Same billing customer id on multiple users |
| Orphan customer | Active billing customer, no app user |

Plan drift, duplicates, and orphans are outside SeatTruth's two cases on purpose. The README also describes an `entitlements-migration` check and an Access mode with `source_of_truth: stripe_entitlements`. Other contracts (config, migration, boundary, webhook lint, restore) are in the same repo. SeatTruth does not ship that suite.

**Rails and delivery**

- Stripe restricted key. The README's scheduled-setup note names read access on customers and subscriptions.
- Paddle, via `PADDLE_API_KEY` and example stacks.
- Postgres, read-only `DATABASE_URL`.
- CLI, GitHub Action, local MCP. Scheduled Action with Slack on failure. Access is described as a production schedule, not a pull-request gate.
- Polar is not in the fetched README, and the skim found no Polar stack template. That is the gap. It is not evidence about an unannounced plan.

**Auto-fix.** Public materials describe a failed check, not an entitlement write-back. The README lists an MCP tool named `suggest_fix`. A DEV post shows sample output that tells the reader to set a paid-access flag. This skim does not claim ProdVerdict writes the buyer's database. SeatTruth rule P10 still refuses that kind of instruction.

**Price, as far as the pages go**

- Free CLI, GitHub Action, fixtures, and local MCP, in the README and the Product Hunt tracker copy.
- Pro Cloud **$39/project/mo**, from the v0.11.0 changelog line: "Free + Pro Cloud $39/project/mo."
- The site that would confirm the live price returned 503. Do not treat $39 as a price re-verified on a pricing page that day.
- DEV posts disagree about the free tier. One said private repos were a Pro feature. A later one said the CLI and GitHub Action are free on private repos. Which sentence matches the paused site is unknown.

**ICP.** Indie and AI-assisted SaaS (Next.js, Supabase, Rails, with Stripe or Paddle and Postgres), on a scheduled production check. The npm page named in the sources listed package `prodverdict` at **0.14.1**, maintainer signal **mattbaconz**. That version is a registry label on the skim date, not a usage statistic.

**Launch posts.** The Product Hunt tracker at the source above reported a launch around 2026-06-07, about 3 upvotes, and a #160 daily place. Those figures are what that tracker page showed. They are not a yellowgram score. No Hacker News "Show HN" turned up in this skim.

If the $39 changelog figure is still the offer, ProdVerdict is under SeatTruth's band for a Stripe and Paddle access check. SeatTruth does not claim to be the cheap option against ProdVerdict. The difference on offer is Polar, a narrower pair of cases, and no fix advice.

## Venwai

Indie Stripe-only monitor. Public pages do not mention Polar.

**Source:** [venwai.com](https://venwai.com/)

| Public claim | What the page says |
| --- | --- |
| Detect | Stripe versus app-reported access. "Ghost": canceled, access remains. "Angry": paid, locked out. |
| Integration | Read-only Stripe key, plus a customer GET endpoint that lists who has access. No direct database connection described. |
| Cadence | Daily. Alert only after the finding appears on two consecutive checks. |
| Auto-fix | Does not write Stripe or the app database. |
| Alerts | Slack, Discord, Telegram, email. |
| Price | Free during beta. After beta, $29/mo, up to 500 tracked subscriptions. |
| ICP | About 10–500 subscriptions. Small teams that rolled their own billing. |

## EntitleGuard

Stripe CSV audit, plus a monitoring beta. Public pages do not mention Polar.

**Sources:** [entitleguard.amertech.online](https://entitleguard.amertech.online/), [GitHub impara/EntitleGuard](https://github.com/impara/EntitleGuard), [DEV post](https://dev.to/amer_tech/stripe-webhooks-can-work-and-your-app-access-can-still-be-wrong-332d)

| Public claim | What the pages say |
| --- | --- |
| Detect | Unpaid but active, paid but blocked, missing billing link, orphaned Stripe subscription, ambiguous matches. Optional manual overrides. |
| Integration | Free path: browser-only Stripe export CSV plus an app entitlement CSV. Monitoring: a customer-owned HTTPS source adapter, described as pseudonymous. |
| Auto-fix | Flag only. No automatic grant or revoke. |
| Alerts | Email-first in the beta. The landing page says this beta has no Slack. |
| Price | Free local audit. Monitoring beta $79/month. |
| ICP | Usage-heavy B2B SaaS that keeps entitlement state locally. The pages set aside apps that ask Stripe on every request. |

Venwai at $29/mo and EntitleGuard monitoring at $79/mo bracket the monthly $49–99 band SeatTruth has left. SeatTruth is now **$99 once** (first 10 at **$79 once**). Neither shows Polar.

## RevReclaim

Polar is on the public pages. The job is different: billing-platform leak hygiene, and paid plans market auto-fix.

**Sources:** [revreclaim.com](https://revreclaim.com/), [About](https://revreclaim.com/about)

| Public claim | What the pages say |
| --- | --- |
| Detect | Ten billing-platform leak types, including expired coupons, legacy pricing, ghost subscriptions inside the billing platform, and failed payments. |
| Rails | Stripe, Polar, and Paddle. |
| App database | Not positioned as a reconcile of product `is_pro` or seats. |
| Auto-fix | Paid plans market auto-fix and a Recovery Agent. |
| Price | Free scan. The About page listed Pro at $29/mo and Team at $79/mo. A homepage pricing block in this skim showed Pro at $49/month. Which figure is current is unverified. |

RevReclaim is evidence that indie tools already call the Polar API. It is not an access-contract competitor. Buyers can confuse a billing-leak scan with entitlement drift. SeatTruth's copy has to keep those jobs apart. Shipping auto-fix to "match" RevReclaim is a hard out.

## Named non-matches

- [OfferGuard](https://offerguard.app/pricing) is Shopify promo and loyalty abuse. It is not Stripe entitlement drift.
- Generic "drift detector" launches are code or product drift, not billing access.
- Stripe Entitlements and Polar Customer State are platform primitives. They are not a third-party dual-rail monitor.

## Side by side

| | SeatTruth (stated) | DriftExact | ProdVerdict | Venwai | EntitleGuard |
| --- | --- | --- | --- | --- | --- |
| Stripe + Polar | Yes | Stripe | Stripe + Paddle | Stripe | Stripe |
| Product access | `is_pro` and seats in the product database | CSV or self-hosted agent | Postgres | Customer access endpoint | CSV or adapter |
| Read-only | Yes | Yes | Yes | Yes | Yes |
| Auto-fix | No | No | No write-back described | No | No |
| Schedule | Daily GitHub Action (scaffold is dry-run) | Scheduled on Continuous | GitHub Action, hourly or daily | Daily hosted | Nightly scheduler |
| Alert | Slack | Email on Continuous. Slack not described. | Slack | Slack, Discord, Telegram, email | Email in the beta. Landing page says no Slack. |
| Price | $99 once (first 10 at $79 once). Moved from $49–99/mo. Not for sale in this repo | £399–£1,500+/mo | Free, and Pro ~$39/project/mo in the changelog | Free beta, then $29/mo | Free audit, monitoring $79/mo |
| How you buy | Self-serve once a zip exists. No checkout now. | Qualification | Self-serve CLI | Self-serve beta | Free audit. Monitoring beta is an application. |

## Unknowns

1. ProdVerdict's live pricing page was paused. Pro at $39 is the changelog figure only.
2. DriftExact's GBP prices are not converted to dollars here. Any unpublished Polar interest is unknown.
3. ARR, customer counts, and logos were not on these pages. None are filled in.
4. RevReclaim Pro at $29 versus $49 is a conflict between public pages.
5. Hacker News posts for DriftExact, Venwai, and EntitleGuard were not found. They may exist under other titles.
6. A competitor could ship Polar without putting it on the pages read here. For DriftExact, ProdVerdict, Venwai, and EntitleGuard, the public docs reviewed do not show it.
7. Seat quantity math, refund edge cases, and multi-workspace behavior were not compared. That is outside this skim.
8. The Product Hunt upvote count above is one tracker page on one date. It is not a market-size claim.

## What would change the wedge

If DriftExact, ProdVerdict, Venwai, or EntitleGuard ships a maintained Polar read against a product database, at a self-serve price near SeatTruth's locked **$99 once**, kill criterion 5 in [MVP_SCOPE.md](MVP_SCOPE.md) applies. RevReclaim already naming Polar for billing-leak scans does not trip that criterion. The response is to reconsider the wedge, not to add an audit practice or an auto-fix.

## Source index

- https://driftexact.com/
- https://driftexact.com/pricing
- https://driftexact.com/how-it-works
- https://driftexact.com/stripe-entitlement-reconciliation
- https://driftexact.com/stripe-access-reconciliation
- https://driftexact.com/stripe-webhook-failure-reconciliation
- https://driftexact.com/contact
- https://github.com/prodv-dev/prodverdict-sdk
- https://www.npmjs.com/package/prodverdict
- https://npm.io/package/@prodverdict/mcp
- https://prodverdict.com/ (paused at skim)
- https://dev.to/mattbaconz/tell-your-ai-to-set-up-billing-drift-detection-ag6
- https://dev.to/mattbaconz/your-ci-is-green-your-billing-logic-is-broken-4j6j
- https://dev.to/mattbaconz/your-ai-agent-shipped-a-billing-bug-prodverdict-blocks-it-in-ci-2gpc
- https://www.hunted.space/dashboard/prodverdict
- https://venwai.com/
- https://entitleguard.amertech.online/
- https://github.com/impara/EntitleGuard
- https://dev.to/amer_tech/stripe-webhooks-can-work-and-your-app-access-can-still-be-wrong-332d
- https://revreclaim.com/
- https://revreclaim.com/about
- https://offerguard.app/pricing

# Competitive skim

**DR#1.** Public material only. Fetched **2026-09-26**. This skim is part of the design-pack seed. It is not DR#2 or DR#3. No customer counts, no accuracy rates, no revenue, and no "they win or lose" scores. Where a page was down or two sources disagree, that is written as unknown.

SeatTruth's intended wedge, repeated so this file has a point: a Polar read connector beside Stripe, two detect cases, no fix advice, self-serve in the $49–99 band. That wedge is a statement about SeatTruth. The notes below are what the other public pages actually say.

## DriftExact

**Site:** https://driftexact.com/  
**Pricing:** https://driftexact.com/pricing  
**How it describes itself:** read-only comparison of Stripe billing with the access the product grants. Homepage line: "Read-only. Deterministic. No write access. No automated fixes."

**Operator named on the homepage:** Clearpoint Systems. Founded by Levi Benjamin. That is a byline on their about block, not a relationship with yellowgram.

**Claims, from the homepage and the pricing page on the fetch date:**

- Detects paid customers without access, and canceled or refunded customers who still have access. The homepage also has a broader bucket, "billing and access no longer agree."
- Stripe is the billing system in the copy. The pricing page is denominated in active Stripe subscriptions.
- Restricted read-only Stripe key. Internal data by CSV or an optional self-hosted read-only agent.
- No writes, no billing changes, no automated entitlement changes.
- Best fit, homepage: "SaaS teams managing 500+ active Stripe subscriptions."
- Access after a qualification step. Pricing page: "No open self-serve trial is offered."

**Pricing published on https://driftexact.com/pricing on the fetch date.** Fixed monthly amounts in GBP, by active Stripe subscription volume. Their page says final pricing also depends on monitoring scope and alerting.

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

Continuous Monitoring, as described there, adds scheduled checks, email notifications, threshold alerts, and the self-hosted agent. The fetched pages do not describe Slack, and they do not mention Polar.

**Gap relative to SeatTruth:** no Polar connector in the pages above. The commercial motion is qualification and a price far above $49–99. SeatTruth does not try to be a cheaper DriftExact for 500+ subscription finance teams. That buyer is a kill criterion in [MVP_SCOPE.md](MVP_SCOPE.md).

## ProdVerdict

**Repository:** https://github.com/prodv-dev/prodverdict-sdk  
**README fetched:** https://raw.githubusercontent.com/prodv-dev/prodverdict-sdk/main/README.md on 2026-09-26  
**Website:** https://prodverdict.com/ returned Vercel `DEPLOYMENT_PAUSED` / HTTP 503 on the same date. The marketing site was not usable. Pricing below is from the README, not from a live pricing page.

**How the README describes it:** checks whether Stripe or Paddle and the app database agree on who paid. Deterministic rules. "No LLM in the evaluation path." Missing credentials fail the check.

**Access-contract claims in that README:**

| Check | Their words |
| --- | --- |
| Revenue leak | Active subscription, paid-access flag false |
| Wrongful access | Cancelled or unpaid subscription, paid access still on |
| Plan drift | Database plan does not match the price mapping |
| Duplicate customer | Same billing id on multiple users |
| Orphan customer | Active billing customer with no app user |

Those last three are outside SeatTruth's two cases on purpose.

The same README describes a scheduled GitHub Action for the access check, with Slack on failure, and says access drift is a production schedule rather than a pull-request gate. It also documents other contracts (config, migration, boundary, webhook, restore, entitlements migration). SeatTruth does not ship that suite.

**Processors named:** Stripe and Paddle. The fetched README does not mention Polar.

**Polar gap:** that absence is the public gap SeatTruth is aimed at. It is not evidence about an unannounced plan.

**Pricing, as far as it can be stated honestly:**

- The README's v0.11.0 note says pricing docs were reconciled with a two-tier site: "Free + Pro Cloud $39/project/mo."
- The live site that would confirm that sentence was paused on the fetch date.
- A DEV Community post by mattbaconz, "Your AI agent shipped a billing bug" (https://dev.to/mattbaconz/your-ai-agent-shipped-a-billing-bug-prodverdict-blocks-it-in-ci-2gpc), also said Pro was $39/project/mo and described private repos as a Pro feature.
- A later DEV post by the same author, "Tell your AI to set up billing drift detection" (https://dev.to/mattbaconz/tell-your-ai-to-set-up-billing-drift-detection-ag6), says "Free CLI + GitHub Action on private repos." That does not match the earlier private-repo claim.

Until a pricing page loads, the durable statement is: their own README has published a **$39 per project per month** Pro Cloud figure, and public posts disagree about what is free. SeatTruth does not treat $39 as a verified live price.

**Fix hints:** the README lists an MCP tool named `suggest_fix`. An older DEV post shows sample output with a line telling the reader to set a paid-access flag. This skim does not claim ProdVerdict writes to the buyer's database. It does record that their public materials include fix advice. SeatTruth's rule P10 is the opposite choice: name the disagreement, do not prescribe the write.

**Price overlap:** if the $39 figure is still the offer, ProdVerdict is inside or under SeatTruth's band for a Stripe (and Paddle) access check. SeatTruth does not claim to be the cheap option against ProdVerdict. The difference on offer here is Polar, a narrower pair of cases, and no fix advice.

## What this skim refuses to say

- Any number of customers, GitHub stars, uptime, false-positive rate, or dollars found.
- That either company will or will not add Polar.
- That DriftExact's qualification process is slow or fast. Their page says access follows qualification. Duration is unknown.
- That ProdVerdict's paused website means the product is abandoned. It means the site returned 503 on one date.
- A feature comparison grid scored with checkmarks for things their docs do not mention.

## What would change SeatTruth's wedge

If either public source grows a maintained Polar read path at a self-serve price near this band, kill criterion 5 in [MVP_SCOPE.md](MVP_SCOPE.md) applies. The response is to reconsider, not to grow an audit practice.

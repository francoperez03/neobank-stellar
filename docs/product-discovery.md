# PHOTON · Product Discovery

> Framework: Marty Cagan's product discovery (Inspired / Empowered). Fall in love with the problem, then validate that the solution is valuable, usable, feasible, and viable before scaling delivery.

---

## What PHOTON is

PHOTON is a neobank built on Stellar. People deposit money, hold it, withdraw it, and pay with it, the same things a checking account is for. The balance lives on-chain as USDC on Stellar, so it settles in seconds for a fraction of a cent, and PHOTON never charges a fee for keeping your money. Fiat moves in and out through Stellar anchors. The standout capability is paying the **machine economy**: an account can pay AI agents and APIs autonomously over two open machine-payment standards, **MPP** (co-created by Stripe and Tempo) and **x402** (the open HTTP 402 standard).

The one-sentence pitch: **a bank account that costs nothing to hold, settles in seconds, and pays anything that takes money.**

---

## The problem

Traditional bank accounts charge people to keep their own money.

- **Maintenance fees.** A recurring monthly charge for an account that mostly just sits there. The bank earns whether or not the customer transacts.
- **Minimum-balance traps.** Fall below a threshold and penalties begin, so the customer's own liquidity is held hostage by fine print.
- **Slow, costly movement.** Transfers take days, clear inside cut-off windows, and pass through intermediaries that each take a cut of money that should move instantly.

None of these costs make the money safer. They are a tax on holding a balance, and they fall hardest on people who keep modest balances, where a flat monthly fee is a large percentage of what they hold.

Meanwhile, the way money needs to move has changed. People pay subscriptions, marketplaces, and increasingly software agents that buy compute, data, and services by the second. The rails a 1970s checking account was built on were never designed for that.

## The customer

The earliest, sharpest fit is the **digitally-native saver and earner who already touches stablecoins or dollar-denominated digital money** and resents paying to hold it:

- Freelancers and remote workers paid across borders who lose margin to fees and FX on every cycle.
- People in high-inflation economies who want to hold dollars without a US bank and without account upkeep.
- Builders and small teams whose products or agents need to **pay for APIs and machine services** programmatically, where x402 and MPP are a capability no legacy bank offers.

What unites them: they hold value in dollars, they move it often, and every fee on a balance or a transfer is friction they can feel.

## Value proposition

| For a customer who… | PHOTON delivers… | Instead of… |
|---|---|---|
| Keeps a balance | $0 account maintenance, no minimums | $5 to $25 a month plus penalty traps |
| Moves money | Settlement in seconds, fractions of a cent | 1 to 3 business days, per-transfer fees |
| Pays software and services | Native MPP and x402 machine-payment rails | No machine-payment path at all |
| Wants control | Self-custodial balance in USDC on Stellar | Funds recorded on the bank's own ledger |

---

## The four product risks

Cagan's discipline: name the risk, then design the cheapest test that could prove the idea wrong before committing engineering.

### 1. Value risk: *will customers use it?*

**Assessment: the central risk.** "No maintenance fee" is attractive, yet customers already tolerate bank fees, and switching a primary account carries inertia. The wedge is unlikely to be "save $10/month"; it is more likely the **money-movement** jobs legacy banks cannot do (instant cross-border settlement, paying agents/APIs).

Cheap tests before scaling:
- Smoke-test landing page (this repo) measuring intent to open an account and whether the machine-payment angle (MPP / x402) or the no-fee angle draws the most clicks.
- 5 to 8 problem interviews per segment: "Walk me through the last time a bank fee or a slow transfer cost you." Listen for intensity, not approval.
- Fake-door on each rail to see where real demand concentrates.

**Open question to answer first:** is the primary hook "stop paying to hold money" or "move money in ways a bank can't"? The copy and roadmap should follow whichever the evidence supports.

### 2. Usability risk: *can they figure it out?*

**Assessment: high, and specific to crypto rails.** Self-custody, stablecoins, and on-chain settlement carry real cognitive load. The product wins only if deposit, withdraw, and pay feel like a normal banking app, with the Stellar machinery invisible.

Tests: prototype the three core flows and watch 5 users complete a deposit and a payment unaided; measure where the wallet/custody model confuses them; Wizard-of-Oz the on-ramp before automating it.

### 3. Feasibility risk: *can we build it?*

**Assessment: moderate, well-scoped.** The pieces are proven: USDC as a Stellar Asset (SAC), Stellar settlement, wallet integration (Freighter / Stellar Wallets Kit), and the MPP and x402 machine-payment standards. Fiat on/off-ramp runs through Stellar anchors (SEP-24/6). The hard parts are the **compliance-bearing edges** (fiat in/out, KYC) and making custody safe for non-technical users. See [stellar-build.md](./stellar-build.md) for the technical build path.

### 4. Viability risk: *should we build it?*

**Assessment: high, and mostly regulatory.** A product that holds customer funds and moves fiat lives squarely in money-transmission and KYC/AML territory; "self-custodial" narrows but does not erase that. The business-model question is also live: with $0 maintenance fees, revenue must come from elsewhere (interchange, FX spread, yield on reserves, premium tiers, or per-rail fees on outbound payments). Viability work: compliance review per launch market, and a revenue model that survives the no-fee promise.

---

## Discovery summary

| Risk | Level | First mitigation |
|---|---|---|
| Value | High | Landing smoke test + segment interviews; confirm the real hook |
| Usability | High | Prototype-test the 3 core flows; hide the chain |
| Feasibility | Moderate | Technical spike on USDC SAC + wallet + x402 (see stellar-build.md) |
| Viability | High | Compliance review per market; define no-fee revenue model |

**Recommendation:** continue discovery on **value and viability in parallel** before heavy delivery. The landing in this repo is the first value experiment; the most valuable thing to learn next is whether customers come for the absence of fees or for the payment rails legacy banks lack, and whether a no-fee account can be made compliant and profitable in a first target market.

**Success metrics to define before building:** account-open conversion from the landing, deposit completion rate, week-4 balance retention, and share of users who use at least one outbound machine-payment rail (MPP / x402).

# PHOTON · Stellar Build Guide

> Technical build path for PHOTON, a neobank whose balance is held as **USDC on Stellar**. This is a design document, not implementation. It maps the deposit / withdraw / pay product surface onto Stellar primitives and names the SEPs, contracts, and rails involved. Stellar facts that move (protocol support, SEP status, SDK APIs, RPC endpoints) should be verified against the official docs before they are treated as current.

---

## 1. Architecture at a glance

```
                       ┌─────────────────────────────┐
   Fiat in/out         │          PHOTON app          │   Machine payments
  (cards, banks)       │  apps/web  (Vite + React)    │   out (agents, APIs)
        │              │  + signing / wallet layer    │          │
        ▼              └──────────────┬──────────────┘          │
   ┌──────────────┐                   │                          │
   │  SEP anchor  │  KYC, fiat rails  │ build + sign + submit     │
   │ (SEP-24/6/31)│ ───────────────►  ▼                           ▼
   └──────────────┘            ┌────────────────┐    ┌──────────────────┐
                               │  Stellar RPC   │◄──►│  Stellar network  │
                               │ (submit, read) │    │  USDC (SAC) ledger│
                               └────────────────┘    └──────────────────┘
                                        ▲
                                        │
                       MPP (Stripe + Tempo) · x402 (HTTP 402)
                       open machine-payment standards, settled in USDC
```

Core idea: the customer's money is a **USDC balance on Stellar**. Everything PHOTON does is either (a) moving fiat across the Stellar boundary, or (b) moving that USDC balance over a settlement rail.

### Default stack (per the stellar-dev playbook)

| Layer | Choice |
|---|---|
| Asset | **USDC as a Stellar Asset** (classic issuance + trustline), exposed to Soroban via its **SAC** |
| Client SDK | `@stellar/stellar-sdk` (browser + Node) |
| Network access | **Stellar RPC** first; Horizon only for legacy/historical queries |
| Wallet | **Freighter** primary; **Stellar Wallets Kit** for multi-wallet; smart accounts + passkeys for mainstream UX |
| Custom logic | Soroban (Rust) only where a contract is genuinely needed; prefer native asset operations |
| Testing | Quickstart Docker (local) and Testnet + Friendbot |

---

## 2. The balance: USDC as a Stellar Asset + SAC

PHOTON does not mint its own token. It uses **USDC**, a circulating Stellar Asset (issuer + asset code), for three reasons: it is dollar-denominated, it is backed and redeemable, and it already has ecosystem support (wallets, anchors, exchanges).

- **Classic layer.** A USDC balance requires a **trustline** from the holder's account to the USDC issuer. Account creation and trustline setup are part of onboarding (and a place where account sponsorship / sponsored reserves keep the user from needing XLM up front).
- **SAC bridge.** The **Stellar Asset Contract** exposes USDC to Soroban as a standard token (SEP-41 interface: `transfer`, `balance`, `approve`, ...). PHOTON reaches for the SAC only when on-chain logic touches the balance (for example a payment-authorization or allowance flow); plain peer payments stay on the classic payment operation, which is cheaper and simpler.
- **XLM for fees.** Transactions still pay a small XLM fee. For a consumer product the user should never see this: use **fee-bump transactions** and/or sponsored reserves so PHOTON sponsors fees on the user's behalf.

**Design rule:** keep custody self-directed (the user's funds are their USDC, recorded on-chain, not on PHOTON's private ledger), and make the chain invisible.

---

## 3. Wallet, custody, and signing

This is the highest-UX-risk part of the build (see usability risk in [product-discovery.md](./product-discovery.md)). Three options, in increasing order of mainstream friendliness:

1. **Freighter / external wallet.** Power users connect an existing wallet. Use **Stellar Wallets Kit** so PHOTON supports Freighter, xBull, Albedo, Ledger, etc. behind one connection API. Good for the crypto-native early adopter.
2. **Smart accounts + passkeys.** For mainstream users who will never manage a seed phrase, use **smart wallets / smart accounts** with **passkey (WebAuthn)** signing. The customer authenticates with FaceID/biometrics; the account is a contract that authorizes operations. This is the path that makes PHOTON feel like a normal banking app.
3. **Custodial fallback (regulatory permitting).** Some markets may require or favor a custodial model. Treat this as a compliance decision, not a default; it changes the viability profile.

Whichever is chosen, the signing layer in `apps/web` builds the transaction, requests a signature (wallet or passkey), and submits via RPC. Always be explicit about **network passphrase** (Mainnet vs Testnet vs local), **source account + sequence**, **fee/resource limits**, and **authorization**.

---

## 4. Product flows mapped to Stellar

### Deposit (fiat in)
1. User initiates a deposit (card or bank) in the app.
2. A **SEP-24 / SEP-6 anchor** performs the fiat-to-USDC on-ramp (SEP-24 hosted/interactive, or SEP-6 programmatic), handling the KYC-adjacent step per market.
3. USDC lands on the user's Stellar account (trustline already established during onboarding).
4. App reads the new balance via RPC and reflects it instantly.

> The anchor is the regulated edge: it is what actually issues and settles USDC against fiat. Anchor choice is per launch market.

### Withdraw (fiat out)
1. User requests a withdrawal.
2. A **SEP-24 / SEP-6** anchor converts USDC back to fiat and pays out to the user's bank/card.
3. On-chain, this is a USDC payment from the user to the anchor, then off-chain fiat settlement.
4. No lock-ups, no minimums: the constraint is anchor availability, not PHOTON.

### Pay (USDC out over a rail)
Settlement of the USDC balance happens in seconds for a fraction of a cent. The headline capability is paying the **machine economy** over two open standards, plus plain peer payment:

| Rail | What it is | PHOTON use |
|---|---|---|
| **MPP** | Machine Payments Protocol: the open standard co-created by **Stripe and Tempo** for agents to pay autonomously (request, 402 payment required, authorize, deliver) | Let agents/services spend from the balance on their own, with per-request precision |
| **x402** | The open HTTP `402 Payment Required` standard: an API returns 402 with payment terms, the client pays, retries, and gets the resource | Pay for any API or resource the moment it asks, no subscription |
| **Peer payment** | Classic Stellar `payment` op (or SAC `transfer`) | Send USDC to another account/user |

MPP and x402 are the same request-pay-deliver family. PHOTON implements both so an agent can pay whichever standard a service speaks.

---

## 5. x402 (paying APIs)

x402 turns the dormant `402 Payment Required` status into a real payment handshake:

1. Client calls a paid endpoint, receives **HTTP 402** with payment requirements (amount, asset, destination, network).
2. The PHOTON signing layer constructs and authorizes a USDC-on-Stellar payment for that exact amount.
3. Client retries with proof of payment; the server verifies and returns the resource.

For PHOTON this is the "pay for anything on the internet that asks" capability. The work is: an **x402 client** in the app/SDK that recognizes 402 responses, maps them to a USDC payment, and handles fee sponsorship so the user pays only the stated amount. Stellar's USDC SAC is the settlement asset. (See the `x402-stellar` reference for the Stellar-specific facilitator and client patterns.)

## 6. MPP (machine-to-machine payments)

MPP, the Machine Payments Protocol co-created by **Stripe and Tempo**, targets the case where a **software agent**, not a human, is spending. It shares the request-pay-deliver shape of x402. Two settlement modes:

- **Charge mode** (per-request, on-chain via the USDC SAC): each call is a discrete settled payment. Simple, fully on-chain, best for lower frequency.
- **Channel mode** (off-chain commits, periodic on-chain settlement): for high-frequency traffic where settling every request on-chain is wasteful. Commitments accrue off-chain and net-settle to Stellar.

For PHOTON, MPP is what lets a customer's account fund autonomous agents (buying compute, data, or services by the second) with guardrails: spend caps, allowances (via SAC `approve`), and revocation. This is a capability **no legacy bank account offers**, and a strong candidate for the product's real wedge.

---

## 7. Build path (phased)

| Phase | Goal | Key pieces |
|---|---|---|
| 0. Spike | Prove feasibility on Testnet | Create account, add USDC trustline, send a USDC payment, read balance via RPC, all fee-sponsored |
| 1. Wallet UX | Make signing mainstream | Stellar Wallets Kit + passkey smart account; hide XLM/fees |
| 2. On/off-ramp | Move fiat | SEP-24 anchor (deposit); SEP-6/24 withdraw |
| 3. Pay rails | Outbound payments | Peer payments, then x402 client, then MPP (charge mode first) |
| 4. Harden | Production | Security review, compliance/KYC per market, monitoring |

### Testing
- **Local:** Stellar Quickstart Docker for a private network.
- **Testnet:** Friendbot funding; exercise every flow (deposit sim, payment, x402 handshake, MPP charge) before mainnet.
- Unit-test any Soroban logic with `Env` from `soroban-sdk`; mock wallet/RPC in frontend tests.

---

## 8. Risk and compliance notes

- **Custody framing.** "Self-custodial USDC" narrows but does not remove money-transmission and KYC/AML obligations, especially at the fiat boundary (deposit/withdraw). Treat the on/off-ramp as the regulated edge.
- **Fee abstraction.** Users must never need XLM. Sponsor reserves and fee-bump every user transaction.
- **Authorization.** For agent spending (MPP) and API payments (x402), enforce explicit allowances, spend caps, and revocation so an automated payer cannot drain a balance.
- **Asset trust.** Pin the exact USDC issuer; verify trustline state before assuming a balance can be received.

---

## 9. References (verify before relying on as current)

- Stellar developer docs: build, assets, anchors, RPC/Horizon, smart wallets/passkeys.
- SEPs: SEP-24 (interactive deposit/withdraw), SEP-6 (programmatic), SEP-31 (cross-border), SEP-41 (token interface), SEP-10 (auth).
- `stellar-dev` skill references: `stellar-assets.md`, `frontend-stellar-sdk.md`, `contracts-soroban.md`, `security.md`, `api-rpc-horizon.md`.
- Payment rails: `x402-stellar` and `agentic-payments` (MPP charge/channel modes) skills.

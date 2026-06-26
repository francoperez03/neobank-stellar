# @neobank-stellar/extension — PHOTON x402 Paywall Scanner

Chrome extension (MV3) that detects endpoints returning **HTTP 402** (the x402
"Payment Required" signal) and decodes their Stellar payment terms.

## How it detects 402s

The endpoint that returns 402 is usually triggered by JS after interaction (e.g. a
"Pay" button that only enables once a wallet is connected), so it is not sitting in the
DOM as a link. Static URL scraping misses it. Instead the extension observes the network:

- **MAIN-world interceptor** (`src/content/interceptor.ts`) patches `fetch`/`XMLHttpRequest`
  in the page context and captures any 402 response **with its body**, so we can decode
  the x402 challenge.
- **`chrome.webRequest.onCompleted`** in the background (`src/background/service-worker.ts`)
  is the authoritative status-code source for every request.
- **Auto-clicker** (`src/content/main.ts`) clicks every enabled interactive element and
  **re-scans after each click** (fixpoint), because an interaction can enable buttons that
  were disabled. Disabled/hidden elements and cross-page links are skipped.

State lives in the background and persists to `storage.session`, so it survives the popup
closing when the wallet popup steals focus.

x402 decoding (`parseX402Payload`, `formatAmount`, `truncateId`) lives in
`@neobank-stellar/shared` and is reused here.

## Build & load

```bash
pnpm --filter @neobank-stellar/extension build   # outputs apps/extension/dist
```

1. `chrome://extensions` → enable **Developer mode**.
2. **Load unpacked** → select `apps/extension/dist`.
3. Open a site with an x402 paywall (e.g. https://x402-stellar-demo.vercel.app), reload it
   so the content scripts inject, then open the popup.

## Using it (wallet flow)

1. Click **Scan this page**. Enabled buttons get clicked; any 402 fired is captured.
2. The "Pay" button is gated behind **Connect Wallet** — connect your wallet on the page by
   hand (the only step automation can't do; it needs a real signature).
3. Click **Scan** again. The now-enabled Pay button is clicked, its request returns 402, and
   the popup shows the decoded terms: amount · network · asset · payTo · fees sponsored.

The 402 *challenge* is returned **before** any payment is signed, so the scanner reads the
terms without ever completing a payment.

## Dev (HMR)

```bash
pnpm --filter @neobank-stellar/extension dev
```
Then load `apps/extension/dist` unpacked; CRXJS provides MV3 hot reload.

import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "PHOTON — x402 Paywall Scanner",
  description:
    "Scan a page for endpoints that return HTTP 402 (x402 Payment Required) and decode their Stellar payment terms.",
  version: "0.0.1",
  icons: {
    16: "icons/icon16.png",
    48: "icons/icon48.png",
    128: "icons/icon128.png",
  },
  action: {
    default_popup: "index.html",
    default_title: "Scan this page for x402 paywalls",
    default_icon: {
      16: "icons/icon16.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png",
    },
  },
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/content/interceptor.ts"],
      run_at: "document_start",
      // `world: "MAIN"` is valid MV3 (Chrome 111+) but missing from CRXJS's manifest types.
      // @ts-expect-error -- known-good MV3 field
      world: "MAIN",
    },
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/content/main.ts"],
      run_at: "document_start",
    },
  ],
  permissions: ["activeTab", "scripting", "storage", "webRequest"],
  host_permissions: ["http://*/*", "https://*/*"],
});

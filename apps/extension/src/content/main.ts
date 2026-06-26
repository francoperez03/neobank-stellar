/**
 * ISOLATED-world content script.
 *
 *  1. Relays 402 events from the MAIN-world interceptor (window.postMessage) to the
 *     extension background (chrome.runtime).
 *  2. Learns candidates: tracks the button under the last user gesture and, when a 402
 *     is observed shortly after, attributes it to that button (persists it confirmed).
 *  3. Mounts the Grammarly-style hover badges (src/content/inline-badges.ts), which only
 *     appear on candidate buttons (see candidate.ts).
 *
 * We deliberately do NOT auto-click the page's buttons: clicking everything triggers
 * side effects and can trap the user inside wallet modals.
 */
import type { Msg, PageMessage } from "@/lib/messaging";
import { PAGE_MSG_TAG } from "@/lib/messaging";
import { initInlineBadges } from "./inline-badges";
import { confirmButton, hydrateRegistry } from "./registry";
import { markX402 } from "./state";

const BUTTON_SELECTOR =
  'button, [role="button"], input[type="submit"], input[type="button"]';
const ATTRIBUTION_WINDOW_MS = 4000;

// Track the button under the last user gesture, to attribute a subsequent 402 to it.
let lastGesture: { el: HTMLElement; t: number } | null = null;

function rememberGesture(e: Event): void {
  const node = e.target as Element | null;
  const btn = node?.closest<HTMLElement>(BUTTON_SELECTOR) ?? null;
  if (btn) lastGesture = { el: btn, t: Date.now() };
}
document.addEventListener("pointerdown", rememberGesture, true);
document.addEventListener("click", rememberGesture, true);

// Relay MAIN-world interceptor messages to the background, and learn from them.
window.addEventListener("message", (event: MessageEvent) => {
  if (event.source !== window) return;
  const data = event.data as Partial<PageMessage> | null;
  if (!data || data[PAGE_MSG_TAG] !== true) return;

  // Observed an x402 signal → this page is x402-enabled.
  markX402();

  // Attribute the 402 to the button the user just interacted with.
  if (lastGesture && Date.now() - lastGesture.t < ATTRIBUTION_WINDOW_MS) {
    void confirmButton(lastGesture.el);
  }

  const msg: Msg = {
    type: "x402:hit",
    url: data.url ?? "",
    status: data.status ?? 402,
    bodyText: data.bodyText ?? "",
    method: data.method,
  };
  void chrome.runtime.sendMessage(msg).catch(() => {});
});

void hydrateRegistry();
initInlineBadges();

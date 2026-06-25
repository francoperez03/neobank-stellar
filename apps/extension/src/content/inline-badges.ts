/**
 * Grammarly-style inline UI — HOVER based, never auto-clicks.
 *
 * When the pointer is over a button, a small PHOTON badge appears glued to its
 * top-right corner. Clicking the BADGE (not the button) opens a tiny popover
 * anchored to it. For now the popover is a stub ("Pay $0.001") — the real x402
 * flow gets wired in later. We never click the page's own buttons, so we can't
 * trap the user inside wallet modals or trigger side effects.
 *
 * Everything lives in a Shadow DOM host (pointer-events:none) so page CSS can't
 * touch it and our overlay never steals clicks; only the badge/popover opt back
 * into pointer events.
 */

import { scoreCandidate } from "./candidate";
import { onRefresh } from "./state";

const OVERLAY_ID = "photon-x402-overlay";
const BUTTON_SELECTOR =
  'button, [role="button"], input[type="submit"], input[type="button"]';
const HIDE_DELAY_MS = 220;

let host: HTMLDivElement | null = null;
let shadow: ShadowRoot | null = null;
let badge: HTMLButtonElement | null = null;
let popover: HTMLDivElement | null = null;
let activeEl: HTMLElement | null = null;
let hideTimer: number | undefined;
let rafId: number | undefined;

const STYLE = `
:host { all: initial; }
.badge {
  position: absolute;
  pointer-events: auto;
  width: 20px; height: 20px;
  display: none; align-items: center; justify-content: center;
  border: none; border-radius: 6px;
  background: #fdda24; color: #0f0f0f;
  font: 700 11px/1 system-ui, sans-serif;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,.35);
  transition: transform .12s ease;
}
.badge.show { display: flex; }
.badge:hover { transform: scale(1.12); }
.badge.confirmed { background: #00a7b5; color: #ffffff; box-shadow: 0 0 0 2px rgba(0,167,181,.35), 0 2px 8px rgba(0,0,0,.35); }
.popover {
  position: absolute;
  pointer-events: auto;
  width: 220px;
  background: #191919; color: #f6f7fb;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 12px;
  padding: 12px;
  font-family: system-ui, -apple-system, sans-serif;
  box-shadow: 0 12px 32px rgba(0,0,0,.55);
}
.popover .head { color: #fdda24; font-weight: 700; font-size: 12px; letter-spacing: .02em; }
.popover .label {
  margin: 6px 0 10px; font-size: 13px; color: #9a9da6;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.popover .pay {
  width: 100%; border: none; border-radius: 9px; padding: 9px;
  background: #fdda24; color: #0f0f0f; font: 600 13px system-ui, sans-serif; cursor: pointer;
}
.popover .pay:hover { filter: brightness(1.06); }
.popover .note { margin-top: 8px; font-size: 11px; color: #9a9da6; text-align: center; }
`;

function ensureHost(): void {
  if (host) return;
  host = document.createElement("div");
  host.id = OVERLAY_ID;
  host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483646;";
  shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = STYLE;
  shadow.appendChild(style);

  badge = document.createElement("button");
  badge.className = "badge";
  badge.type = "button";
  badge.title = "PHOTON — x402";
  badge.textContent = "◆";
  badge.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeEl) openPopover(activeEl);
  });
  badge.addEventListener("mouseenter", () => window.clearTimeout(hideTimer));
  badge.addEventListener("mouseleave", scheduleHide);
  shadow.appendChild(badge);

  document.documentElement.appendChild(host);
}

function isDecoratable(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width < 16 || rect.height < 12) return false;
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  return true;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c
  );
}

function positionBadge(): void {
  if (!badge || !activeEl) return;
  if (!activeEl.isConnected) {
    hideBadge();
    return;
  }
  const rect = activeEl.getBoundingClientRect();
  badge.style.left = `${rect.right - 10}px`;
  badge.style.top = `${rect.top - 10}px`;
}

function track(): void {
  positionBadge();
  rafId = requestAnimationFrame(track);
}

function showBadgeFor(el: HTMLElement, confirmed: boolean): void {
  if (!badge) return;
  window.clearTimeout(hideTimer);
  activeEl = el;
  badge.classList.add("show");
  badge.classList.toggle("confirmed", confirmed);
  badge.title = confirmed ? "PHOTON — x402 detected here" : "PHOTON — possible x402";
  positionBadge();
  if (rafId === undefined) rafId = requestAnimationFrame(track);
}

function hideBadge(): void {
  badge?.classList.remove("show");
  activeEl = null;
  if (rafId !== undefined) {
    cancelAnimationFrame(rafId);
    rafId = undefined;
  }
}

function scheduleHide(): void {
  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(hideBadge, HIDE_DELAY_MS);
}

function closePopover(): void {
  popover?.remove();
  popover = null;
}

function openPopover(target: HTMLElement): void {
  closePopover();
  if (!shadow || !badge) return;

  const label = (target.textContent ?? "").trim().slice(0, 40) || "this button";
  popover = document.createElement("div");
  popover.className = "popover";
  popover.innerHTML = `
    <div class="head">◆ PHOTON</div>
    <div class="label">${escapeHtml(label)}</div>
    <button class="pay" type="button">Pay $0.001</button>
    <div class="note">x402 demo — wiring next</div>
  `;
  shadow.appendChild(popover);

  const rect = badge.getBoundingClientRect();
  const left = Math.min(rect.left, window.innerWidth - 232);
  popover.style.left = `${Math.max(8, left)}px`;
  popover.style.top = `${rect.bottom + 6}px`;

  popover.addEventListener("mouseenter", () => window.clearTimeout(hideTimer));
  popover.querySelector<HTMLButtonElement>(".pay")?.addEventListener("click", () => {
    const note = popover?.querySelector<HTMLDivElement>(".note");
    if (note) note.textContent = "Payment flow coming soon…";
  });
}

export function initInlineBadges(): void {
  const start = () => {
    ensureHost();

    // Re-evaluate the hovered button when page state changes (newly confirmed / x402).
    onRefresh(() => {
      if (!activeEl) return;
      const verdict = scoreCandidate(activeEl);
      if (verdict.show) showBadgeFor(activeEl, verdict.confirmed);
      else hideBadge();
    });

    // Hover delegation: show the badge for whatever button the pointer is over.
    document.addEventListener(
      "pointerover",
      (e) => {
        const node = e.target as Element | null;
        if (node && host?.contains(node)) return; // ignore our own overlay
        const btn = node?.closest<HTMLElement>(BUTTON_SELECTOR);
        if (!btn || !isDecoratable(btn)) return;
        const verdict = scoreCandidate(btn);
        if (verdict.show) showBadgeFor(btn, verdict.confirmed);
      },
      true
    );
    document.addEventListener(
      "pointerout",
      (e) => {
        const node = e.target as Element | null;
        if (node?.closest(BUTTON_SELECTOR)) scheduleHide();
      },
      true
    );
    // Close the popover when clicking outside it.
    document.addEventListener(
      "click",
      (e) => {
        if (popover && !(e.target instanceof Node && host?.contains(e.target))) {
          closePopover();
        }
      },
      true
    );
  };

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
}

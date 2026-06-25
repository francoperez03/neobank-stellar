/**
 * Background service worker — the scan's brain and state.
 *
 *  - chrome.webRequest.onCompleted: authoritative status-code source. Any response
 *    with status 402 becomes a finding (no body available here).
 *  - runtime messages "x402:hit" from the interceptor: enrich a finding with the
 *    decoded x402 challenge (parsed from the captured response body).
 *  - Holds findings across popup open/close (the popup closes when the wallet popup
 *    steals focus), persisting to storage.session and broadcasting to any open popup.
 */
import { parseX402Payload } from "@neobank-stellar/shared";
import type { Finding, Msg, ScanState } from "@/lib/messaging";
import { PORT_NAME } from "@/lib/messaging";

const findings = new Map<string, Finding>();
let scanning = false;
let clicked = 0;
let queued = 0;
const ports = new Set<chrome.runtime.Port>();

function snapshot(): ScanState {
  return {
    scanning,
    clicked,
    queued,
    findings: [...findings.values()].sort((a, b) => b.firstSeen - a.firstSeen),
  };
}

function broadcast(): void {
  const snap = snapshot();
  void chrome.storage.session.set({ state: snap }).catch(() => {});
  for (const port of ports) {
    try {
      port.postMessage(snap);
    } catch {
      ports.delete(port);
    }
  }
}

function upsert(url: string, patch: Partial<Finding>): void {
  const current =
    findings.get(url) ?? { url, status: patch.status ?? 402, firstSeen: Date.now() };
  findings.set(url, { ...current, ...patch, url });
  broadcast();
}

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.statusCode === 402) {
      upsert(details.url, { status: 402, method: details.method });
    }
  },
  { urls: ["<all_urls>"] }
);

chrome.runtime.onMessage.addListener((msg: Msg, _sender, sendResponse) => {
  switch (msg.type) {
    case "x402:hit": {
      const challenge = parseX402Payload(msg.bodyText);
      upsert(msg.url, { status: msg.status, method: msg.method, challenge });
      break;
    }
    case "scan:progress":
      scanning = true;
      clicked = msg.clicked;
      queued = msg.queued;
      broadcast();
      break;
    case "scan:done":
      scanning = false;
      broadcast();
      break;
    case "scan:reset":
      findings.clear();
      clicked = 0;
      queued = 0;
      scanning = false;
      broadcast();
      break;
    case "scan:start":
      void startScan();
      break;
    case "state:get":
      sendResponse(snapshot());
      return true;
  }
  return false;
});

async function startScan(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  scanning = true;
  clicked = 0;
  broadcast();
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "scan:start" } satisfies Msg);
  } catch {
    // Content script not present (page loaded before install) — ask user to reload.
    scanning = false;
    broadcast();
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== PORT_NAME) return;
  ports.add(port);
  port.postMessage(snapshot());
  port.onDisconnect.addListener(() => ports.delete(port));
});

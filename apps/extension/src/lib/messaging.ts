import type { X402Challenge } from "@neobank-stellar/shared";

/** A detected endpoint that answered HTTP 402 (x402 Payment Required). */
export interface Finding {
  url: string;
  status: number;
  method?: string;
  /** Decoded x402 challenge, when a response body was captured by the interceptor. */
  challenge?: X402Challenge | null;
  firstSeen: number;
}

/** Snapshot of the scan, held in the background service worker. */
export interface ScanState {
  scanning: boolean;
  clicked: number;
  queued: number;
  findings: Finding[];
}

export type Msg =
  // interceptor (page) -> background: a 402 response with its body
  | { type: "x402:hit"; url: string; status: number; bodyText: string; method?: string }
  // popup -> background
  | { type: "scan:start" }
  | { type: "scan:reset" }
  | { type: "state:get" }
  // content clicker -> background
  | { type: "scan:progress"; clicked: number; queued: number }
  | { type: "scan:done" };

export const PORT_NAME = "photon-x402";

/** Marker for window.postMessage from the MAIN-world interceptor to the ISOLATED bridge. */
export const PAGE_MSG_TAG = "__photonX402";

export interface PageMessage {
  [PAGE_MSG_TAG]: true;
  url: string;
  status: number;
  bodyText: string;
  method?: string;
}

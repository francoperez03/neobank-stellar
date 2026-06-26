/**
 * Per-page content state shared by the content scripts.
 *
 *  - `x402Enabled`: set true once we've observed an x402 signal on this page (a 402
 *    response, or an x402-ish header). Used as a positive signal when scoring buttons.
 *  - `confirmed`: signatures of buttons that were attributed to an observed 402.
 *    These always get a badge (highest-confidence candidates).
 *
 * `onRefresh` lets the badge layer re-evaluate the hovered button when state changes
 * (e.g. a button just became confirmed).
 */

export const state = {
  x402Enabled: false,
  confirmed: new Set<string>(),
};

let refresh: (() => void) | null = null;

export function onRefresh(cb: () => void): void {
  refresh = cb;
}

export function markX402(): void {
  if (state.x402Enabled) return;
  state.x402Enabled = true;
  refresh?.();
}

export function addConfirmed(signature: string): void {
  if (state.confirmed.has(signature)) return;
  state.confirmed.add(signature);
  refresh?.();
}

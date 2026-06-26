/**
 * Candidate scoring — decides whether a button should get a PHOTON badge.
 *
 * We cannot read a button's click handler to know if it calls fetch and awaits a 402
 * (listeners and React's synthetic handlers aren't introspectable from a content script,
 * and we won't "dry-run" the handler because clicking has side effects). So in the cold
 * state we score static signals; once a 402 has been attributed to a button it becomes
 * `confirmed` and always wins. Tune the keyword lists and THRESHOLD here.
 */
import { signatureOf } from "./registry";
import { state } from "./state";

export const THRESHOLD = 50;

// EN + ES payment verbs.
const PAY_VERBS =
  /\b(pay|buy|purchase|checkout|unlock|subscribe|tip|donate|premium|mint|get the data|access|pagar|comprar|comprá|suscrib|desbloque|acced|acced[eé]|donar|propina)\b/i;

// Price / currency near the button.
const PRICE =
  /(\$\s?\d|\d+(?:[.,]\d+)?\s?(?:usdc|xlm|usd|eur|ars)\b|\busdc\b|\bxlm\b)/i;

// Things that look like navigation / dismissal, not payment.
const NEGATIVE =
  /\b(cancel|close|cerrar|dismiss|back|atr[aá]s|volver|menu|men[uú]|home|inicio|next|prev|previous|siguiente|anterior|search|buscar|filter|filtro|cookie|cookies|accept all|aceptar|settings|ajustes|logout|login|sign in|sign up|toggle|expand|collapse)\b/i;

export interface CandidateVerdict {
  show: boolean;
  confirmed: boolean;
  score: number;
}

function accessibleText(el: HTMLElement): string {
  return [
    el.textContent ?? "",
    el.getAttribute("aria-label") ?? "",
    el.getAttribute("title") ?? "",
    el.getAttribute("value") ?? "",
  ]
    .join(" ")
    .trim();
}

/** Nearby price text: the button itself or its immediate container. */
function hasNearbyPrice(el: HTMLElement): boolean {
  if (PRICE.test(el.textContent ?? "")) return true;
  const parent = el.parentElement;
  if (parent && PRICE.test(parent.textContent ?? "")) return true;
  return false;
}

export function scoreCandidate(el: HTMLElement): CandidateVerdict {
  if (state.confirmed.has(signatureOf(el))) {
    return { show: true, confirmed: true, score: Infinity };
  }

  const text = accessibleText(el);
  let score = 0;

  if (PAY_VERBS.test(text)) score += 40;
  if (hasNearbyPrice(el)) score += 35;

  const type = el.getAttribute("type");
  if (type === "submit" || el.closest("form")) score += 10;

  if (state.x402Enabled) score += 30;

  // Negative signals: only penalize when there's no payment verb, so a real
  // "Pay & close" style label isn't wrongly suppressed.
  if (!PAY_VERBS.test(text) && (NEGATIVE.test(text) || text.length === 0)) {
    score -= 50;
  }

  return { show: score >= THRESHOLD, confirmed: false, score };
}

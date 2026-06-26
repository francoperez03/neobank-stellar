/**
 * Confirmed-button registry.
 *
 * A "signature" is a re-render-stable identity for a button: tag + type + normalized
 * text. When a 402 is attributed to a button we persist its signature per origin in
 * chrome.storage.local, so on the next visit the badge shows confidently from the start.
 */
import { addConfirmed, state } from "./state";

const KEY_PREFIX = "photon:confirmed:";

function storageKey(): string {
  return KEY_PREFIX + location.origin;
}

/** Stable-ish identity of a button across SPA re-renders. */
export function signatureOf(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  const type = el.getAttribute("type") ?? "";
  const text = (el.textContent ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 64);
  return `${tag}|${type}|${text}`;
}

/** Load confirmed signatures for this origin into state. */
export async function hydrateRegistry(): Promise<void> {
  try {
    const key = storageKey();
    const stored = await chrome.storage.local.get(key);
    const sigs = stored[key] as string[] | undefined;
    if (Array.isArray(sigs)) {
      for (const sig of sigs) state.confirmed.add(sig);
    }
  } catch {
    /* storage unavailable — fall back to in-memory only */
  }
}

/** Mark a button confirmed (memory + persisted). */
export async function confirmButton(el: HTMLElement): Promise<void> {
  const sig = signatureOf(el);
  if (state.confirmed.has(sig)) return;
  addConfirmed(sig);
  try {
    const key = storageKey();
    await chrome.storage.local.set({ [key]: [...state.confirmed] });
  } catch {
    /* ignore persistence failure */
  }
}

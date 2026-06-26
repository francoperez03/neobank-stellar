/**
 * MAIN-world content script (runs in the page's own JS context at document_start).
 *
 * Patches `fetch` and `XMLHttpRequest` so that whenever the page itself receives an
 * HTTP 402 (x402 "Payment Required") we surface the URL, status and response body to
 * the page via window.postMessage. The ISOLATED-world bridge (content/main.ts) picks
 * it up and relays it to the extension background. This is what catches 402s triggered
 * by interaction (e.g. a "Pay" button that only fires after the wallet is connected),
 * which static URL scraping cannot see.
 *
 * MAIN-world scripts cannot use chrome.* APIs, hence the postMessage handoff.
 */
(() => {
  const TAG = "__photonX402";

  const post = (url: string, status: number, bodyText: string, method?: string) => {
    window.postMessage({ [TAG]: true, url, status, bodyText, method }, "*");
  };

  // --- fetch ---
  const origFetch = window.fetch as typeof window.fetch & { __photonPatched?: boolean };
  if (origFetch && !origFetch.__photonPatched) {
    const patched = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const res = await origFetch(input, init);
      try {
        if (res.status === 402) {
          const method =
            init?.method ?? (input instanceof Request ? input.method : undefined);
          const text = await res.clone().text();
          post(res.url || String(input), 402, text, method);
        }
      } catch {
        /* never break the page */
      }
      return res;
    };
    (patched as typeof patched & { __photonPatched: boolean }).__photonPatched = true;
    window.fetch = patched as typeof window.fetch;
  }

  // --- XMLHttpRequest ---
  type PatchedXHR = XMLHttpRequest & { __photonUrl?: string; __photonMethod?: string };
  const proto = window.XMLHttpRequest?.prototype as
    | (XMLHttpRequest & { __photonPatched?: boolean })
    | undefined;

  if (proto && !proto.__photonPatched) {
    const open = proto.open;
    const send = proto.send;

    proto.open = function (this: PatchedXHR, method: string, url: string | URL) {
      this.__photonMethod = method;
      this.__photonUrl = String(url);
      // eslint-disable-next-line prefer-rest-params
      return open.apply(this, arguments as unknown as Parameters<XMLHttpRequest["open"]>);
    } as XMLHttpRequest["open"];

    proto.send = function (this: PatchedXHR, body?: Document | XMLHttpRequestBodyInit | null) {
      this.addEventListener("load", () => {
        try {
          if (this.status === 402) {
            post(
              this.__photonUrl || this.responseURL,
              402,
              this.responseText || "",
              this.__photonMethod
            );
          }
        } catch {
          /* ignore */
        }
      });
      return send.call(this, body);
    } as XMLHttpRequest["send"];

    (proto as typeof proto & { __photonPatched: boolean }).__photonPatched = true;
  }
})();

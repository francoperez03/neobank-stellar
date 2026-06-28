import { test, expect, afterEach } from "bun:test";
import { defindex, DefindexError } from "./defindex";

// Stub global fetch so we exercise only the parsing/error logic, not the network.
const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubFetch(status: number, body: unknown) {
  globalThis.fetch = (async () =>
    new Response(typeof body === "string" ? body : JSON.stringify(body), {
      status,
    })) as unknown as typeof fetch;
}

test("getApy returns the apy as a number", async () => {
  stubFetch(200, { apy: 0.1234 });
  expect(await defindex.getApy("CVAULT")).toBe(0.1234);
});

test("getApy coerces a string apy", async () => {
  stubFetch(200, { apy: "8.51" });
  expect(await defindex.getApy("CVAULT")).toBe(8.51);
});

test("getBalance extracts underlyingBalance[0] as a string", async () => {
  stubFetch(200, { underlyingBalance: ["5996", "0"] });
  expect(await defindex.getBalance("CVAULT", "GFROM")).toBe("5996");
});

test("getBalance falls back to a scalar balance field", async () => {
  stubFetch(200, { balance: 42 });
  expect(await defindex.getBalance("CVAULT", "GFROM")).toBe("42");
});

test("getBalance returns '0' when no balance is present", async () => {
  stubFetch(200, {});
  expect(await defindex.getBalance("CVAULT", "GFROM")).toBe("0");
});

test("a non-ok response throws DefindexError carrying the status + message", async () => {
  stubFetch(404, { error: "vault not found" });
  const err = await defindex.getApy("CVAULT").catch((e) => e);
  expect(err).toBeInstanceOf(DefindexError);
  expect(err.status).toBe(404);
  expect(err.message).toBe("vault not found");
});

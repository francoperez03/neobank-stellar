import { describe, it, expect, vi } from "vitest";

// StellarWallet.from(wallet) just returns the wallet; we pass a fake wallet whose
// sendTransaction we can inspect. This avoids loading the real Crossmint SDK.
vi.mock("@crossmint/client-sdk-react-ui", () => ({
  StellarWallet: { from: (w: unknown) => w },
}));

import {
  toSmallestUnit,
  fromSmallestUnit,
  deposit,
  withdraw,
  type CrossmintWallet,
} from "./defindex";

const WALLET_ADDRESS = "CCH746UC6JDUTRJFYRHNRR5QJU7RYBH3EB24AX2VU62ZXIOA7OXFNRCO";
const VAULT = "CAQ6PAG4X6L7LJVGOKSQ6RU2LADWK4EQXRJGMUWL7SECS7LXUEQLM5U7";

function fakeWallet() {
  const sendTransaction = vi.fn().mockResolvedValue({ hash: "tx" });
  return { wallet: { address: WALLET_ADDRESS, sendTransaction } as unknown as CrossmintWallet, sendTransaction };
}

describe("toSmallestUnit", () => {
  it("converts whole and fractional amounts (7 decimals)", () => {
    expect(toSmallestUnit("1")).toBe(10_000_000n);
    expect(toSmallestUnit("12.5")).toBe(125_000_000n);
    expect(toSmallestUnit("0.0000001")).toBe(1n);
  });

  it("rejects non-positive or malformed amounts", () => {
    expect(() => toSmallestUnit("0")).toThrow();
    expect(() => toSmallestUnit("-1")).toThrow();
    expect(() => toSmallestUnit("abc")).toThrow();
    expect(() => toSmallestUnit("")).toThrow();
  });
});

describe("fromSmallestUnit", () => {
  it("formats smallest units back to a human decimal", () => {
    expect(fromSmallestUnit(10_000_000n)).toBe("1");
    expect(fromSmallestUnit(125_000_000n)).toBe("12.5");
    expect(fromSmallestUnit(1n)).toBe("0.0000001");
    expect(fromSmallestUnit("10000000")).toBe("1");
  });

  it("round-trips with toSmallestUnit", () => {
    for (const v of ["1", "12.5", "0.0000001", "999.123"]) {
      expect(fromSmallestUnit(toSmallestUnit(v))).toBe(v);
    }
  });
});

describe("deposit", () => {
  it("builds the exact contract-call args validated against Crossmint", async () => {
    const { wallet, sendTransaction } = fakeWallet();
    await deposit(wallet, VAULT, { amount: "1" });

    expect(sendTransaction).toHaveBeenCalledTimes(1);
    expect(sendTransaction).toHaveBeenCalledWith({
      contractId: VAULT,
      method: "deposit",
      args: {
        amounts_desired: ["10000000"], // i128 as a string
        amounts_min: ["9950000"], // default 0.5% slippage floor
        from: WALLET_ADDRESS,
        invest: true,
      },
    });
  });

  it("applies a custom slippage to amounts_min", async () => {
    const { wallet, sendTransaction } = fakeWallet();
    await deposit(wallet, VAULT, { amount: "1", slippageBps: 100 });

    expect(sendTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.objectContaining({ amounts_min: ["9900000"] }), // 1% off 10_000_000
      }),
    );
  });

  it("throws (without calling the wallet) on a bad amount", async () => {
    const { wallet, sendTransaction } = fakeWallet();
    expect(() => deposit(wallet, VAULT, { amount: "0" })).toThrow();
    expect(sendTransaction).not.toHaveBeenCalled();
  });
});

describe("withdraw", () => {
  it("builds the withdraw-by-shares contract-call", async () => {
    const { wallet, sendTransaction } = fakeWallet();
    await withdraw(wallet, VAULT, { shares: "1" });

    expect(sendTransaction).toHaveBeenCalledWith({
      contractId: VAULT,
      method: "withdraw",
      args: {
        withdraw_shares: "10000000",
        min_amounts_out: ["0"],
        from: WALLET_ADDRESS,
      },
    });
  });
});

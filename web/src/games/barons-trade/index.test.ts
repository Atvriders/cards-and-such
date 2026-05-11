import { describe, it, expect } from "vitest";
import { baronsTradePlugin } from "./index.js";
import type { BaronsTradeState } from "./state.js";

const S = { dummy: false } as never;

describe("barons-trade plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(baronsTradePlugin.id).toBe("barons-trade");
    expect(baronsTradePlugin.title).toBe("Barons of Trade");
    expect(baronsTradePlugin.category).toBe("cards");
    expect(baronsTradePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof baronsTradePlugin.description).toBe("string");
    expect(baronsTradePlugin.description.length).toBeGreaterThan(0);
    expect(baronsTradePlugin.settings).toBeDefined();
    expect(typeof baronsTradePlugin.settings).toBe("object");
    expect(typeof baronsTradePlugin.initialState).toBe("function");
    expect(typeof baronsTradePlugin.reducer).toBe("function");
    expect(typeof baronsTradePlugin.isTerminal).toBe("function");
    expect(baronsTradePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = baronsTradePlugin.initialState(42, S);
    const b = baronsTradePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.turn).toBe(1);
    expect(a.cash).toBe(180);
    expect(a.assets).toBe(0);
    expect(a.workers).toBe(0);
    expect(a.phase).toBe("choosing");
    expect(baronsTradePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while choosing and null otherwise", () => {
    expect(typeof baronsTradePlugin.hint).toBe("function");
    const state = baronsTradePlugin.initialState(7, S);
    const result = baronsTradePlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-barons-trade-primary"]');
    expect(result!.pulses).toBe(3);

    const doneState: BaronsTradeState = { ...state, phase: "done" };
    expect(baronsTradePlugin.hint!(doneState)).toBeNull();

    const resolvedState: BaronsTradeState = { ...state, phase: "resolved" };
    expect(baronsTradePlugin.hint!(resolvedState)).toBeNull();
  });
});

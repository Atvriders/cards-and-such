import { describe, it, expect } from "vitest";
import { blackHoleSolPlugin } from "./index.js";
import type { BlackHoleState } from "./state.js";

const S = {} as never;

describe("black-hole plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(blackHoleSolPlugin.id).toBe("black-hole");
    expect(blackHoleSolPlugin.title).toBe("Black Hole");
    expect(blackHoleSolPlugin.category).toBe("solitaire");
    expect(blackHoleSolPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof blackHoleSolPlugin.description).toBe("string");
    expect(blackHoleSolPlugin.description.length).toBeGreaterThan(0);
    expect(blackHoleSolPlugin.settings).toBeDefined();
    expect(typeof blackHoleSolPlugin.settings).toBe("object");
    expect(typeof blackHoleSolPlugin.initialState).toBe("function");
    expect(typeof blackHoleSolPlugin.reducer).toBe("function");
    expect(typeof blackHoleSolPlugin.isTerminal).toBe("function");
    expect(blackHoleSolPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = blackHoleSolPlugin.initialState(42, S);
    const b = blackHoleSolPlugin.initialState(42, S);
    const aIds = a.columns.map((col) => col.map((c) => c.id).join("|")).join(";");
    const bIds = b.columns.map((col) => col.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    // Black Hole deals into 17 columns of 3 cards (51 non-Ace cards).
    expect(a.columns.length).toBe(17);
    for (const col of a.columns) expect(col.length).toBe(3);
    expect(a.won).toBe(false);
    expect(a.lost).toBe(false);
    expect(blackHoleSolPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget or null and respects terminal flags", () => {
    expect(typeof blackHoleSolPlugin.hint).toBe("function");
    const state = blackHoleSolPlugin.initialState(7, S);
    const result = blackHoleSolPlugin.hint!(state);
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-black-hole-/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // When the game is won or lost, hint() must return null.
    const won: BlackHoleState = { ...state, won: true };
    expect(blackHoleSolPlugin.hint!(won)).toBeNull();
    const lost: BlackHoleState = { ...state, lost: true };
    expect(blackHoleSolPlugin.hint!(lost)).toBeNull();

    // With no waste top, no stock, and all columns "removed", hint must return null.
    const empty: BlackHoleState = {
      ...state,
      waste: [],
      stock: [],
      removed: state.columns.map((col) => col.map(() => true)),
    };
    expect(blackHoleSolPlugin.hint!(empty)).toBeNull();
  });
});

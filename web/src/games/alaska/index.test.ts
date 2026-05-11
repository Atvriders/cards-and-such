import { describe, it, expect } from "vitest";
import { alaskaSolPlugin } from "./index.js";
import type { AlaskaState } from "./state.js";

const S = {} as never;

describe("alaska plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(alaskaSolPlugin.id).toBe("alaska");
    expect(alaskaSolPlugin.title).toBe("Alaska");
    expect(alaskaSolPlugin.category).toBe("solitaire");
    expect(alaskaSolPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof alaskaSolPlugin.description).toBe("string");
    expect(alaskaSolPlugin.description.length).toBeGreaterThan(0);
    expect(alaskaSolPlugin.settings).toBeDefined();
    expect(typeof alaskaSolPlugin.settings).toBe("object");
    expect(typeof alaskaSolPlugin.initialState).toBe("function");
    expect(typeof alaskaSolPlugin.reducer).toBe("function");
    expect(typeof alaskaSolPlugin.isTerminal).toBe("function");
    expect(alaskaSolPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = alaskaSolPlugin.initialState(42, S);
    const b = alaskaSolPlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(alaskaSolPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof alaskaSolPlugin.hint).toBe("function");
    const state = alaskaSolPlugin.initialState(5, S);
    const result = alaskaSolPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="pile-/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Drain all piles to force hint() to fall through to the final `return null` branch.
    const emptied: AlaskaState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(alaskaSolPlugin.hint!(emptied)).toBeNull();
  });
});

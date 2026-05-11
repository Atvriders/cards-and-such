import { describe, it, expect } from "vitest";
import { congressPlugin } from "./index.js";
import type { CongressState } from "./state.js";

const S = {} as never;

describe("congress plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(congressPlugin.id).toBe("congress");
    expect(congressPlugin.title).toBe("Congress");
    expect(congressPlugin.category).toBe("solitaire");
    expect(congressPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof congressPlugin.description).toBe("string");
    expect(congressPlugin.description.length).toBeGreaterThan(0);
    expect(congressPlugin.settings).toBeDefined();
    expect(typeof congressPlugin.settings).toBe("object");
    expect(typeof congressPlugin.initialState).toBe("function");
    expect(typeof congressPlugin.reducer).toBe("function");
    expect(typeof congressPlugin.isTerminal).toBe("function");
    expect(congressPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = congressPlugin.initialState(42, S);
    const b = congressPlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(congressPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof congressPlugin.hint).toBe("function");
    const state = congressPlugin.initialState(5, S);
    const result = congressPlugin.hint!(state);
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
    const emptied: CongressState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(congressPlugin.hint!(emptied)).toBeNull();
  });
});

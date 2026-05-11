import { describe, it, expect } from "vitest";
import { capriciesePlugin } from "./index.js";
import type { CapricieseState } from "./state.js";

const S = {} as never;

describe("capricieuse plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(capriciesePlugin.id).toBe("capricieuse");
    expect(capriciesePlugin.title).toBe("Capricieuse");
    expect(capriciesePlugin.category).toBe("solitaire");
    expect(capriciesePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof capriciesePlugin.description).toBe("string");
    expect(capriciesePlugin.description.length).toBeGreaterThan(0);
    expect(capriciesePlugin.settings).toBeDefined();
    expect(typeof capriciesePlugin.settings).toBe("object");
    expect(typeof capriciesePlugin.initialState).toBe("function");
    expect(typeof capriciesePlugin.reducer).toBe("function");
    expect(typeof capriciesePlugin.isTerminal).toBe("function");
    expect(capriciesePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = capriciesePlugin.initialState(42, S);
    const b = capriciesePlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(capriciesePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof capriciesePlugin.hint).toBe("function");
    const state = capriciesePlugin.initialState(5, S);
    const result = capriciesePlugin.hint!(state);
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
    const emptied: CapricieseState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(capriciesePlugin.hint!(emptied)).toBeNull();
  });
});

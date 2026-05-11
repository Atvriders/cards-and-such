import { describe, it, expect } from "vitest";
import { cruelPlugin } from "./index.js";
import type { CruelState } from "./state.js";

const S = {} as never;

describe("cruel plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cruelPlugin.id).toBe("cruel");
    expect(cruelPlugin.title).toBe("Cruel");
    expect(cruelPlugin.category).toBe("solitaire");
    expect(cruelPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cruelPlugin.description).toBe("string");
    expect(cruelPlugin.description.length).toBeGreaterThan(0);
    expect(cruelPlugin.settings).toBeDefined();
    expect(typeof cruelPlugin.settings).toBe("object");
    expect(typeof cruelPlugin.initialState).toBe("function");
    expect(typeof cruelPlugin.reducer).toBe("function");
    expect(typeof cruelPlugin.isTerminal).toBe("function");
    expect(cruelPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cruelPlugin.initialState(42, S);
    const b = cruelPlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(cruelPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof cruelPlugin.hint).toBe("function");
    const state = cruelPlugin.initialState(5, S);
    const result = cruelPlugin.hint!(state);
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

    // Drain all tableau piles to force hint() to fall through to the final `return null` branch.
    const emptied: CruelState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(cruelPlugin.hint!(emptied)).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { bigHarpPlugin } from "./index.js";
import type { BigHarpState } from "./state.js";

const S = {} as never;

describe("big-harp plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bigHarpPlugin.id).toBe("big-harp");
    expect(bigHarpPlugin.title).toBe("Big Harp");
    expect(bigHarpPlugin.category).toBe("solitaire");
    expect(bigHarpPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bigHarpPlugin.description).toBe("string");
    expect(bigHarpPlugin.description.length).toBeGreaterThan(0);
    expect(bigHarpPlugin.settings).toBeDefined();
    expect(typeof bigHarpPlugin.settings).toBe("object");
    expect(typeof bigHarpPlugin.initialState).toBe("function");
    expect(typeof bigHarpPlugin.reducer).toBe("function");
    expect(typeof bigHarpPlugin.isTerminal).toBe("function");
    expect(bigHarpPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = bigHarpPlugin.initialState(42, S);
    const b = bigHarpPlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(bigHarpPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof bigHarpPlugin.hint).toBe("function");
    const state = bigHarpPlugin.initialState(5, S);
    const result = bigHarpPlugin.hint!(state);
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
    const emptied: BigHarpState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(bigHarpPlugin.hint!(emptied)).toBeNull();
  });
});

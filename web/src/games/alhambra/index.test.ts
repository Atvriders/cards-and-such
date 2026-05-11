import { describe, it, expect } from "vitest";
import { alhambraPlugin } from "./index.js";
import type { AlhambraState } from "./state.js";

const S = {} as never;

describe("alhambra plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(alhambraPlugin.id).toBe("alhambra");
    expect(alhambraPlugin.title).toBe("Alhambra");
    expect(alhambraPlugin.category).toBe("solitaire");
    expect(alhambraPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof alhambraPlugin.description).toBe("string");
    expect(alhambraPlugin.description.length).toBeGreaterThan(0);
    expect(alhambraPlugin.settings).toBeDefined();
    expect(typeof alhambraPlugin.settings).toBe("object");
    expect(typeof alhambraPlugin.initialState).toBe("function");
    expect(typeof alhambraPlugin.reducer).toBe("function");
    expect(typeof alhambraPlugin.isTerminal).toBe("function");
    expect(alhambraPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = alhambraPlugin.initialState(42, S);
    const b = alhambraPlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(alhambraPlugin.isTerminal(a)).toBeNull();
    // Sanity: 2 decks = 104 cards spread across all piles
    const totalCards = a.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(totalCards).toBe(104);
  });

  it("hint returns either null or a HintTarget with a non-empty pile selector", () => {
    expect(typeof alhambraPlugin.hint).toBe("function");
    const state = alhambraPlugin.initialState(5, S);
    const result = alhambraPlugin.hint!(state);
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
    const emptied: AlhambraState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(alhambraPlugin.hint!(emptied)).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { baronessPatiencePlugin } from "./index.js";
import type { BaronessPatienceState } from "./state.js";

const S = {} as never;

describe("baroness-patience plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(baronessPatiencePlugin.id).toBe("baroness-patience");
    expect(baronessPatiencePlugin.title).toBe("Baroness Patience");
    expect(baronessPatiencePlugin.category).toBe("solitaire");
    expect(baronessPatiencePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof baronessPatiencePlugin.description).toBe("string");
    expect(baronessPatiencePlugin.description.length).toBeGreaterThan(0);
    expect(baronessPatiencePlugin.settings).toBeDefined();
    expect(typeof baronessPatiencePlugin.settings).toBe("object");
    expect(typeof baronessPatiencePlugin.initialState).toBe("function");
    expect(typeof baronessPatiencePlugin.reducer).toBe("function");
    expect(typeof baronessPatiencePlugin.isTerminal).toBe("function");
    expect(baronessPatiencePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = baronessPatiencePlugin.initialState(42, S);
    const b = baronessPatiencePlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(baronessPatiencePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof baronessPatiencePlugin.hint).toBe("function");
    const state = baronessPatiencePlugin.initialState(5, S);
    const result = baronessPatiencePlugin.hint!(state);
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
    const emptied: BaronessPatienceState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(baronessPatiencePlugin.hint!(emptied)).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { blackWidowPlugin } from "./index.js";
import type { BlackWidowState } from "./state.js";

const S = {} as never;

describe("black-widow plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(blackWidowPlugin.id).toBe("black-widow");
    expect(blackWidowPlugin.title).toBe("Black Widow");
    expect(blackWidowPlugin.category).toBe("solitaire");
    expect(blackWidowPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof blackWidowPlugin.description).toBe("string");
    expect(blackWidowPlugin.description.length).toBeGreaterThan(0);
    expect(blackWidowPlugin.settings).toBeDefined();
    expect(typeof blackWidowPlugin.settings).toBe("object");
    expect(typeof blackWidowPlugin.initialState).toBe("function");
    expect(typeof blackWidowPlugin.reducer).toBe("function");
    expect(typeof blackWidowPlugin.isTerminal).toBe("function");
    expect(blackWidowPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = blackWidowPlugin.initialState(42, S);
    const b = blackWidowPlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(blackWidowPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof blackWidowPlugin.hint).toBe("function");
    const state = blackWidowPlugin.initialState(5, S);
    const result = blackWidowPlugin.hint!(state);
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
    const emptied: BlackWidowState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(blackWidowPlugin.hint!(emptied)).toBeNull();
  });
});

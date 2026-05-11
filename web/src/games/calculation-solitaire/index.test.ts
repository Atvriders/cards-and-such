import { describe, it, expect } from "vitest";
import { calculationSolitairePlugin } from "./index.js";
import type { CalculationSolitaireState } from "./state.js";

const S = { dummy: false } as never;

describe("calculation-solitaire plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(calculationSolitairePlugin.id).toBe("calculation-solitaire");
    expect(calculationSolitairePlugin.title).toBe("Calculation Solitaire");
    expect(calculationSolitairePlugin.category).toBe("solitaire");
    expect(calculationSolitairePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof calculationSolitairePlugin.description).toBe("string");
    expect(calculationSolitairePlugin.description.length).toBeGreaterThan(0);
    expect(calculationSolitairePlugin.settings).toBeDefined();
    expect(typeof calculationSolitairePlugin.settings).toBe("object");
    expect(typeof calculationSolitairePlugin.initialState).toBe("function");
    expect(typeof calculationSolitairePlugin.reducer).toBe("function");
    expect(typeof calculationSolitairePlugin.isTerminal).toBe("function");
    expect(calculationSolitairePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = calculationSolitairePlugin.initialState(42, S);
    const b = calculationSolitairePlugin.initialState(42, S);
    expect(a.deck.join(",")).toBe(b.deck.join(","));
    expect(a.hand.join(",")).toBe(b.hand.join(","));
    expect(a.round).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.hand.length).toBe(5);
    expect(a.deck.length).toBe(52);
    expect(calculationSolitairePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof calculationSolitairePlugin.hint).toBe("function");
    const state = calculationSolitairePlugin.initialState(5, S);
    const result = calculationSolitairePlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force terminal state so hint() must return null.
    const finished: CalculationSolitaireState = { ...state, phase: "done" };
    expect(calculationSolitairePlugin.isTerminal(finished)).not.toBeNull();
    expect(calculationSolitairePlugin.hint!(finished)).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { cardCoffeePlugin } from "./index.js";
import type { CardCoffeeState } from "./state.js";

const S = { dummy: false } as never;

describe("card-coffee plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardCoffeePlugin.id).toBe("card-coffee");
    expect(cardCoffeePlugin.title).toBe("Card Coffee");
    expect(cardCoffeePlugin.category).toBe("cards");
    expect(cardCoffeePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardCoffeePlugin.description).toBe("string");
    expect(cardCoffeePlugin.description.length).toBeGreaterThan(0);
    expect(cardCoffeePlugin.settings).toBeDefined();
    expect(typeof cardCoffeePlugin.settings).toBe("object");
    expect(typeof cardCoffeePlugin.initialState).toBe("function");
    expect(typeof cardCoffeePlugin.reducer).toBe("function");
    expect(typeof cardCoffeePlugin.isTerminal).toBe("function");
    expect(cardCoffeePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cardCoffeePlugin.initialState(42, S);
    const b = cardCoffeePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(0);
    expect(a.pair).toBeNull();
    expect(a.decisions).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("deal");
    expect(cardCoffeePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with a non-empty selector for fresh state, and null when terminal", () => {
    expect(typeof cardCoffeePlugin.hint).toBe("function");
    const state = cardCoffeePlugin.initialState(7, S);
    const result = cardCoffeePlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toContain("hint-target-card-coffee");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const done: CardCoffeeState = { ...state, phase: "done", score: 42 };
    expect(cardCoffeePlugin.hint!(done)).toBeNull();
    expect(cardCoffeePlugin.isTerminal(done)).toEqual({ score: 42 });
  });
});

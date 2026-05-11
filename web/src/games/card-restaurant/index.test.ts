import { describe, it, expect } from "vitest";
import { cardRestaurantPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("card-restaurant plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardRestaurantPlugin.id).toBe("card-restaurant");
    expect(cardRestaurantPlugin.title).toBe("Card Restaurant");
    expect(cardRestaurantPlugin.category).toBe("cards");
    expect(cardRestaurantPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardRestaurantPlugin.description).toBe("string");
    expect(cardRestaurantPlugin.description.length).toBeGreaterThan(0);
    expect(typeof cardRestaurantPlugin.howToPlay).toBe("string");
    expect(cardRestaurantPlugin.settings).toBeDefined();
    expect(typeof cardRestaurantPlugin.settings).toBe("object");
    expect(typeof cardRestaurantPlugin.initialState).toBe("function");
    expect(typeof cardRestaurantPlugin.reducer).toBe("function");
    expect(typeof cardRestaurantPlugin.isTerminal).toBe("function");
    expect(cardRestaurantPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardRestaurantPlugin.initialState(123, S);
    const b = cardRestaurantPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(0);
    expect(a.pair).toBeNull();
    expect(a.decisions).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("deal");
    expect(a.rngSeed).toBe(123);
    expect(cardRestaurantPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null when terminal", () => {
    expect(typeof cardRestaurantPlugin.hint).toBe("function");
    const state = cardRestaurantPlugin.initialState(7, S);
    const result = cardRestaurantPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-card-restaurant-primary"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const done = { ...state, phase: "done" as const, score: 0 };
    expect(cardRestaurantPlugin.isTerminal(done)).toEqual({ score: 0 });
    expect(cardRestaurantPlugin.hint!(done)).toBeNull();
  });
});

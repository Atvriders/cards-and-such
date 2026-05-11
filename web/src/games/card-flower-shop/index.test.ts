import { describe, it, expect } from "vitest";
import { cardFlowerShopPlugin } from "./index.js";
import type { CardFlowerShopState } from "./state.js";

const S = { dummy: false } as never;

describe("card-flower-shop plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardFlowerShopPlugin.id).toBe("card-flower-shop");
    expect(cardFlowerShopPlugin.title).toBe("Card Flower Shop");
    expect(cardFlowerShopPlugin.category).toBe("cards");
    expect(cardFlowerShopPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardFlowerShopPlugin.description).toBe("string");
    expect(cardFlowerShopPlugin.description.length).toBeGreaterThan(0);
    expect(cardFlowerShopPlugin.settings).toBeDefined();
    expect(typeof cardFlowerShopPlugin.settings).toBe("object");
    expect(typeof cardFlowerShopPlugin.initialState).toBe("function");
    expect(typeof cardFlowerShopPlugin.reducer).toBe("function");
    expect(typeof cardFlowerShopPlugin.isTerminal).toBe("function");
    expect(cardFlowerShopPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh game", () => {
    const a = cardFlowerShopPlugin.initialState(123, S);
    const b = cardFlowerShopPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(0);
    expect(a.phase).toBe("deal");
    expect(a.pair).toBeNull();
    expect(a.decisions).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.rngSeed).toBe(123);
    expect(cardFlowerShopPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null once terminal", () => {
    expect(typeof cardFlowerShopPlugin.hint).toBe("function");
    const state = cardFlowerShopPlugin.initialState(7, S);
    const result = cardFlowerShopPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-flower-shop-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const finished: CardFlowerShopState = { ...state, phase: "done" };
    expect(cardFlowerShopPlugin.isTerminal(finished)).toEqual({ score: finished.score });
    expect(cardFlowerShopPlugin.hint!(finished)).toBeNull();
  });
});

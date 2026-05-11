import { describe, it, expect } from "vitest";
import { cardPetShopPlugin } from "./index.js";
import type { CardPetShopState } from "./state.js";

const S = { dummy: false } as never;

describe("card-pet-shop plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardPetShopPlugin.id).toBe("card-pet-shop");
    expect(cardPetShopPlugin.title).toBe("Card Pet Shop");
    expect(cardPetShopPlugin.category).toBe("cards");
    expect(cardPetShopPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardPetShopPlugin.description).toBe("string");
    expect(cardPetShopPlugin.description.length).toBeGreaterThan(0);
    expect(cardPetShopPlugin.settings).toBeDefined();
    expect(typeof cardPetShopPlugin.settings).toBe("object");
    expect(typeof cardPetShopPlugin.initialState).toBe("function");
    expect(typeof cardPetShopPlugin.reducer).toBe("function");
    expect(typeof cardPetShopPlugin.isTerminal).toBe("function");
    expect(cardPetShopPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = cardPetShopPlugin.initialState(42, S);
    const b = cardPetShopPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.drawCount).toBe(0);
    expect(a.score).toBe(0);
    expect(a.card).toBeNull();
    expect(a.history).toEqual([]);
    expect(a.phase).toBe("drawing");
    expect(cardPetShopPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null when terminal", () => {
    expect(typeof cardPetShopPlugin.hint).toBe("function");
    const state = cardPetShopPlugin.initialState(7, S);
    const result = cardPetShopPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-pet-shop-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const done: CardPetShopState = { ...state, phase: "done" };
    expect(cardPetShopPlugin.isTerminal(done)).toEqual({ score: done.score });
    expect(cardPetShopPlugin.hint!(done)).toBeNull();
  });
});

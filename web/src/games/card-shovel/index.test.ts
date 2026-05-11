import { describe, it, expect } from "vitest";
import { cardShovelPlugin } from "./index.js";
import type { CardShovelState } from "./state.js";

const S = { dummy: false } as never;

describe("card-shovel plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardShovelPlugin.id).toBe("card-shovel");
    expect(cardShovelPlugin.title).toBe("Card Shovel");
    expect(cardShovelPlugin.category).toBe("cards");
    expect(cardShovelPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardShovelPlugin.description).toBe("string");
    expect(cardShovelPlugin.description.length).toBeGreaterThan(0);
    expect(cardShovelPlugin.settings).toBeDefined();
    expect(typeof cardShovelPlugin.settings).toBe("object");
    expect(typeof cardShovelPlugin.initialState).toBe("function");
    expect(typeof cardShovelPlugin.reducer).toBe("function");
    expect(typeof cardShovelPlugin.isTerminal).toBe("function");
    expect(cardShovelPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardShovelPlugin.initialState(42, S);
    const b = cardShovelPlugin.initialState(42, S);
    const aIds = [a.current?.id, ...a.deck.map((c) => c.id)].join("|");
    const bIds = [b.current?.id, ...b.deck.map((c) => c.id)].join("|");
    expect(aIds).toBe(bIds);
    expect(a.phase).toBe("playing");
    expect(a.played).toBe(0);
    expect(a.errors).toBe(0);
    expect(a.score).toBe(0);
    expect(cardShovelPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof cardShovelPlugin.hint).toBe("function");
    const state = cardShovelPlugin.initialState(5, S);
    const result = cardShovelPlugin.hint!(state);
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

    // Force the "done" branch -> hint() must return null.
    const finished: CardShovelState = { ...state, phase: "done", current: null };
    expect(cardShovelPlugin.hint!(finished)).toBeNull();
    expect(cardShovelPlugin.isTerminal(finished)).toEqual({ score: 0 });
  });
});

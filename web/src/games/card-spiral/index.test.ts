import { describe, it, expect } from "vitest";
import { cardSpiralPlugin } from "./index.js";
import type { CardSpiralState } from "./state.js";

const S = { dummy: false } as never;

describe("card-spiral plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardSpiralPlugin.id).toBe("card-spiral");
    expect(cardSpiralPlugin.title).toBe("Card Spiral");
    expect(cardSpiralPlugin.category).toBe("cards");
    expect(cardSpiralPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardSpiralPlugin.description).toBe("string");
    expect(cardSpiralPlugin.description.length).toBeGreaterThan(0);
    expect(cardSpiralPlugin.settings).toBeDefined();
    expect(typeof cardSpiralPlugin.settings).toBe("object");
    expect(typeof cardSpiralPlugin.initialState).toBe("function");
    expect(typeof cardSpiralPlugin.reducer).toBe("function");
    expect(typeof cardSpiralPlugin.isTerminal).toBe("function");
    expect(cardSpiralPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = cardSpiralPlugin.initialState(42, S);
    const b = cardSpiralPlugin.initialState(42, S);
    const aIds = a.deck.map((c) => `${c.id}:${c.rank}`).join("|");
    const bIds = b.deck.map((c) => `${c.id}:${c.rank}`).join("|");
    expect(aIds).toBe(bIds);
    expect(a.spiral).toEqual([]);
    expect(a.drawn).toBeNull();
    expect(a.drew).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(cardSpiralPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when done", () => {
    expect(typeof cardSpiralPlugin.hint).toBe("function");
    const state = cardSpiralPlugin.initialState(7, S);
    const result = cardSpiralPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-spiral-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const done: CardSpiralState = { ...state, phase: "done" };
    expect(cardSpiralPlugin.hint!(done)).toBeNull();
    expect(cardSpiralPlugin.isTerminal(done)).toEqual({ score: 0 });
  });
});

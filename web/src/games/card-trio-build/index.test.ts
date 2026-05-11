import { describe, it, expect } from "vitest";
import { cardTrioBuildPlugin } from "./index.js";

const S = { dummy: false };

describe("card-trio-build plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardTrioBuildPlugin.id).toBe("card-trio-build");
    expect(cardTrioBuildPlugin.title).toBe("Card Trio Build");
    expect(cardTrioBuildPlugin.category).toBe("cards");
    expect(cardTrioBuildPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardTrioBuildPlugin.description).toBe("string");
    expect(cardTrioBuildPlugin.description.length).toBeGreaterThan(0);
    expect(cardTrioBuildPlugin.settings).toBeDefined();
    expect(typeof cardTrioBuildPlugin.settings).toBe("object");
    expect(typeof cardTrioBuildPlugin.initialState).toBe("function");
    expect(typeof cardTrioBuildPlugin.reducer).toBe("function");
    expect(typeof cardTrioBuildPlugin.isTerminal).toBe("function");
    expect(cardTrioBuildPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardTrioBuildPlugin.initialState(42, S);
    const b = cardTrioBuildPlugin.initialState(42, S);
    const aIds = a.deck.map((c) => `${c.id}:${c.rank}`).join(",");
    const bIds = b.deck.map((c) => `${c.id}:${c.rank}`).join(",");
    expect(aIds).toBe(bIds);
    expect(a.hand).toEqual([]);
    expect(a.trios).toBe(0);
    expect(a.drew).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(cardTrioBuildPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null once phase is done", () => {
    expect(typeof cardTrioBuildPlugin.hint).toBe("function");
    const state = cardTrioBuildPlugin.initialState(7, S);
    const result = cardTrioBuildPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-trio-build-primary"]');
      expect(result.pulses).toBe(3);
    }

    const done = { ...state, phase: "done" as const };
    expect(cardTrioBuildPlugin.hint!(done)).toBeNull();
    expect(cardTrioBuildPlugin.isTerminal(done)).toEqual({ score: 0 });
  });
});

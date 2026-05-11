import { describe, it, expect } from "vitest";
import { cutTheDeckPlugin } from "./index.js";
import type { CutTheDeckState } from "./state.js";

const S = { dummy: false } as never;

describe("cut-the-deck plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cutTheDeckPlugin.id).toBe("cut-the-deck");
    expect(cutTheDeckPlugin.title).toBe("Cut the Deck");
    expect(cutTheDeckPlugin.category).toBe("cards");
    expect(cutTheDeckPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cutTheDeckPlugin.description).toBe("string");
    expect(cutTheDeckPlugin.description.length).toBeGreaterThan(0);
    expect(cutTheDeckPlugin.settings).toBeDefined();
    expect(typeof cutTheDeckPlugin.settings).toBe("object");
    expect(typeof cutTheDeckPlugin.initialState).toBe("function");
    expect(typeof cutTheDeckPlugin.reducer).toBe("function");
    expect(typeof cutTheDeckPlugin.isTerminal).toBe("function");
    expect(cutTheDeckPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh game", () => {
    const a = cutTheDeckPlugin.initialState(123, S);
    const b = cutTheDeckPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.prediction).toBeNull();
    expect(a.card).toBeNull();
    expect(a.phase).toBe("predict");
    expect(cutTheDeckPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when terminal", () => {
    expect(typeof cutTheDeckPlugin.hint).toBe("function");
    const state = cutTheDeckPlugin.initialState(7, S);
    const result = cutTheDeckPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-cut-the-deck-primary"\]$/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force terminal phase to exercise the null branch of hint().
    const done: CutTheDeckState = { ...state, phase: "done" };
    expect(cutTheDeckPlugin.isTerminal(done)).toEqual({ score: done.score });
    expect(cutTheDeckPlugin.hint!(done)).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { cardZipPlugin } from "./index.js";
import type { CardZipState } from "./state.js";

const S = { dummy: false } as never;

describe("card-zip plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardZipPlugin.id).toBe("card-zip");
    expect(cardZipPlugin.title).toBe("Card Zip");
    expect(cardZipPlugin.category).toBe("cards");
    expect(cardZipPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardZipPlugin.description).toBe("string");
    expect(cardZipPlugin.description.length).toBeGreaterThan(0);
    expect(typeof cardZipPlugin.howToPlay).toBe("string");
    expect(cardZipPlugin.settings).toBeDefined();
    expect(typeof cardZipPlugin.settings).toBe("object");
    expect(typeof cardZipPlugin.initialState).toBe("function");
    expect(typeof cardZipPlugin.reducer).toBe("function");
    expect(typeof cardZipPlugin.isTerminal).toBe("function");
    expect(cardZipPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cardZipPlugin.initialState(42, S);
    const b = cardZipPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.hand).toEqual([]);
    expect(a.ascCount).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("dealing");
    expect(a.lastPts).toBe(0);
    expect(cardZipPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for non-terminal state and null when terminal", () => {
    expect(typeof cardZipPlugin.hint).toBe("function");
    const state = cardZipPlugin.initialState(5, S);
    const result = cardZipPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-zip-primary"]');
      expect(result.pulses).toBe(3);
    }

    const terminal: CardZipState = { ...state, phase: "done" };
    expect(cardZipPlugin.isTerminal(terminal)).toEqual({ score: terminal.score });
    expect(cardZipPlugin.hint!(terminal)).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { cardGlacierPlugin } from "./index.js";
import type { CardGlacierState } from "./state.js";

const S = { dummy: false };

describe("card-glacier plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardGlacierPlugin.id).toBe("card-glacier");
    expect(cardGlacierPlugin.title).toBe("Card Glacier");
    expect(cardGlacierPlugin.category).toBe("cards");
    expect(cardGlacierPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardGlacierPlugin.description).toBe("string");
    expect(cardGlacierPlugin.description.length).toBeGreaterThan(0);
    expect(cardGlacierPlugin.settings).toBeDefined();
    expect(typeof cardGlacierPlugin.settings).toBe("object");
    expect(typeof cardGlacierPlugin.initialState).toBe("function");
    expect(typeof cardGlacierPlugin.reducer).toBe("function");
    expect(typeof cardGlacierPlugin.isTerminal).toBe("function");
    expect(cardGlacierPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cardGlacierPlugin.initialState(1234, S);
    const b = cardGlacierPlugin.initialState(1234, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.card).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("draw");
    expect(cardGlacierPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null when the game is done", () => {
    expect(typeof cardGlacierPlugin.hint).toBe("function");
    const state = cardGlacierPlugin.initialState(7, S);
    const result = cardGlacierPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-glacier-primary"]');
      expect(result.pulses).toBe(3);
    }

    // When the state reports done, hint() must fall through to null.
    const finished: CardGlacierState = { ...state, phase: "done" };
    expect(cardGlacierPlugin.isTerminal(finished)).toEqual({ score: finished.score });
    expect(cardGlacierPlugin.hint!(finished)).toBeNull();
  });
});

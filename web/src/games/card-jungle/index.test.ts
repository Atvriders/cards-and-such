import { describe, it, expect } from "vitest";
import { cardJunglePlugin } from "./index.js";
import type { CardJungleState } from "./state.js";

const S = { dummy: false } as never;

describe("card-jungle plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardJunglePlugin.id).toBe("card-jungle");
    expect(cardJunglePlugin.title).toBe("Card Jungle");
    expect(cardJunglePlugin.category).toBe("cards");
    expect(cardJunglePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardJunglePlugin.description).toBe("string");
    expect(cardJunglePlugin.description.length).toBeGreaterThan(0);
    expect(cardJunglePlugin.settings).toBeDefined();
    expect(typeof cardJunglePlugin.settings).toBe("object");
    expect(typeof cardJunglePlugin.initialState).toBe("function");
    expect(typeof cardJunglePlugin.reducer).toBe("function");
    expect(typeof cardJunglePlugin.isTerminal).toBe("function");
    expect(cardJunglePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = cardJunglePlugin.initialState(42, S);
    const b = cardJunglePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.card).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("draw");
    expect(cardJunglePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof cardJunglePlugin.hint).toBe("function");
    const state = cardJunglePlugin.initialState(5, S);
    const result = cardJunglePlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-jungle-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // When the game is terminal (phase === "done"), hint() should return null.
    const finished: CardJungleState = { ...state, phase: "done" };
    expect(cardJunglePlugin.isTerminal(finished)).toEqual({ score: finished.score });
    expect(cardJunglePlugin.hint!(finished)).toBeNull();
  });
});

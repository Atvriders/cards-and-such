import { describe, it, expect } from "vitest";
import { cardSavannaPlugin } from "./index.js";
import type { CardSavannaState } from "./state.js";

const S = { dummy: false } as never;

describe("card-savanna plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardSavannaPlugin.id).toBe("card-savanna");
    expect(cardSavannaPlugin.title).toBe("Card Savanna");
    expect(cardSavannaPlugin.category).toBe("cards");
    expect(cardSavannaPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardSavannaPlugin.description).toBe("string");
    expect(cardSavannaPlugin.description.length).toBeGreaterThan(0);
    expect(cardSavannaPlugin.settings).toBeDefined();
    expect(typeof cardSavannaPlugin.settings).toBe("object");
    expect(typeof cardSavannaPlugin.initialState).toBe("function");
    expect(typeof cardSavannaPlugin.reducer).toBe("function");
    expect(typeof cardSavannaPlugin.isTerminal).toBe("function");
    expect(cardSavannaPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardSavannaPlugin.initialState(42, S);
    const b = cardSavannaPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.card).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("draw");
    expect(cardSavannaPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null on a terminal state", () => {
    expect(typeof cardSavannaPlugin.hint).toBe("function");
    const state = cardSavannaPlugin.initialState(5, S);
    const result = cardSavannaPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-savanna-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const doneState: CardSavannaState = { ...state, phase: "done" };
    expect(cardSavannaPlugin.isTerminal(doneState)).toEqual({ score: doneState.score });
    expect(cardSavannaPlugin.hint!(doneState)).toBeNull();
  });
});

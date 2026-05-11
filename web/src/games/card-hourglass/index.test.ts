import { describe, it, expect } from "vitest";
import { cardHourglassPlugin } from "./index.js";

const S = { dummy: false } as const;

describe("card-hourglass plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardHourglassPlugin.id).toBe("card-hourglass");
    expect(cardHourglassPlugin.title).toBe("Card Hourglass");
    expect(cardHourglassPlugin.category).toBe("cards");
    expect(cardHourglassPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardHourglassPlugin.description).toBe("string");
    expect(cardHourglassPlugin.description.length).toBeGreaterThan(0);
    expect(cardHourglassPlugin.settings).toBeDefined();
    expect(typeof cardHourglassPlugin.settings).toBe("object");
    expect(typeof cardHourglassPlugin.initialState).toBe("function");
    expect(typeof cardHourglassPlugin.reducer).toBe("function");
    expect(typeof cardHourglassPlugin.isTerminal).toBe("function");
    expect(cardHourglassPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardHourglassPlugin.initialState(42, S);
    const b = cardHourglassPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.lastPts).toBe(0);
    expect(a.hand).toEqual([]);
    expect(a.phase).toBe("dealing");
    expect(cardHourglassPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null when terminal", () => {
    expect(typeof cardHourglassPlugin.hint).toBe("function");
    const state = cardHourglassPlugin.initialState(7, S);
    const result = cardHourglassPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-hourglass-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force terminal: phase "done" causes isTerminal to return non-null and hint to return null.
    const doneState = { ...state, phase: "done" as const };
    expect(cardHourglassPlugin.isTerminal(doneState)).toEqual({ score: doneState.score });
    expect(cardHourglassPlugin.hint!(doneState)).toBeNull();
  });
});

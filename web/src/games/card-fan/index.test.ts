import { describe, it, expect } from "vitest";
import { cardFanPlugin } from "./index.js";

const S = { dummy: false };

describe("card-fan plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardFanPlugin.id).toBe("card-fan");
    expect(cardFanPlugin.title).toBe("Card Fan");
    expect(cardFanPlugin.category).toBe("cards");
    expect(cardFanPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardFanPlugin.description).toBe("string");
    expect(cardFanPlugin.description.length).toBeGreaterThan(0);
    expect(typeof cardFanPlugin.howToPlay).toBe("string");
    expect(cardFanPlugin.settings).toBeDefined();
    expect(typeof cardFanPlugin.initialState).toBe("function");
    expect(typeof cardFanPlugin.reducer).toBe("function");
    expect(typeof cardFanPlugin.isTerminal).toBe("function");
    expect(typeof cardFanPlugin.hint).toBe("function");
    expect(cardFanPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null while playing", () => {
    const a = cardFanPlugin.initialState(123, S);
    const b = cardFanPlugin.initialState(123, S);
    expect(a.hand).toEqual(b.hand);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.hand.length).toBe(5);
    expect(new Set(a.hand).size).toBe(5);
    for (const c of a.hand) {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThan(52);
    }
    expect(a.round).toBe(1);
    expect(a.pick).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("choose");
    expect(a.lastWin).toBe(false);
    expect(cardFanPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when terminal", () => {
    const state = cardFanPlugin.initialState(7, S);
    const playingHint = cardFanPlugin.hint!(state);
    expect(playingHint).not.toBeNull();
    expect(playingHint!.selector).toBe('[data-testid="hint-target-card-fan-primary"]');
    expect(playingHint!.pulses).toBe(3);

    const doneState = { ...state, phase: "done" as const };
    expect(cardFanPlugin.hint!(doneState)).toBeNull();
    expect(cardFanPlugin.isTerminal(doneState)).toEqual({ score: 0 });
  });
});

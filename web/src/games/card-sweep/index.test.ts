import { describe, it, expect } from "vitest";
import { cardSweepPlugin } from "./index.js";
import type { CardSweepState } from "./state.js";

const S = { dummy: false } as never;

describe("card-sweep plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardSweepPlugin.id).toBe("card-sweep");
    expect(cardSweepPlugin.title).toBe("Card Sweep");
    expect(cardSweepPlugin.category).toBe("cards");
    expect(cardSweepPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardSweepPlugin.description).toBe("string");
    expect(cardSweepPlugin.description.length).toBeGreaterThan(0);
    expect(cardSweepPlugin.settings).toBeDefined();
    expect(typeof cardSweepPlugin.settings).toBe("object");
    expect(typeof cardSweepPlugin.initialState).toBe("function");
    expect(typeof cardSweepPlugin.reducer).toBe("function");
    expect(typeof cardSweepPlugin.isTerminal).toBe("function");
    expect(cardSweepPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cardSweepPlugin.initialState(42, S);
    const b = cardSweepPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.card).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("draw");
    expect(a.lastWin).toBe(false);
    expect(a.lastPts).toBe(0);
    expect(cardSweepPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a non-terminal state and null on a terminal state", () => {
    expect(typeof cardSweepPlugin.hint).toBe("function");
    const state = cardSweepPlugin.initialState(5, S);
    const result = cardSweepPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-sweep-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force terminal phase to exercise the `null` branch of hint.
    const done: CardSweepState = { ...state, phase: "done" };
    expect(cardSweepPlugin.isTerminal(done)).toEqual({ score: done.score });
    expect(cardSweepPlugin.hint!(done)).toBeNull();
  });
});

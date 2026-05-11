import { describe, it, expect } from "vitest";
import { cardTemplePlugin } from "./index.js";
import type { CardTempleState } from "./state.js";

const S = { dummy: false } as never;

describe("card-temple plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardTemplePlugin.id).toBe("card-temple");
    expect(cardTemplePlugin.title).toBe("Card Temple");
    expect(cardTemplePlugin.category).toBe("cards");
    expect(cardTemplePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardTemplePlugin.description).toBe("string");
    expect(cardTemplePlugin.description.length).toBeGreaterThan(0);
    expect(cardTemplePlugin.settings).toBeDefined();
    expect(typeof cardTemplePlugin.settings).toBe("object");
    expect(typeof cardTemplePlugin.initialState).toBe("function");
    expect(typeof cardTemplePlugin.reducer).toBe("function");
    expect(typeof cardTemplePlugin.isTerminal).toBe("function");
    expect(cardTemplePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cardTemplePlugin.initialState(42, S);
    const b = cardTemplePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.card).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("draw");
    expect(a.lastPts).toBe(0);
    expect(a.rngSeed).toBe(42);
    expect(cardTemplePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on active state and null when terminal", () => {
    expect(typeof cardTemplePlugin.hint).toBe("function");
    const state = cardTemplePlugin.initialState(7, S);
    const result = cardTemplePlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-temple-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force terminal state to exercise the null branch of hint().
    const finished: CardTempleState = { ...state, phase: "done" };
    expect(cardTemplePlugin.isTerminal(finished)).not.toBeNull();
    expect(cardTemplePlugin.hint!(finished)).toBeNull();
  });
});

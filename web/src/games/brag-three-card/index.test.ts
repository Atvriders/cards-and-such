import { describe, it, expect } from "vitest";
import { bragThreeCardPlugin } from "./index.js";
import type { BragThreeCardState } from "./state.js";

const S = { dummy: true } as { dummy: boolean };

describe("brag-three-card plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bragThreeCardPlugin.id).toBe("brag-three-card");
    expect(bragThreeCardPlugin.title).toBe("Three Card Brag");
    expect(bragThreeCardPlugin.category).toBe("arcade");
    expect(bragThreeCardPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bragThreeCardPlugin.description).toBe("string");
    expect(bragThreeCardPlugin.description.length).toBeGreaterThan(0);
    expect(bragThreeCardPlugin.settings).toBeDefined();
    expect(typeof bragThreeCardPlugin.settings).toBe("object");
    expect(typeof bragThreeCardPlugin.initialState).toBe("function");
    expect(typeof bragThreeCardPlugin.reducer).toBe("function");
    expect(typeof bragThreeCardPlugin.isTerminal).toBe("function");
    expect(bragThreeCardPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = bragThreeCardPlugin.initialState(42, S);
    const b = bragThreeCardPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.dice).toBeNull();
    expect(a.phase).toBe("rolling");
    expect(a.rngSeed).toBe(42);
    expect(bragThreeCardPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null when game is done", () => {
    expect(typeof bragThreeCardPlugin.hint).toBe("function");
    const state = bragThreeCardPlugin.initialState(7, S);
    const result = bragThreeCardPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-brag-three-card-action"]');
      expect(result.pulses).toBe(3);
    }

    const finished: BragThreeCardState = { ...state, phase: "done" };
    expect(bragThreeCardPlugin.hint!(finished)).toBeNull();
  });
});

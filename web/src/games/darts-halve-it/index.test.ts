import { describe, it, expect } from "vitest";
import { dartsHalveItPlugin } from "./index.js";
import type { DartsHalveItState } from "./state.js";

const S = { dummy: true } as never;

describe("darts-halve-it plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(dartsHalveItPlugin.id).toBe("darts-halve-it");
    expect(dartsHalveItPlugin.title).toBe("Classic Halve-It");
    expect(dartsHalveItPlugin.category).toBe("arcade");
    expect(dartsHalveItPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dartsHalveItPlugin.description).toBe("string");
    expect(dartsHalveItPlugin.description.length).toBeGreaterThan(0);
    expect(dartsHalveItPlugin.settings).toBeDefined();
    expect(typeof dartsHalveItPlugin.settings).toBe("object");
    expect(typeof dartsHalveItPlugin.initialState).toBe("function");
    expect(typeof dartsHalveItPlugin.reducer).toBe("function");
    expect(typeof dartsHalveItPlugin.isTerminal).toBe("function");
    expect(dartsHalveItPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = dartsHalveItPlugin.initialState(42, S);
    const b = dartsHalveItPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.lastPts).toBe(0);
    expect(a.score).toBe(0);
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(a.phase).toBe("rolling");
    expect(a.total).toBe(0);
    expect(dartsHalveItPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on active state and null when game is done", () => {
    expect(typeof dartsHalveItPlugin.hint).toBe("function");
    const state = dartsHalveItPlugin.initialState(5, S);
    const result = dartsHalveItPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-darts-halve-it-action"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const done: DartsHalveItState = { ...state, phase: "done" };
    expect(dartsHalveItPlugin.hint!(done)).toBeNull();
    expect(dartsHalveItPlugin.isTerminal(done)).toEqual({ score: 0 });
  });
});

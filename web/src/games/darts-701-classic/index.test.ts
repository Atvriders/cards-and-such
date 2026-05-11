import { describe, it, expect } from "vitest";
import { darts701ClassicPlugin } from "./index.js";
import type { Darts701ClassicState } from "./state.js";

const S = { dummy: true } as never;

describe("darts-701-classic plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(darts701ClassicPlugin.id).toBe("darts-701-classic");
    expect(darts701ClassicPlugin.title).toBe("Classic 701 Darts");
    expect(darts701ClassicPlugin.category).toBe("arcade");
    expect(darts701ClassicPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof darts701ClassicPlugin.description).toBe("string");
    expect(darts701ClassicPlugin.description.length).toBeGreaterThan(0);
    expect(darts701ClassicPlugin.settings).toBeDefined();
    expect(typeof darts701ClassicPlugin.settings).toBe("object");
    expect(typeof darts701ClassicPlugin.initialState).toBe("function");
    expect(typeof darts701ClassicPlugin.reducer).toBe("function");
    expect(typeof darts701ClassicPlugin.isTerminal).toBe("function");
    expect(darts701ClassicPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = darts701ClassicPlugin.initialState(42, S);
    const b = darts701ClassicPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.remaining).toBe(701);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.finished).toBe(false);
    expect(darts701ClassicPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on active state and null when game is done", () => {
    expect(typeof darts701ClassicPlugin.hint).toBe("function");
    const state = darts701ClassicPlugin.initialState(5, S);
    const result = darts701ClassicPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-darts-701-classic-action"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const done: Darts701ClassicState = { ...state, phase: "done" };
    expect(darts701ClassicPlugin.hint!(done)).toBeNull();
    expect(darts701ClassicPlugin.isTerminal(done)).toEqual({ score: 0 });
  });
});

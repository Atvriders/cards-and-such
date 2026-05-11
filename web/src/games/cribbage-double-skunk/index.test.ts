import { describe, it, expect } from "vitest";
import { cribbageDoubleSkunkPlugin } from "./index.js";
import type { CribbageDoubleSkunkState } from "./state.js";

const S = { dummy: true } as never;

describe("cribbage-double-skunk plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cribbageDoubleSkunkPlugin.id).toBe("cribbage-double-skunk");
    expect(cribbageDoubleSkunkPlugin.title).toBe("Cribbage Double Skunk");
    expect(cribbageDoubleSkunkPlugin.category).toBe("arcade");
    expect(cribbageDoubleSkunkPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cribbageDoubleSkunkPlugin.description).toBe("string");
    expect(cribbageDoubleSkunkPlugin.description.length).toBeGreaterThan(0);
    expect(cribbageDoubleSkunkPlugin.settings).toBeDefined();
    expect(typeof cribbageDoubleSkunkPlugin.settings).toBe("object");
    expect(typeof cribbageDoubleSkunkPlugin.initialState).toBe("function");
    expect(typeof cribbageDoubleSkunkPlugin.reducer).toBe("function");
    expect(typeof cribbageDoubleSkunkPlugin.isTerminal).toBe("function");
    expect(cribbageDoubleSkunkPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cribbageDoubleSkunkPlugin.initialState(42, S);
    const b = cribbageDoubleSkunkPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.myPeg).toBe(0);
    expect(a.cpuPeg).toBe(0);
    expect(a.dice).toBeNull();
    expect(a.phase).toBe("rolling");
    expect(cribbageDoubleSkunkPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof cribbageDoubleSkunkPlugin.hint).toBe("function");
    const state = cribbageDoubleSkunkPlugin.initialState(5, S);
    const result = cribbageDoubleSkunkPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the terminal "done" branch in hint() to return null.
    const finished: CribbageDoubleSkunkState = { ...state, phase: "done" };
    expect(cribbageDoubleSkunkPlugin.hint!(finished)).toBeNull();
  });
});

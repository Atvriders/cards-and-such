import { describe, it, expect } from "vitest";
import { countingBearsPlugin } from "./index.js";
import type { CountingSettings } from "./state.js";

const S: CountingSettings = { difficulty: "easy" };

describe("counting-bears plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(countingBearsPlugin.id).toBe("counting-bears");
    expect(countingBearsPlugin.title).toBe("Counting Bears");
    expect(countingBearsPlugin.category).toBe("arcade");
    expect(countingBearsPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof countingBearsPlugin.description).toBe("string");
    expect(countingBearsPlugin.description.length).toBeGreaterThan(0);
    expect(countingBearsPlugin.settings).toBeDefined();
    expect(typeof countingBearsPlugin.settings).toBe("object");
    expect(typeof countingBearsPlugin.initialState).toBe("function");
    expect(typeof countingBearsPlugin.reducer).toBe("function");
    expect(typeof countingBearsPlugin.isTerminal).toBe("function");
    expect(countingBearsPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh round", () => {
    const a = countingBearsPlugin.initialState(123, S);
    const b = countingBearsPlugin.initialState(123, S);
    expect(a.roundNum).toBe(1);
    expect(a.totalRounds).toBe(5);
    expect(a.score).toBe(0);
    expect(a.done).toBe(false);
    expect(a.round.bears).toEqual(b.round.bears);
    expect(a.round.targetColor).toBe(b.round.targetColor);
    expect(a.round.correctCount).toBe(b.round.correctCount);
    expect(a.round.choices).toEqual(b.round.choices);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(countingBearsPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with a non-empty selector while playing and null once done", () => {
    expect(typeof countingBearsPlugin.hint).toBe("function");
    const state = countingBearsPlugin.initialState(7, S);
    const result = countingBearsPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe(".cb-choice-btn");
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    // Once the game is done, hint must return null.
    const finished = { ...state, done: true };
    expect(countingBearsPlugin.hint!(finished)).toBeNull();
  });
});

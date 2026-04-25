import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DicePoolMatchState } from "./state.js";

describe("DicePoolMatch initialState", () => {
  it("starts at round 1 with 2 rolls left", () => {
    const s = initialState(42);
    expect(s.round).toBe(1);
    expect(s.rollsLeft).toBe(2);
    expect(s.totalScore).toBe(0);
    expect(s.gameOver).toBe(false);
    expect(s.dice).toHaveLength(5);
  });

  it("is deterministic", () => {
    expect(initialState(7)).toEqual(initialState(7));
  });
});

describe("DicePoolMatch roll", () => {
  it("decreases rolls left", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.rollsLeft).toBe(1);
  });

  it("advances round when rolls run out", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "roll" }); // roll 1
    const s3 = reducer(s2, { type: "roll" }); // roll 2 -> round ends
    expect(s3.round).toBe(2);
  });
});

describe("DicePoolMatch toggleKeep", () => {
  it("toggles a die's kept state", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "toggleKeep", index: 2 });
    expect(s2.kept[2]).toBe(true);
    const s3 = reducer(s2, { type: "toggleKeep", index: 2 });
    expect(s3.kept[2]).toBe(false);
  });

  it("ignores toggle when rolls left is 0", () => {
    const s: DicePoolMatchState = { ...initialState(1), rollsLeft: 0 };
    const s2 = reducer(s, { type: "toggleKeep", index: 0 });
    expect(s2.kept[0]).toBe(false);
  });
});

describe("DicePoolMatch isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(5))).toBeNull();
  });

  it("returns total score when game over", () => {
    const s: DicePoolMatchState = { ...initialState(1), gameOver: true, totalScore: 350 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(350);
  });
});

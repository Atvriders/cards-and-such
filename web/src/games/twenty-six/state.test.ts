import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { rounds: "1" as const };

describe("TwentySix initialState", () => {
  it("starts in chooseTarget phase with no rolls", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("chooseTarget");
    expect(s.targetNumber).toBeNull();
    expect(s.rolls).toHaveLength(0);
    expect(s.hitCount).toBe(0);
  });

  it("is deterministic", () => {
    expect(initialState(7, settings)).toEqual(initialState(7, settings));
  });
});

describe("TwentySix chooseTarget", () => {
  it("sets target and moves to rolling phase", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "chooseTarget", num: 3 });
    expect(s2.targetNumber).toBe(3);
    expect(s2.phase).toBe("rolling");
  });

  it("ignores invalid targets", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "chooseTarget", num: 7 });
    expect(s2).toBe(s);
  });
});

describe("TwentySix roll", () => {
  it("each roll adds 10 dice", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "chooseTarget", num: 4 });
    s = reducer(s, { type: "roll" });
    expect(s.rolls).toHaveLength(1);
    expect(s.rolls[0]).toHaveLength(10);
  });

  it("after 13 rolls phase becomes roundOver", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "chooseTarget", num: 1 });
    for (let i = 0; i < 13; i++) {
      s = reducer(s, { type: "roll" });
    }
    expect(s.phase).toBe("roundOver");
    expect(s.rollIndex).toBe(13);
  });

  it("hitCount tracks number matches", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "chooseTarget", num: 6 });
    for (let i = 0; i < 13; i++) {
      s = reducer(s, { type: "roll" });
    }
    // hitCount should be number of 6s across all rolls
    let expected = 0;
    for (const roll of s.rolls) {
      expected += roll.filter((v) => v === 6).length;
    }
    expect(s.hitCount).toBe(expected);
  });
});

describe("TwentySix isTerminal", () => {
  it("null when not done", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "chooseTarget", num: 3 });
    for (let i = 0; i < 13; i++) {
      s = reducer(s, { type: "roll" });
    }
    s = reducer(s, { type: "nextRound" });
    // Phase should be "done" since rounds=1
    expect(s.phase).toBe("done");
    const result = isTerminal(s);
    expect(result).not.toBeNull();
  });
});

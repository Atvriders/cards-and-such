import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeCowboyScore, totalCowboyScore } from "./state.js";
import type { CowboyDiceState } from "./state.js";

const defaultSettings = { bonusThreshold: "63" as const };

describe("CowboyDice initialState", () => {
  it("starts at round 1 with 5 dice and no scores", () => {
    const s = initialState(42, defaultSettings);
    expect(s.round).toBe(1);
    expect(s.dice.length).toBe(5);
    expect(Object.keys(s.scores).length).toBe(0);
  });

  it("is deterministic", () => {
    expect(initialState(99, defaultSettings)).toEqual(initialState(99, defaultSettings));
  });
});

describe("CowboyDice roll", () => {
  it("produces 5 dice and increments rollsUsed", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.dice.length).toBe(5);
    expect(s2.rollsUsed).toBe(1);
  });

  it("caps at 3 rolls per round", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    const snap = s.dice.map((d) => d.value);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.dice.map((d) => d.value)).toEqual(snap);
    expect(s2.rollsUsed).toBe(3);
  });
});

describe("CowboyDice scoring", () => {
  function withDice(values: [1|2|3|4|5|6, 1|2|3|4|5|6, 1|2|3|4|5|6, 1|2|3|4|5|6, 1|2|3|4|5|6]): CowboyDiceState {
    return {
      ...initialState(42, defaultSettings),
      rollsUsed: 1,
      dice: values.map((v) => ({ value: v, kept: false })),
    };
  }

  it("bullets scores sum of 1s", () => {
    const s = withDice([1, 1, 3, 4, 5]);
    expect(computeCowboyScore(s.dice, "bullets")).toBe(2);
  });

  it("rodeo scores 80 for five of a kind", () => {
    const s = withDice([3, 3, 3, 3, 3]);
    expect(computeCowboyScore(s.dice, "rodeo")).toBe(80);
  });

  it("showdown scores 25 for full house", () => {
    const s = withDice([2, 2, 2, 5, 5]);
    expect(computeCowboyScore(s.dice, "showdown")).toBe(25);
  });

  it("frontier scores sum of all dice", () => {
    const s = withDice([1, 2, 3, 4, 5]);
    expect(computeCowboyScore(s.dice, "frontier")).toBe(15);
  });

  it("roundup scores 50 for 1-5 straight", () => {
    const s = withDice([1, 2, 3, 4, 5]);
    expect(computeCowboyScore(s.dice, "roundup")).toBe(50);
  });

  it("totalCowboyScore adds 35 bonus when upper >= threshold", () => {
    const scores = { bullets: 5, horseshoes: 10, cactus: 15, spurs: 12, lasso: 15, sheriff: 6 };
    const upper = 5 + 10 + 15 + 12 + 15 + 6; // 63
    expect(upper).toBeGreaterThanOrEqual(63);
    const total = totalCowboyScore(scores, 63);
    expect(total).toBe(upper + 35);
  });
});

describe("CowboyDice isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score when all categories scored", () => {
    const base = initialState(42, defaultSettings);
    const scores = {
      bullets: 3, horseshoes: 6, cactus: 9, spurs: 16, lasso: 20, sheriff: 18,
      posse: 14, outlaw: 20, showdown: 25, rodeo: 80, roundup: 50, frontier: 20,
    };
    const won: CowboyDiceState = { ...base, round: 13, scores };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });
});

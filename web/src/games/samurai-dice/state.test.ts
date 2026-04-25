import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeSamuraiScore, totalSamuraiScore } from "./state.js";
import type { SamuraiDiceState } from "./state.js";

const defaultSettings = { rounds: "8" as const };

describe("SamuraiDice initialState", () => {
  it("starts at round 1 with 5 dice", () => {
    const s = initialState(42, defaultSettings);
    expect(s.round).toBe(1);
    expect(s.dice.length).toBe(5);
    expect(Object.keys(s.scores).length).toBe(0);
    expect(s.rollsUsed).toBe(0);
  });

  it("is deterministic", () => {
    expect(initialState(17, defaultSettings)).toEqual(initialState(17, defaultSettings));
  });
});

describe("SamuraiDice roll", () => {
  it("rolls 5 dice and sets rollsUsed to 1", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.dice.length).toBe(5);
    expect(s2.rollsUsed).toBe(1);
  });

  it("does not roll past 3 times", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    const snap = s.dice.map((d) => d.value);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.dice.map((d) => d.value)).toEqual(snap);
  });
});

describe("SamuraiDice scoring", () => {
  function withDice(values: [1|2|3|4|5|6, 1|2|3|4|5|6, 1|2|3|4|5|6, 1|2|3|4|5|6, 1|2|3|4|5|6]): SamuraiDiceState {
    return {
      ...initialState(42, defaultSettings),
      rollsUsed: 1,
      dice: values.map((v) => ({ value: v, kept: false })),
    };
  }

  it("bushido scores 100 for five of a kind", () => {
    const s = withDice([6, 6, 6, 6, 6]);
    expect(computeSamuraiScore(s.dice, "bushido")).toBe(100);
  });

  it("katana scores 70 for large straight", () => {
    const s = withDice([1, 2, 3, 4, 5]);
    expect(computeSamuraiScore(s.dice, "katana")).toBe(70);
  });

  it("seppuku scores 35 for full house", () => {
    const s = withDice([3, 3, 3, 5, 5]);
    expect(computeSamuraiScore(s.dice, "seppuku")).toBe(35);
  });

  it("ronin scores sum of all dice", () => {
    const s = withDice([2, 3, 4, 5, 6]);
    expect(computeSamuraiScore(s.dice, "ronin")).toBe(20);
  });

  it("cannot score same category twice", () => {
    const s: SamuraiDiceState = {
      ...initialState(42, defaultSettings),
      rollsUsed: 1,
      scores: { ronin: 15 },
      dice: [{ value: 3, kept: false }, { value: 3, kept: false }, { value: 3, kept: false }, { value: 3, kept: false }, { value: 3, kept: false }],
    };
    const s2 = reducer(s, { type: "score", category: "ronin" });
    expect(s2.scores["ronin"]).toBe(15);
  });
});

describe("SamuraiDice isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score when all categories scored", () => {
    const base = initialState(42, defaultSettings);
    const won: SamuraiDiceState = {
      ...base,
      round: 9,
      scores: { honor: 18, bushido: 100, katana: 70, wakizashi: 40, dojo: 80, clan: 30, seppuku: 35, ronin: 18 },
    };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(totalSamuraiScore(won.scores));
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeMedievalScore, totalMedievalScore } from "./state.js";
import type { MedievalDiceState } from "./state.js";

const defaultSettings = { rounds: "8" as const };

describe("MedievalDice initialState", () => {
  it("starts at round 1 with 4 dice and no scores", () => {
    const s = initialState(42, defaultSettings);
    expect(s.round).toBe(1);
    expect(s.dice.length).toBe(4);
    expect(Object.keys(s.scores).length).toBe(0);
  });

  it("is deterministic", () => {
    expect(initialState(7, defaultSettings)).toEqual(initialState(7, defaultSettings));
  });
});

describe("MedievalDice roll", () => {
  it("produces 4 dice on first roll", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.dice.length).toBe(4);
    expect(s2.rollsUsed).toBe(1);
  });

  it("does not exceed 3 rolls per round", () => {
    let s = initialState(10, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    const snap = s.dice.map((d) => d.value);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.dice.map((d) => d.value)).toEqual(snap);
  });
});

describe("MedievalDice scoring", () => {
  it("moat scores 50 for all-even dice", () => {
    const base = initialState(42, defaultSettings);
    const withRoll: MedievalDiceState = {
      ...base,
      rollsUsed: 1,
      dice: [
        { value: 2, kept: false },
        { value: 4, kept: false },
        { value: 2, kept: false },
        { value: 6, kept: false },
      ],
    };
    expect(computeMedievalScore(withRoll.dice, "moat")).toBe(50);
    expect(computeMedievalScore(withRoll.dice, "tower")).toBe(0);
  });

  it("rampage scores sum of all dice", () => {
    const base = initialState(42, defaultSettings);
    const withRoll: MedievalDiceState = {
      ...base,
      rollsUsed: 1,
      dice: [
        { value: 3, kept: false },
        { value: 5, kept: false },
        { value: 2, kept: false },
        { value: 4, kept: false },
      ],
    };
    expect(computeMedievalScore(withRoll.dice, "rampage")).toBe(14);
  });

  it("siege scores 60 for four of a kind", () => {
    const base = initialState(42, defaultSettings);
    const withRoll: MedievalDiceState = {
      ...base,
      rollsUsed: 1,
      dice: [
        { value: 5, kept: false },
        { value: 5, kept: false },
        { value: 5, kept: false },
        { value: 5, kept: false },
      ],
    };
    expect(computeMedievalScore(withRoll.dice, "siege")).toBe(60);
  });

  it("cannot score same category twice", () => {
    const base = initialState(42, defaultSettings);
    const withScore: MedievalDiceState = {
      ...base,
      rollsUsed: 1,
      scores: { rampage: 10 },
      dice: [{ value: 1, kept: false }, { value: 2, kept: false }, { value: 3, kept: false }, { value: 4, kept: false }],
    };
    const s2 = reducer(withScore, { type: "score", category: "rampage" });
    expect(s2.scores["rampage"]).toBe(10);
  });
});

describe("MedievalDice isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score when all categories scored", () => {
    const base = initialState(42, defaultSettings);
    const won: MedievalDiceState = {
      ...base,
      round: 9,
      scores: { peasants: 5, knights: 14, siege: 60, catapult: 45, moat: 50, tower: 50, castle: 16, rampage: 18 },
    };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(totalMedievalScore(won.scores));
  });
});

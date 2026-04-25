import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeCosmicScore, totalCosmicScore } from "./state.js";
import type { CosmicDiceState } from "./state.js";

const defaultSettings = { rounds: "7" as const };

describe("CosmicDice initialState", () => {
  it("starts at round 1 with no scores", () => {
    const s = initialState(42, defaultSettings);
    expect(s.round).toBe(1);
    expect(s.rollsUsed).toBe(0);
    expect(Object.keys(s.scores).length).toBe(0);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("CosmicDice roll", () => {
  it("produces 5 dice after first roll", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.dice.length).toBe(5);
    expect(s2.rollsUsed).toBe(1);
  });

  it("does not roll more than 3 times per round", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    const before = s.dice.map((d) => d.value);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.dice.map((d) => d.value)).toEqual(before);
    expect(s2.rollsUsed).toBe(3);
  });

  it("same seed produces same rolls", () => {
    const s = initialState(7, defaultSettings);
    const a = reducer(s, { type: "roll" });
    const b = reducer(s, { type: "roll" });
    expect(a.dice.map((d) => d.value)).toEqual(b.dice.map((d) => d.value));
  });
});

describe("CosmicDice scoring", () => {
  it("scores asteroid as sum of dice", () => {
    const base = initialState(42, defaultSettings);
    const withRoll: CosmicDiceState = {
      ...base,
      rollsUsed: 1,
      dice: [
        { value: 3, kept: false },
        { value: 4, kept: false },
        { value: 2, kept: false },
        { value: 1, kept: false },
        { value: 5, kept: false },
      ],
    };
    const pts = computeCosmicScore(withRoll.dice, "asteroid");
    expect(pts).toBe(15);
    const s2 = reducer(withRoll, { type: "score", category: "asteroid" });
    expect(s2.scores["asteroid"]).toBe(15);
    expect(s2.round).toBe(2);
    expect(s2.rollsUsed).toBe(0);
  });

  it("scores blackhole (5 of a kind) as 500", () => {
    const base = initialState(42, defaultSettings);
    const withRoll: CosmicDiceState = {
      ...base,
      rollsUsed: 1,
      dice: [
        { value: 4, kept: false },
        { value: 4, kept: false },
        { value: 4, kept: false },
        { value: 4, kept: false },
        { value: 4, kept: false },
      ],
    };
    expect(computeCosmicScore(withRoll.dice, "blackhole")).toBe(500);
  });

  it("galaxy (all different) scores 150", () => {
    const base = initialState(42, defaultSettings);
    const withRoll: CosmicDiceState = {
      ...base,
      rollsUsed: 1,
      dice: [
        { value: 1, kept: false },
        { value: 2, kept: false },
        { value: 3, kept: false },
        { value: 4, kept: false },
        { value: 5, kept: false },
      ],
    };
    expect(computeCosmicScore(withRoll.dice, "galaxy")).toBe(150);
  });

  it("cannot score same category twice", () => {
    const base = initialState(42, defaultSettings);
    const withScore: CosmicDiceState = {
      ...base,
      rollsUsed: 1,
      scores: { asteroid: 12 },
      dice: [{ value: 3, kept: false }, { value: 3, kept: false }, { value: 3, kept: false }, { value: 3, kept: false }, { value: 3, kept: false }],
    };
    const s2 = reducer(withScore, { type: "score", category: "asteroid" });
    expect(s2.scores["asteroid"]).toBe(12); // unchanged
  });
});

describe("CosmicDice isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all categories filled", () => {
    const base = initialState(42, defaultSettings);
    const won: CosmicDiceState = {
      ...base,
      round: 8,
      scores: { nebula: 90, supernova: 120, blackhole: 500, galaxy: 150, comet: 200, asteroid: 18, cosmos: 100 },
    };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(totalCosmicScore(won.scores));
  });
});

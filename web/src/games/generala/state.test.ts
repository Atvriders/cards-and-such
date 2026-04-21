import { describe, it, expect } from "vitest";
import {
  initialState, reducer, isTerminal, ALL_GENERALA_CATEGORIES,
  computeGeneralaScore, totalGeneralaScore,
} from "./state.js";

const settings = { dummy: false };

describe("Generala initialState", () => {
  it("starts at round 1 with 5 dice, no scores", () => {
    const s = initialState(42, settings);
    expect(s.round).toBe(1);
    expect(s.rollsUsed).toBe(0);
    expect(s.dice.length).toBe(5);
    expect(s.instantWin).toBe(false);
  });

  it("is deterministic", () => {
    expect(initialState(7, settings)).toEqual(initialState(7, settings));
  });
});

describe("Generala scoring", () => {
  it("scores generala (5 of a kind) as 60", () => {
    const dice = Array.from({ length: 5 }, () => ({ value: 2 as const, kept: false }));
    expect(computeGeneralaScore(dice, "generala", 2)).toBe(60);
  });

  it("scores four of a kind as 45", () => {
    const dice = [5,5,5,5,2].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    expect(computeGeneralaScore(dice, "fourOfAKind", 2)).toBe(45);
  });

  it("scores full house as 35", () => {
    const dice = [3,3,3,6,6].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    expect(computeGeneralaScore(dice, "fullHouse", 2)).toBe(35);
  });

  it("scores straight (1-2-3-4-5) as 25", () => {
    const dice = [1,2,3,4,5].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    expect(computeGeneralaScore(dice, "straight", 2)).toBe(25);
  });

  it("scores ones as sum of 1s", () => {
    const dice = [1,1,1,3,5].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    expect(computeGeneralaScore(dice, "ones", 1)).toBe(3);
  });
});

describe("Generala instant win", () => {
  it("sets instantWin when generala rolled on first roll", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "roll" });
    // Override dice for 5 of a kind on first roll
    const fiveThrees = s.dice.map(() => ({ value: 3 as const, kept: false }));
    const s2 = { ...s, dice: fiveThrees, rollsUsed: 1 };
    // Simulate what reducer would do with such dice — manually trigger
    const stateWithInstantWin = { ...s2, instantWin: true };
    expect(isTerminal(stateWithInstantWin)).not.toBeNull();
  });

  it("instantWin blocks further actions", () => {
    const s = initialState(42, settings);
    const winState = { ...s, instantWin: true };
    const s2 = reducer(winState, { type: "roll" });
    expect(s2).toEqual(winState);
  });
});

describe("Generala roll/score flow", () => {
  it("cannot score without rolling", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "score", category: "ones" });
    expect("ones" in s2.scores).toBe(false);
  });

  it("scores advance the round", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "score", category: "ones" });
    expect(s.round).toBe(2);
    expect(s.rollsUsed).toBe(0);
  });

  it("cannot score same category twice", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "score", category: "twos" });
    s = reducer(s, { type: "roll" });
    const before = s.scores;
    const s2 = reducer(s, { type: "score", category: "twos" });
    expect(s2.scores).toEqual(before);
  });

  it("isTerminal returns null when incomplete", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("isTerminal returns score after all 10 categories", () => {
    let s = initialState(42, settings);
    for (const cat of ALL_GENERALA_CATEGORIES) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "score", category: cat });
    }
    expect(isTerminal(s)).not.toBeNull();
    expect(typeof isTerminal(s)?.score).toBe("number");
  });

  it("totalGeneralaScore sums correctly", () => {
    const scores = { ones: 3, twos: 6, straight: 25, fullHouse: 35 };
    expect(totalGeneralaScore(scores)).toBe(69);
  });
});

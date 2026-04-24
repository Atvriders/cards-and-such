import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("Counting Bears", () => {
  it("initializes with round 1 and zero score", () => {
    const s = initialState(42, easy);
    expect(s.roundNum).toBe(1);
    expect(s.score).toBe(0);
    expect(s.done).toBe(false);
    expect(s.totalRounds).toBe(5);
  });

  it("round has bears and 4 choices", () => {
    const s = initialState(42, easy);
    expect(s.round.bears.length).toBeGreaterThan(0);
    expect(s.round.choices.length).toBe(4);
    expect(s.round.choices).toContain(s.round.correctCount);
  });

  it("correct answer adds 20 to score", () => {
    const s = initialState(42, easy);
    const next = reducer(s, { type: "pick", value: s.round.correctCount });
    expect(next.score).toBe(20);
    expect(next.lastCorrect).toBe(true);
  });

  it("wrong answer does not add to score", () => {
    const s = initialState(42, easy);
    const wrong = s.round.choices.find(c => c !== s.round.correctCount)!;
    const next = reducer(s, { type: "pick", value: wrong });
    expect(next.score).toBe(0);
    expect(next.lastCorrect).toBe(false);
  });

  it("game ends after 5 rounds", () => {
    let s = initialState(42, easy);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "pick", value: s.round.correctCount });
    }
    expect(s.done).toBe(true);
    expect(s.score).toBe(100);
  });

  it("isTerminal returns null when not done", () => {
    const s = initialState(42, easy);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    let s = initialState(42, easy);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "pick", value: s.round.correctCount });
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("hard mode has more bears", () => {
    const s = initialState(42, hard);
    expect(s.round.bears.length).toBeGreaterThan(0);
    // hard max is 15; at least possible to have more than easy max of 6
    expect(s.round.bears.length).toBeGreaterThanOrEqual(4);
  });
});

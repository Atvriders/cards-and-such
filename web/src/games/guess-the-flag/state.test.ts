import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, COUNTRIES } from "./state.js";

const settings = { rounds: "10" as const, difficulty: "easy" as const };

describe("GuessTheFlag initialState", () => {
  it("question has 4 choices", () => {
    const s = initialState(1, settings);
    expect(s.question.choices.length).toBe(4);
  });

  it("correct answer is in choices", () => {
    const s = initialState(1, settings);
    const { correct, choices } = s.question;
    expect(choices.some((c) => c.name === correct.name)).toBe(true);
  });

  it("choices are unique", () => {
    const s = initialState(1, settings);
    const names = s.question.choices.map((c) => c.name);
    expect(new Set(names).size).toBe(4);
  });

  it("starts at round 1", () => {
    const s = initialState(1, settings);
    expect(s.roundNumber).toBe(1);
    expect(s.totalRounds).toBe(10);
  });
});

describe("GuessTheFlag COUNTRIES", () => {
  it("has at least 40 countries", () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(40);
  });

  it("all countries have flag and name", () => {
    for (const c of COUNTRIES) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.flag.length).toBeGreaterThan(0);
    }
  });
});

describe("GuessTheFlag reducer", () => {
  it("select correct answer increments correct", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", country: s.question.correct });
    expect(s2.correct).toBe(1);
    expect(s2.isRevealed).toBe(true);
    expect(s2.streak).toBe(1);
  });

  it("select wrong answer increments wrong and resets streak", () => {
    const s = initialState(1, settings);
    const wrong = s.question.choices.find((c) => c.name !== s.question.correct.name)!;
    const s2 = reducer(s, { type: "select", country: wrong });
    expect(s2.wrong).toBe(1);
    expect(s2.streak).toBe(0);
  });

  it("cannot select after revealed", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", country: s.question.correct });
    const s3 = reducer(s2, { type: "select", country: s.question.correct });
    expect(s3.correct).toBe(1); // still 1, no double-count
  });

  it("next moves to next question", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", country: s.question.correct });
    const s3 = reducer(s2, { type: "next" });
    expect(s3.roundNumber).toBe(2);
    expect(s3.isRevealed).toBe(false);
  });

  it("next on last round sets phase done", () => {
    const s = initialState(1, settings);
    const atLast = { ...s, roundNumber: 10, isRevealed: true };
    const s2 = reducer(atLast, { type: "next" });
    expect(s2.phase).toBe("done");
  });
});

describe("GuessTheFlag isTerminal", () => {
  it("returns null while playing", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns 4 points per correct answer", () => {
    const s = initialState(1, settings);
    const done = { ...s, phase: "done" as const, correct: 7 };
    expect(isTerminal(done)).toEqual({ score: 28 });
  });
});

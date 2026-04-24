import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s5 = { rounds: "5" as const };
const s10 = { rounds: "10" as const };

describe("Rainbow Sort", () => {
  it("initializes with round 1 and zero score", () => {
    const s = initialState(42, s5);
    expect(s.roundNum).toBe(1);
    expect(s.score).toBe(0);
    expect(s.done).toBe(false);
    expect(s.totalRounds).toBe(5);
  });

  it("correct sort adds points", () => {
    const s = initialState(42, s5);
    const next = reducer(s, { type: "sort", bucket: s.current });
    expect(next.score).toBeGreaterThan(0);
    expect(next.lastCorrect).toBe(true);
  });

  it("wrong sort does not add points", () => {
    const s = initialState(42, s5);
    const wrong = s.current === "red" ? "blue" : "red";
    const next = reducer(s, { type: "sort", bucket: wrong });
    expect(next.score).toBe(0);
    expect(next.lastCorrect).toBe(false);
  });

  it("game ends after all rounds", () => {
    let s = initialState(42, s5);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "sort", bucket: s.current });
    }
    expect(s.done).toBe(true);
  });

  it("perfect game scores 100", () => {
    let s = initialState(42, s5);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "sort", bucket: s.current });
    expect(s.score).toBe(100);
  });

  it("10-round mode runs for 10 rounds", () => {
    let s = initialState(42, s10);
    expect(s.totalRounds).toBe(10);
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "sort", bucket: s.current });
    expect(s.done).toBe(true);
  });

  it("isTerminal returns null when not done", () => {
    const s = initialState(42, s5);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    let s = initialState(42, s5);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "sort", bucket: s.current });
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
});

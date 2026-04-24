import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s5 = { rounds: "5" as const };
const s15 = { rounds: "15" as const };

describe("Alphabet Catch", () => {
  it("initializes with round 1 and zero score", () => {
    const s = initialState(42, s5);
    expect(s.roundNum).toBe(1);
    expect(s.score).toBe(0);
    expect(s.done).toBe(false);
    expect(s.totalRounds).toBe(5);
  });

  it("target is an uppercase letter", () => {
    const s = initialState(42, s5);
    expect(s.target).toMatch(/^[A-Z]$/);
  });

  it("choices contain 4 letters including the target", () => {
    const s = initialState(42, s5);
    expect(s.choices.length).toBe(4);
    expect(s.choices).toContain(s.target);
  });

  it("catching the correct letter adds points", () => {
    const s = initialState(42, s5);
    const next = reducer(s, { type: "catch", letter: s.target });
    expect(next.score).toBeGreaterThan(0);
    expect(next.lastCorrect).toBe(true);
  });

  it("catching wrong letter does not add points", () => {
    const s = initialState(42, s5);
    const wrong = s.choices.find(c => c !== s.target)!;
    const next = reducer(s, { type: "catch", letter: wrong });
    expect(next.score).toBe(0);
    expect(next.lastCorrect).toBe(false);
  });

  it("game ends after all rounds", () => {
    let s = initialState(42, s5);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "catch", letter: s.target });
    expect(s.done).toBe(true);
  });

  it("isTerminal returns null when not done", () => {
    const s = initialState(42, s5);
    expect(isTerminal(s)).toBeNull();
  });

  it("15-round mode has 15 total rounds", () => {
    const s = initialState(42, s15);
    expect(s.totalRounds).toBe(15);
  });
});

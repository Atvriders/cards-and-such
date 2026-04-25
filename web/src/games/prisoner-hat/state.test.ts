import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES } from "./state.js";

describe("PrisonerHat", () => {
  it("initialState picks a valid puzzle", () => {
    const s = initialState(1, {});
    expect(s.puzzle.options.length).toBeGreaterThanOrEqual(2);
    expect(s.submitted).toBe(false);
    expect(s.selectedOption).toBeNull();
  });

  it("selectOption sets selectedOption", () => {
    const s = initialState(2, {});
    const s2 = reducer(s, { type: "selectOption", option: 1 });
    expect(s2.selectedOption).toBe(1);
  });

  it("submit with null selected does nothing", () => {
    const s = initialState(3, {});
    const s2 = reducer(s, { type: "submit" });
    expect(s2.submitted).toBe(false);
  });

  it("correct answer gives 500 points", () => {
    let s = initialState(0, {});
    s = reducer(s, { type: "selectOption", option: s.puzzle.correctOption });
    s = reducer(s, { type: "submit" });
    expect(s.correct).toBe(true);
    expect(s.score).toBe(500);
    expect(s.totalScore).toBe(500);
  });

  it("wrong answer gives 0 points", () => {
    let s = initialState(4, {});
    const wrongOpt = s.puzzle.correctOption === 0 ? 1 : 0;
    s = reducer(s, { type: "selectOption", option: wrongOpt });
    s = reducer(s, { type: "submit" });
    expect(s.correct).toBe(false);
    expect(s.score).toBe(0);
  });

  it("next resets submission state and accumulates totalScore", () => {
    let s = initialState(5, {});
    s = reducer(s, { type: "selectOption", option: s.puzzle.correctOption });
    s = reducer(s, { type: "submit" });
    expect(s.totalScore).toBe(500);
    s = reducer(s, { type: "next" });
    expect(s.submitted).toBe(false);
    expect(s.score).toBe(0);
    expect(s.totalScore).toBe(500); // accumulated preserved
  });

  it("isTerminal returns null when not submitted", () => {
    const s = initialState(6, {});
    expect(isTerminal(s)).toBeNull();
  });

  it("all puzzles have valid correctOption index", () => {
    for (const p of PUZZLES) {
      expect(p.correctOption).toBeGreaterThanOrEqual(0);
      expect(p.correctOption).toBeLessThan(p.options.length);
    }
  });
});

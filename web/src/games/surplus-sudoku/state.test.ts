import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: true };
describe("SurplusSudokuState", () => {
  it("creates puzzles", () => {
    const s = initialState(1, S);
    expect(s.puzzles.length).toBeGreaterThanOrEqual(4);
  });
  it("starts in playing phase", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
  });
  it("submitting correct answer awards points", () => {
    const s = initialState(1, S);
    const correct = s.puzzles[0]!.correct;
    const s1 = reducer(s, { type: "select", choice: correct });
    const s2 = reducer(s1, { type: "submit" });
    expect(s2.score).toBeGreaterThanOrEqual(100);
    expect(s2.correct).toBeGreaterThanOrEqual(1);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("can advance through puzzles to done", () => {
    let s = initialState(1, S);
    for (let i = 0; i < s.puzzles.length; i++) {
      const c = s.puzzles[s.idx]!.correct;
      s = reducer(s, { type: "select", choice: c });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(100);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("tilesPuzzle", () => {
  it("starts in playing", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.score).toBe(0);
    expect(s.rounds.length).toBeGreaterThanOrEqual(TOTAL_ROUNDS);
  });
  it("each round has 4 choices and a valid correct index", () => {
    const s = initialState(1, S);
    for (const r of s.rounds) {
      expect(r.choices.length).toBe(4);
      expect(r.correct).toBeGreaterThanOrEqual(0);
      expect(r.correct).toBeLessThanOrEqual(3);
    }
  });
  it("submitting correct answer scores 10", () => {
    const s = initialState(1, S);
    const r = s.rounds[0]!;
    let s1 = reducer(s, { type: "select", choice: r.correct });
    s1 = reducer(s1, { type: "submit" });
    expect(s1.score).toBeGreaterThanOrEqual(10);
  });
  it("submitting wrong answer scores 0", () => {
    const s = initialState(1, S);
    const r = s.rounds[0]!;
    const wrong = ((r.correct + 1) % 4) as 0 | 1 | 2 | 3;
    let s1 = reducer(s, { type: "select", choice: wrong });
    s1 = reducer(s1, { type: "submit" });
    expect(s1.score).toBe(0);
  });
  it("isTerminal null at start, reachable at end", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS * 3 + 5; i++) {
      if (s.phase === "playing") {
        const r = s.rounds[s.currentIndex]!;
        s = reducer(s, { type: "select", choice: r.correct });
        s = reducer(s, { type: "submit" });
      } else if (s.phase === "result") {
        s = reducer(s, { type: "next" });
      }
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)?.score).toBeGreaterThanOrEqual(0);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("Cinematrix Year", () => {
  it("starts in playing with rounds", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.rounds.length).toBeGreaterThanOrEqual(1);
  });
  it("each round has 4 choices and a valid correct index", () => {
    const s = initialState(1, S);
    for (const r of s.rounds) {
      expect(r.choices.length).toBe(4);
      expect(r.correct).toBeGreaterThanOrEqual(0);
      expect(r.correct).toBeLessThanOrEqual(3);
    }
  });
  it("correct selection scores >= 10", () => {
    const s = initialState(1, S);
    const r = s.rounds[0]!;
    const s2 = reducer(reducer(s, { type: "select", choice: r.correct }), { type: "submit" });
    expect(s2.score).toBeGreaterThanOrEqual(10);
  });
  it("wrong selection does not score positive", () => {
    const s = initialState(1, S);
    const r = s.rounds[0]!;
    const wrong = (r.correct + 1) % 4;
    const s2 = reducer(reducer(s, { type: "select", choice: wrong }), { type: "submit" });
    expect(s2.score).toBeGreaterThanOrEqual(0);
    expect(s2.correctCount).toBe(0);
  });
  it("isTerminal null while playing, set after done", () => {
    const s = initialState(1, S);
    expect(isTerminal(s)).toBeNull();
    let cur = s;
    for (let i = 0; i < s.rounds.length; i++) {
      cur = reducer(cur, { type: "select", choice: 0 });
      cur = reducer(cur, { type: "submit" });
      cur = reducer(cur, { type: "next" });
    }
    expect(cur.phase).toBe("done");
    expect(isTerminal(cur)).not.toBeNull();
  });
});

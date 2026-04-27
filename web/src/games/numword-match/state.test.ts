import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, NUMBER_WORDS, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("NumwordMatch", () => {
  it("starts in playing with 20 rounds", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.rounds.length).toBe(TOTAL_ROUNDS);
  });
  it("each round's correct word matches its digit", () => {
    const s = initialState(1, S);
    for (const r of s.rounds) {
      expect(r.choices[r.correct]).toBe(NUMBER_WORDS[r.digit]);
    }
  });
  it("correct selection scores 10", () => {
    const s = initialState(1, S);
    const r = s.rounds[0]!;
    const s2 = reducer(reducer(s, { type: "select", choice: r.correct }), { type: "submit" });
    expect(s2.score).toBeGreaterThanOrEqual(10);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});

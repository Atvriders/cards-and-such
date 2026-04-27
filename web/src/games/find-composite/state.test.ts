import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isPrime, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("FindComposite", () => {
  it("starts in playing with 20 rounds", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.rounds.length).toBe(TOTAL_ROUNDS);
  });
  it("each round's correct number is composite", () => {
    const s = initialState(1, S);
    for (const r of s.rounds) {
      expect(isPrime(r.numbers[r.correct])).toBe(false);
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

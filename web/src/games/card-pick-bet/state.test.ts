import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { rounds: "5" as const };

describe("CardPickBet", () => {
  it("starts with a top card and no next card", () => {
    const s = initialState(42, S);
    expect(s.topCard).toBeGreaterThanOrEqual(0);
    expect(s.nextCard).toBeNull();
    expect(s.phase).toBe("playing");
  });
  it("betting reveals next card", () => {
    const s = initialState(42, S);
    const s2 = reducer(s, { type: "bet", choice: "higher" });
    expect(s2.nextCard).not.toBeNull();
    expect(s2.phase).toBe("revealed");
  });
  it("correct bet scores 10", () => {
    let found = false;
    for (let seed = 0; seed < 50; seed++) {
      const s = initialState(seed, S);
      const s2 = reducer(s, { type: "bet", choice: "higher" });
      const s3 = reducer(s, { type: "bet", choice: "lower" });
      if (s2.score === 10 || s3.score === 10) { found = true; break; }
    }
    expect(found).toBe(true);
  });
  it("game ends after all rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "bet", choice: "higher" });
      s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});

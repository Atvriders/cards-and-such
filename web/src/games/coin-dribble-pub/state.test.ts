import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_TURNS } from "./state.js";

const S = { dummy: false };

describe("CoinDribble", () => {
  it("starts at turn 1, score 0", () => {
    const s = initialState(1, S);
    expect(s.turn).toBe(1);
    expect(s.score).toBe(0);
    expect(s.phase).toBe("ready");
  });
  it("throw moves to thrown or done", () => {
    const s = reducer(initialState(1, S), { type: "throw" });
    expect(["thrown", "done"]).toContain(s.phase);
  });
  it("score is non-negative across run", () => {
    let s = initialState(2, S);
    for (let i = 0; i < TOTAL_TURNS * 2 + 5; i++) {
      if (s.phase === "ready") s = reducer(s, { type: "throw" });
      else if (s.phase === "thrown") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("ends after TOTAL_TURNS", () => {
    let s = initialState(11, S);
    for (let i = 0; i < TOTAL_TURNS * 2 + 10; i++) {
      if (s.phase === "ready") s = reducer(s, { type: "throw" });
      else if (s.phase === "thrown") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});

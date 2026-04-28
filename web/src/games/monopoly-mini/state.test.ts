import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score, MAX_TURNS, BOARD_LEN } from "./state.js";

const S = { dummy: false };

describe("monopoly-mini", () => {
  it("starts with $500 each", () => {
    const s = initialState(1, S);
    expect(s.pCash).toBe(500);
    expect(s.cCash).toBe(500);
    expect(s.owners.length).toBe(BOARD_LEN);
  });
  it("roll moves player and changes phase", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.lastRoll).not.toBeNull();
    expect(s.pPos).toBeGreaterThanOrEqual(1);
  });
  it("score is non-negative at end", () => {
    let s = initialState(2, S);
    for (let i = 0; i < 200; i++) {
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      else if (s.phase === "deciding") s = reducer(s, { type: "skip" });
      else if (s.phase === "ai") s = reducer(s, { type: "ai" });
      if (s.phase === "done") break;
    }
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });
  it("eventually terminates", () => {
    let s = initialState(3, S);
    for (let i = 0; i < 500; i++) {
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      else if (s.phase === "deciding") s = reducer(s, { type: "buy" });
      else if (s.phase === "ai") s = reducer(s, { type: "ai" });
      if (s.phase === "done") break;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
    expect(s.turn).toBeGreaterThanOrEqual(1);
    expect(s.turn).toBeLessThanOrEqual(MAX_TURNS + 5);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score, TOTAL_TURNS } from "./state.js";

const S = { dummy: false };

describe("AgricolaCardOnly", () => {
  it("starts in choosing phase with positive cash", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("choosing");
    expect(s.cash).toBeGreaterThanOrEqual(0);
    expect(s.turn).toBe(1);
  });
  it("invest action triggers state change", () => {
    const s = reducer(initialState(1, S), { type: "invest" });
    expect(["resolved", "done"]).toContain(s.phase);
  });
  it("save action keeps cash >= initial", () => {
    const s = reducer(initialState(1, S), { type: "save" });
    expect(s.cash).toBeGreaterThanOrEqual(initialState(1, S).cash);
  });
  it("ends after TOTAL_TURNS", () => {
    let s = initialState(7, S);
    for (let i = 0; i < TOTAL_TURNS * 2 + 5; i++) {
      if (s.phase === "choosing") s = reducer(s, { type: "save" });
      else if (s.phase === "resolved") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("score is non-negative", () => {
    let s = initialState(3, S);
    for (let i = 0; i < TOTAL_TURNS * 2 + 3; i++) {
      if (s.phase === "choosing") s = reducer(s, { type: "save" });
      else if (s.phase === "resolved") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });
});

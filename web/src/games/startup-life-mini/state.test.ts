import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score, MAX_TURNS } from "./state.js";

const S = { dummy: false };

describe("startup-life-mini", () => {
  it("starts with $50k cash and 1 hire", () => {
    const s = initialState(1, S);
    expect(s.cash).toBe(50_000);
    expect(s.hires).toBe(1);
    expect(s.product).toBe(0);
  });
  it("roll triggers a state change", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.lastEvent).not.toBeNull();
    expect(s.phase === "resolved" || s.phase === "done").toBe(true);
  });
  it("score is non-negative", () => {
    let s = initialState(2, S);
    for (let i = 0; i < MAX_TURNS + 5; i++) {
      s = reducer(s, { type: "roll" });
      if (s.phase !== "done") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });
  it("eventually ends within 30 turns", () => {
    let s = initialState(7, S);
    for (let i = 0; i < 100; i++) {
      s = reducer(s, { type: "roll" });
      if (s.phase !== "done") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { rungs: "5" as const };

describe("LadderClimb", () => {
  it("starts at rung 1", () => { expect(initialState(1, S).rung).toBe(1); });
  it("tick moves grip marker", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.gripPos).not.toBe(s.gripPos);
  });
  it("grab in zone advances rung", () => {
    const s = { ...initialState(1, S), gripPos: 50 };
    const s2 = reducer(s, { type: "grab" });
    expect(s2.lastSuccess).toBe(true);
    expect(s2.score).toBeGreaterThan(0);
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});

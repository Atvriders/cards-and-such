import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { moles: "10" as const };

describe("MolePop", () => {
  it("starts with an active mole", () => {
    const s = initialState(1, S);
    expect(s.activeMole).toBeGreaterThanOrEqual(0);
    expect(s.phase).toBe("active");
  });
  it("whacking the correct hole scores points", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "whack", hole: s.activeMole });
    expect(s2.hits).toBe(1);
    expect(s2.score).toBeGreaterThan(0);
  });
  it("whacking wrong hole counts as miss", () => {
    const s = initialState(1, S);
    const wrongHole = (s.activeMole + 1) % 6;
    const s2 = reducer(s, { type: "whack", hole: wrongHole });
    expect(s2.misses).toBe(1);
    expect(s2.score).toBe(0);
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});

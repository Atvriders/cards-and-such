import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { casts: "5" as const };

describe("FishingCast", () => {
  it("starts at power 0 in casting phase", () => { const s = initialState(1, S); expect(s.power).toBe(0); expect(s.phase).toBe("casting"); });
  it("tick increases power", () => { expect(reducer(initialState(1, S), { type: "tick" }).power).toBeGreaterThan(0); });
  it("release records result", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "tick" });
    const s2 = reducer(s, { type: "release" });
    expect(s2.casts).toBe(1);
    expect(s2.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});

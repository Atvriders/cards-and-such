import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { balloons: "5" as const };

describe("BalloonBurst", () => {
  it("starts at size 0 in inflating phase", () => { const s = initialState(1, S); expect(s.size).toBe(0); expect(s.phase).toBe("inflating"); });
  it("tick increases size", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.size).toBeGreaterThan(0);
  });
  it("pop adds points and advances", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "tick" });
    const s2 = reducer(s, { type: "pop" });
    expect(s2.lastPoints).toBeGreaterThan(0);
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});

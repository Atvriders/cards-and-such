import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { arrows: "5" as const };

describe("ArrowHit", () => {
  it("starts in aiming phase", () => { expect(initialState(1, S).phase).toBe("aiming"); });
  it("tick moves indicator", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.targetPos).not.toBe(s.targetPos);
  });
  it("shoot records a result", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "shoot" });
    expect(s2.lastHit).not.toBeNull();
    expect(s2.arrows).toBe(1);
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});

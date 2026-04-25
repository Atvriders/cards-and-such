import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { throws: "8" as const };

describe("SnowballThrow", () => {
  it("starts at center in throwing phase", () => {
    const s = initialState(1, S);
    expect(s.targetX).toBe(50);
    expect(s.phase).toBe("throwing");
  });
  it("tick moves target", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.targetX).not.toBe(50);
  });
  it("direct click on target scores 100", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "throw", x: 50, y: 50 });
    expect(s2.lastPoints).toBe(100);
    expect(s2.throws).toBe(1);
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});

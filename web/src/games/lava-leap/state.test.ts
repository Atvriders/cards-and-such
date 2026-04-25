import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { leaps: "5" as const };

describe("LavaLeap", () => {
  it("starts at power 0", () => { expect(initialState(1, S).power).toBe(0); });
  it("tick increases power", () => { expect(reducer(initialState(1, S), { type: "tick" }).power).toBeGreaterThan(0); });
  it("jump in gap zone scores 100", () => {
    const gapSize = 40;
    const s = { ...initialState(1, S), power: gapSize + 10, gapSize };
    const s2 = reducer(s, { type: "jump" });
    expect(s2.lastPoints).toBe(100);
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});

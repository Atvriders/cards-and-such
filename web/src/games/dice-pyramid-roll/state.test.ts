import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { levels: "3" as const };

describe("DicePyramidRoll", () => {
  it("starts with 6 dice and rolling phase", () => {
    const s = initialState(1, S);
    expect(s.dice.length).toBe(6);
    expect(s.phase).toBe("rolling");
  });
  it("rolling switches to assigning", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("assigning");
  });
  it("assigning a die advances level", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "roll" });
    const s3 = reducer(s2, { type: "assign", diceIndex: 0 });
    expect(s3.level).toBe(1);
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});

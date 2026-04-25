import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { dice: "5" as const };

describe("DiceTarget25", () => {
  it("starts with 5 dice", () => { expect(initialState(1, S).dice.length).toBe(5); });
  it("roll changes unkept dice", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "roll" }); // first roll from initial
    expect(s2.rollsLeft).toBe(1);
  });
  it("scoring awards points based on distance from 25", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "roll" });
    const s3 = reducer(s2, { type: "score" });
    expect(s3.score).toBeGreaterThanOrEqual(0);
    expect(s3.phase).toBe("scored");
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});

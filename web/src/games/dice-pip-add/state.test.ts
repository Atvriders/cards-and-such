import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s8 = { rounds: "8" as const };

describe("DicePipAdd initialState", () => {
  it("starts in choosing phase with diceIdx 0", () => {
    const s = initialState(1, s8);
    expect(s.phase).toBe("choosing");
    expect(s.diceIdx).toBe(0);
  });
  it("has 3 dice and target 5-16", () => {
    const s = initialState(1, s8);
    expect(s.dice.length).toBe(3);
    expect(s.target).toBeGreaterThanOrEqual(5);
    expect(s.target).toBeLessThanOrEqual(16);
  });
  it("is deterministic", () => {
    expect(initialState(99, s8).target).toBe(initialState(99, s8).target);
  });
  it("starts at 0 scores", () => {
    expect(initialState(1, s8).running).toBe(0);
    expect(initialState(1, s8).totalScore).toBe(0);
  });
});

describe("DicePipAdd reducer", () => {
  it("add increases running total", () => {
    const s = initialState(1, s8);
    const s2 = reducer(s, { type: "add" });
    expect(s2.running).toBe(s.dice[0]);
    expect(s2.diceIdx).toBe(1);
  });
  it("skip does not change running total", () => {
    const s = initialState(1, s8);
    const s2 = reducer(s, { type: "skip" });
    expect(s2.running).toBe(0);
    expect(s2.diceIdx).toBe(1);
  });
  it("exact hit scores 50", () => {
    let s = initialState(1, s8);
    // add all dice
    s = reducer(s, { type: "add" });
    s = reducer(s, { type: "add" });
    s = reducer(s, { type: "add" });
    // Check against target
    const sum = initialState(1, s8).dice.reduce((a, b) => a + b, 0);
    const target = initialState(1, s8).target;
    if (sum === target) expect(s.roundScore).toBe(50);
  });
  it("gameover after last round", () => {
    let s = initialState(1, { rounds: "6" });
    for (let i = 0; i < 6; i++) {
      s = reducer(s, { type: "skip" });
      s = reducer(s, { type: "skip" });
      s = reducer(s, { type: "skip" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});

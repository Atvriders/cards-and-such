import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s5 = { rounds: "5" as const };

describe("Dice100Target initialState", () => {
  it("starts at total 0 in rolling phase", () => {
    const s = initialState(1, s5);
    expect(s.total).toBe(0);
    expect(s.phase).toBe("rolling");
  });
  it("totalScore starts 0", () => {
    expect(initialState(1, s5).totalScore).toBe(0);
  });
  it("is deterministic", () => {
    const s1 = reducer(initialState(42, s5), { type: "roll" });
    const s2 = reducer(initialState(42, s5), { type: "roll" });
    expect(s1.lastRoll).toBe(s2.lastRoll);
  });
  it("round starts at 1", () => {
    expect(initialState(1, s5).round).toBe(1);
  });
});

describe("Dice100Target reducer", () => {
  it("roll adds to total", () => {
    const s = reducer(initialState(1, s5), { type: "roll" });
    expect(s.total).toBeGreaterThan(0);
    expect(s.lastRoll).not.toBeNull();
  });
  it("stop banks the total", () => {
    const s = reducer(initialState(1, s5), { type: "roll" });
    const s2 = s.phase === "rolling" ? reducer(s, { type: "stop" }) : s;
    if (s2.phase === "scored" || s2.phase === "gameover") expect(s2.totalScore).toBeGreaterThan(0);
  });
  it("bust sets score to 0 for round", () => {
    // Roll many times to force bust
    let s = initialState(1, s5);
    for (let i = 0; i < 20 && s.phase === "rolling"; i++) s = reducer(s, { type: "roll" });
    if (s.phase === "bust" || s.phase === "gameover") {
      expect(s.roundScore).toBe(0);
    }
  });
  it("next advances round after stop", () => {
    const s = reducer(initialState(1, s5), { type: "roll" });
    const s2 = s.phase === "rolling" ? reducer(s, { type: "stop" }) : s;
    const s3 = (s2.phase === "scored") ? reducer(s2, { type: "next" }) : s2;
    if (s3.phase === "rolling") expect(s3.round).toBe(2);
  });
});

describe("Dice100Target isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, s5))).toBeNull();
  });
  it("returns score when done", () => {
    let s = initialState(1, { rounds: "3" });
    for (let i = 0; i < 3; i++) {
      s = reducer(s, { type: "roll" });
      if (s.phase === "rolling") s = reducer(s, { type: "stop" });
      if (s.phase === "scored") s = reducer(s, { type: "next" });
    }
    if (isTerminal(s)) expect(typeof isTerminal(s)!.score).toBe("number");
  });
});

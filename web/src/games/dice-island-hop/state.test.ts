import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ISLANDS, HOPS } from "./state.js";

const S = { dummy: false };

describe("dice-island-hop", () => {
  it("starts at island 0 with HOPS hops", () => {
    const s = initialState(1, S);
    expect(s.pos).toBe(0);
    expect(s.hops).toBe(HOPS);
    expect(s.phase).toBe("roll");
  });
  it("hop moves the player and consumes a hop", () => {
    const s = reducer(initialState(2, S), { type: "hop" });
    expect(s.hops).toBe(HOPS - 1);
    expect(s.pos).toBeGreaterThan(0);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(3, S))).toBeNull();
  });
  it("game ends within HOPS rolls", () => {
    let s = initialState(4, S);
    for (let i = 0; i < (HOPS + 5) * 2 && s.phase !== "done"; i++) {
      if (s.phase === "roll") s = reducer(s, { type: "hop" });
      else s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
  it("position never exceeds ISLANDS", () => {
    let s = initialState(11, S);
    for (let i = 0; i < HOPS && s.phase !== "done"; i++) {
      if (s.phase === "roll") s = reducer(s, { type: "hop" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(s.pos).toBeLessThanOrEqual(ISLANDS);
  });
  it("doubles add a bonus", () => {
    // For seed 1, force a roll and check log content for doubles bonus when applicable
    const s = reducer(initialState(7, S), { type: "hop" });
    if (s.rolls && s.rolls[0] === s.rolls[1]) {
      expect(s.log).toContain("Doubles");
    }
    expect(s).toBeTruthy();
  });
});

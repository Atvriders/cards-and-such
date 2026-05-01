import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isWin } from "./state.js";

const S = { dummy: false };

describe("dice-pirate", () => {
  it("starts with 6 ships", () => {
    const s = initialState(1, S);
    expect(s.ships.length).toBe(6);
    expect(s.ships.every(sh => !sh.sunk)).toBe(true);
  });
  it("isWin: 7 returns true", () => {
    expect(isWin(3, 4)).toBe(true);
    expect(isWin(1, 1)).toBe(false);
  });
  it("fire rolls 3 dice", () => {
    const s = reducer(initialState(2, S), { type: "fire" });
    expect(s.rolls!.length).toBe(3);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(3, S))).toBeNull();
  });
  it("eventually ends", () => {
    let s = initialState(4, S);
    for (let i = 0; i < 100 && s.phase !== "done"; i++) {
      if (s.phase === "fire") s = reducer(s, { type: "fire" });
      else s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
  it("HP never goes below zero", () => {
    let s = initialState(7, S);
    for (let i = 0; i < 30 && s.phase !== "done"; i++) {
      if (s.phase === "fire") s = reducer(s, { type: "fire" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(s.hp).toBeGreaterThanOrEqual(0);
  });
});

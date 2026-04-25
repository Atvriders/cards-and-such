import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, calcTurnScore } from "./state.js";
import type { PirateDiceState } from "./state.js";

const defaultSettings = { target: "5" as const };

describe("PirateDice calcTurnScore", () => {
  it("gold (6) scores 3 each, diamonds (5) score 1", () => {
    const dice = [6, 6, 5, 3, 4];
    const mask = [true, true, true, false, false];
    expect(calcTurnScore(dice, mask)).toBe(3 * 2 + 1); // 7
  });

  it("3 sabers double the score", () => {
    const dice = [2, 2, 2, 6, 5];
    const mask = [true, true, true, true, true];
    // sabers=3, gold=1, diamonds=1 → (3+1)*2 = 8
    expect(calcTurnScore(dice, mask)).toBe(8);
  });

  it("returns 0 with no kept dice", () => {
    const dice = [3, 4, 3, 4, 3];
    const mask = [false, false, false, false, false];
    expect(calcTurnScore(dice, mask)).toBe(0);
  });
});

describe("PirateDice initialState", () => {
  it("starts at 0 treasure and preRoll", () => {
    const s = initialState(1, defaultSettings);
    expect(s.treasure).toBe(0);
    expect(s.phase).toBe("preRoll");
    expect(s.skulls).toBe(0);
  });
});

describe("PirateDice roll", () => {
  it("produces 5 dice and transitions to rolled or sunk", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(["rolled", "sunk"]).toContain(s2.phase);
    expect(s2.lastRoll).toHaveLength(5);
  });

  it("3+ skulls causes sunk", () => {
    const base = initialState(1, defaultSettings);
    const sunk: PirateDiceState = {
      ...base,
      lastRoll: [1, 1, 1, 3, 4],
      keptMask: [true, true, true, false, false],
      skulls: 3,
      phase: "sunk",
    };
    expect(sunk.phase).toBe("sunk");
    expect(sunk.skulls).toBe(3);
    const s2 = reducer(sunk, { type: "nextTurn" });
    expect(s2.phase).toBe("preRoll");
    expect(s2.skulls).toBe(0);
  });
});

describe("PirateDice bank", () => {
  it("adds turn treasure to total", () => {
    const base = initialState(1, defaultSettings);
    const ready: PirateDiceState = {
      ...base,
      phase: "rolled",
      turnTreasure: 4,
      treasure: 0,
      lastRoll: [6, 6, 3, 4, 4],
      keptMask: [true, true, false, false, false],
    };
    const s2 = reducer(ready, { type: "bank" });
    expect(s2.treasure).toBe(4);
    expect(s2.turnsPlayed).toBe(1);
    expect(s2.turnTreasure).toBe(0);
  });
});

describe("PirateDice isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score on win", () => {
    const base = initialState(1, defaultSettings);
    const won: PirateDiceState = { ...base, phase: "won", turnsPlayed: 3 };
    expect(isTerminal(won)?.score).toBe(940);
  });
});

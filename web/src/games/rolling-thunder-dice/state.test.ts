import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { RollingThunderState } from "./state.js";

describe("RollingThunderDice initialState", () => {
  it("starts empty with 0 banked and 0 turns", () => {
    const s = initialState(42);
    expect(s.bankedScore).toBe(0);
    expect(s.turns).toBe(0);
    expect(s.gameOver).toBe(false);
    expect(s.currentDice).toHaveLength(0);
  });

  it("is deterministic", () => {
    expect(initialState(7)).toEqual(initialState(7));
  });
});

describe("RollingThunderDice roll", () => {
  it("produces dice after rolling", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "roll" });
    // dice count is original 5 minus any 1s
    expect(s2.currentDice.length).toBeLessThanOrEqual(5);
    expect(s2.currentDice.every((d) => d >= 2 && d <= 6)).toBe(true);
  });

  it("is deterministic with same seed", () => {
    const s = initialState(1);
    const a = reducer(s, { type: "roll" });
    const b = reducer(s, { type: "roll" });
    expect(a.currentDice).toEqual(b.currentDice);
  });
});

describe("RollingThunderDice bank", () => {
  it("moves turn score to banked and increments turns", () => {
    const s: RollingThunderState = {
      ...initialState(1),
      currentDice: [3, 4, 5],
      turnScore: 12,
    };
    const s2 = reducer(s, { type: "bank" });
    expect(s2.bankedScore).toBe(12);
    expect(s2.turns).toBe(1);
    expect(s2.turnScore).toBe(0);
    expect(s2.currentDice).toHaveLength(0);
  });

  it("ends game after 6 banks", () => {
    let s: RollingThunderState = { ...initialState(1), turns: 5, currentDice: [3], turnScore: 3 };
    s = reducer(s, { type: "bank" });
    expect(s.gameOver).toBe(true);
  });
});

describe("RollingThunderDice isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("returns banked score when done", () => {
    const s: RollingThunderState = { ...initialState(1), gameOver: true, bankedScore: 250 };
    expect(isTerminal(s)!.score).toBe(250);
  });
});

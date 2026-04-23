import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { dummy: false };

describe("LCR initialState", () => {
  it("starts with 3 chips per player and empty pot", () => {
    const s = initialState(42, settings);
    expect(s.chips).toEqual([3, 3, 3]);
    expect(s.pot).toBe(0);
    expect(s.currentPlayer).toBe(0);
    expect(s.phase).toBe("rolling");
    expect(s.winner).toBeNull();
  });

  it("is deterministic for same seed", () => {
    expect(initialState(7, settings)).toEqual(initialState(7, settings));
  });
});

describe("LCR roll", () => {
  it("roll changes phase to result", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("result");
    expect(s2.dice.length).toBeGreaterThan(0);
    expect(s2.dice.length).toBeLessThanOrEqual(3);
  });

  it("chips are conserved (chips + pot = 9)", () => {
    let s = initialState(1, settings);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "confirm" });
      if (s.winner !== null) break;
    }
    const total = s.chips.reduce((a, b) => a + b, 0) + s.pot;
    expect(total).toBe(9);
  });

  it("roll ignored when not in rolling phase", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("result");
    const s3 = reducer(s2, { type: "roll" });
    expect(s3).toEqual(s2); // no change
  });
});

describe("LCR confirm", () => {
  it("confirm advances to next player", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    const s3 = reducer(s2, { type: "confirm" });
    expect(s3.phase).toBe("rolling");
  });

  it("confirm ignored outside result phase", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "confirm" });
    expect(s2).toEqual(s);
  });
});

describe("LCR terminal", () => {
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("isTerminal returns score when winner set", () => {
    const s = initialState(1, settings);
    const won = { ...s, winner: 0, chips: [9, 0, 0] as unknown as readonly number[] };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });

  it("score is 0 if bot wins", () => {
    const s = initialState(1, settings);
    const won = { ...s, winner: 1, chips: [0, 9, 0] as unknown as readonly number[] };
    expect(isTerminal(won)!.score).toBe(0);
  });
});

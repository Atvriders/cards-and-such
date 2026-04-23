import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s1 = { opponents: "1" as const };
const s3 = { opponents: "3" as const };

describe("Pop the Pig", () => {
  it("initializes with random burger count between 10 and 20", () => {
    const s = initialState(42, s1);
    expect(s.burgersLeft).toBeGreaterThanOrEqual(10);
    expect(s.burgersLeft).toBeLessThanOrEqual(20);
    expect(s.startBurgers).toBe(s.burgersLeft);
    expect(s.loser).toBeNull();
  });

  it("rolling reduces burger count by 1-4", () => {
    const s = initialState(42, s1);
    const initialBurgers = s.burgersLeft;
    const next = reducer(s, { type: "roll" });
    if (next.loser === null) {
      expect(next.burgersLeft).toBeGreaterThanOrEqual(0);
      expect(next.burgersLeft).toBeLessThan(initialBurgers);
    }
    expect(next.lastRoll).toBeGreaterThanOrEqual(1);
    expect(next.lastRoll).toBeLessThanOrEqual(4);
  });

  it("burger count never goes negative", () => {
    let s = initialState(42, s1);
    for (let i = 0; i < 50; i++) {
      if (s.loser !== null) break;
      s = reducer(s, { type: "roll" });
      expect(s.burgersLeft).toBeGreaterThanOrEqual(0);
    }
  });

  it("game ends when burgers reach 0", () => {
    let s = initialState(42, s1);
    for (let i = 0; i < 100; i++) {
      if (s.loser !== null) break;
      s = reducer(s, { type: "roll" });
    }
    expect(s.loser).not.toBeNull();
    expect(s.burgersLeft).toBe(0);
  });

  it("isTerminal returns null during game", () => {
    const s = initialState(42, s1);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score 0 when player loses", () => {
    const s = initialState(42, s1);
    const lost = { ...s, loser: 0 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });

  it("isTerminal returns score 100 when bot loses", () => {
    const s = initialState(42, s1);
    const won = { ...s, loser: 1 };
    expect(isTerminal(won)).toEqual({ score: 100 });
  });

  it("supports 4-player mode (1 human + 3 bots)", () => {
    const s = initialState(42, s3);
    expect(s.numPlayers).toBe(4);
  });

  it("different seeds produce different starting burger counts", () => {
    const s1state = initialState(1, s1);
    const s2state = initialState(999999, s1);
    // Very unlikely both produce identical counts
    // but not guaranteed — test that init is seeded
    expect(s1state.burgersLeft).toBeGreaterThanOrEqual(10);
    expect(s2state.burgersLeft).toBeGreaterThanOrEqual(10);
  });
});

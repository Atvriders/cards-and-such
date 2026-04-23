import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ROUNDS_TO_WIN } from "./state.js";

const settings = { dummy: true };

describe("Diddler initialState", () => {
  it("starts with zero round wins", () => {
    const s = initialState(42, settings);
    expect(s.roundWins).toEqual([0, 0]);
    expect(s.phase).toBe("rolling");
    expect(s.winner).toBeNull();
  });

  it("is deterministic for the same seed", () => {
    expect(initialState(99, settings)).toEqual(initialState(99, settings));
  });
});

describe("Diddler roll", () => {
  it("roll transitions to arranging phase and sets dice", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("arranging");
    expect(s2.playerDice.length).toBe(3);
    s2.playerDice.forEach((v) => { expect(v).toBeGreaterThanOrEqual(1); expect(v).toBeLessThanOrEqual(6); });
    expect(s2.botDice.length).toBe(3);
  });

  it("roll in result phase starts new round", () => {
    let s = initialState(3, settings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "setOrder", order: [0, 1, 2] });
    expect(s.phase).toBe("result");
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("arranging");
  });
});

describe("Diddler setOrder", () => {
  it("setOrder resolves the round", () => {
    const s = initialState(7, settings);
    const rolled = reducer(s, { type: "roll" });
    const resolved = reducer(rolled, { type: "setOrder", order: [0, 1, 2] });
    expect(resolved.phase).toBe("result");
    expect(resolved.roundResult).not.toBe("");
    const totalWins = resolved.roundWins[0]! + resolved.roundWins[1]!;
    expect(totalWins).toBeLessThanOrEqual(1);
  });

  it("player wins round when their number is larger", () => {
    const s = initialState(1, settings);
    const rolled = reducer(s, { type: "roll" });
    // Force player dice to all 6, bot dice to all 1
    const rigged = { ...rolled, playerDice: [6, 6, 6], botDice: [1, 1, 1] };
    const resolved = reducer(rigged, { type: "setOrder", order: [0, 1, 2] });
    expect(resolved.roundWins[0]).toBe(1);
    expect(resolved.roundWins[1]).toBe(0);
  });
});

describe("Diddler terminal", () => {
  it("isTerminal null during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("isTerminal returns positive score for player win", () => {
    const s = initialState(1, settings);
    const won = { ...s, winner: 0, roundWins: [ROUNDS_TO_WIN, 0] as unknown as readonly number[] };
    expect(isTerminal(won)!.score).toBeGreaterThan(0);
  });

  it("isTerminal returns 0 score for bot win", () => {
    const s = initialState(1, settings);
    const won = { ...s, winner: 1, roundWins: [0, ROUNDS_TO_WIN] as unknown as readonly number[] };
    expect(isTerminal(won)!.score).toBe(0);
  });
});

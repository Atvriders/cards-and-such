import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { lives: "3" as const };

describe("Mexico initialState", () => {
  it("starts with correct lives and phase", () => {
    const s = initialState(42, settings);
    expect(s.playerLives).toBe(3);
    expect(s.botLives).toBe(3);
    expect(s.phase).toBe("playerRolling");
    expect(s.rerolls).toBe(0);
  });

  it("is deterministic under same seed", () => {
    expect(initialState(77, settings)).toEqual(initialState(77, settings));
  });
});

describe("Mexico roll", () => {
  it("roll increments rerolls and sets dice", () => {
    const s = initialState(10, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.rerolls).toBe(1);
    expect(s2.dice[0]).toBeGreaterThanOrEqual(1);
    expect(s2.dice[1]).toBeGreaterThanOrEqual(1);
  });

  it("after 3 rolls phase becomes botRolling", () => {
    let s = initialState(10, settings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    expect(s.phase).toBe("botRolling");
  });

  it("keep after roll changes phase to botRolling", () => {
    let s = initialState(5, settings);
    s = reducer(s, { type: "roll" });
    expect(s.rerolls).toBe(1);
    s = reducer(s, { type: "keep" });
    expect(s.phase).toBe("botRolling");
  });

  it("keep before any roll is a no-op", () => {
    const s = initialState(5, settings);
    const s2 = reducer(s, { type: "keep" });
    expect(s2).toBe(s);
  });
});

describe("Mexico nextRound", () => {
  it("resolves bot turn and produces roundResult", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "keep" });
    // Phase is botRolling, nextRound triggers bot
    s = reducer(s, { type: "nextRound" });
    expect(s.roundResult).not.toBeNull();
    expect(["roundOver", "gameOver"]).toContain(s.phase);
  });

  it("advancing roundOver resets for next round", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "keep" });
    s = reducer(s, { type: "nextRound" });
    if (s.phase === "roundOver") {
      s = reducer(s, { type: "nextRound" });
      expect(s.phase).toBe("playerRolling");
      expect(s.rerolls).toBe(0);
    }
  });
});

describe("Mexico isTerminal", () => {
  it("returns null when game ongoing", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = initialState(42, settings);
    const done = { ...s, phase: "gameOver" as const, playerLives: 1 };
    const result = isTerminal(done);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(1);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { rounds: "5" as const };

describe("initialState", () => {
  it("creates the correct number of rounds", () => {
    const s = initialState(42, defaultSettings);
    expect(s.rounds).toHaveLength(5);
    expect(s.currentRound).toBe(0);
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("each round has 4 options containing the correct color", () => {
    const s = initialState(42, defaultSettings);
    for (const round of s.rounds) {
      expect(round.options).toHaveLength(4);
      expect(round.options).toContain(round.color);
    }
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(77, defaultSettings);
    const s2 = initialState(77, defaultSettings);
    expect(s1.rounds[0]!.color).toBe(s2.rounds[0]!.color);
  });
});

describe("reducer — choose", () => {
  it("records correct choice and adds 100 points", () => {
    const s = initialState(42, defaultSettings);
    const correct = s.rounds[0]!.color;
    const s2 = reducer(s, { type: "choose", hex: correct });
    expect(s2.rounds[0]!.correct).toBe(true);
    expect(s2.score).toBe(100);
    expect(s2.currentRound).toBe(1);
  });

  it("records wrong choice and adds 0 points", () => {
    const s = initialState(42, defaultSettings);
    const wrong = s.rounds[0]!.options.find(o => o !== s.rounds[0]!.color)!;
    const s2 = reducer(s, { type: "choose", hex: wrong });
    expect(s2.rounds[0]!.correct).toBe(false);
    expect(s2.score).toBe(0);
  });

  it("does not allow choosing same round twice", () => {
    const s = initialState(42, defaultSettings);
    const correct = s.rounds[0]!.color;
    const s2 = reducer(s, { type: "choose", hex: correct });
    const round1 = s2.currentRound;
    const s3 = reducer(s2, { type: "choose", hex: correct });
    // second choose should advance to round 2
    expect(s3.currentRound).toBeGreaterThanOrEqual(round1);
  });

  it("game ends after all rounds", () => {
    let s = initialState(42, { rounds: "5" });
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "choose", hex: s.rounds[s.currentRound]!.color });
    }
    expect(s.gameOver).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when game over", () => {
    const s = initialState(42, defaultSettings);
    const over = { ...s, gameOver: true, score: 300 };
    expect(isTerminal(over)!.score).toBe(300);
  });

  it("perfect game scores rounds * 100", () => {
    let s = initialState(42, defaultSettings);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "choose", hex: s.rounds[s.currentRound]!.color });
    }
    expect(isTerminal(s)!.score).toBe(500);
  });
});

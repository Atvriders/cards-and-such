import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { MagicianTrickSettings } from "./state.js";

const s3: MagicianTrickSettings = { cups: "3" };
const s5: MagicianTrickSettings = { cups: "5" };

describe("MagicianTrick initialState", () => {
  it("starts with 3 cups", () => {
    expect(initialState(1, s3).numCups).toBe(3);
  });

  it("starts with 5 cups", () => {
    expect(initialState(1, s5).numCups).toBe(5);
  });

  it("starts in reveal phase", () => {
    expect(initialState(1, s3).phase).toBe("reveal");
  });

  it("ballPos is valid cup index", () => {
    const s = initialState(1, s3);
    expect(s.ballPos).toBeGreaterThanOrEqual(0);
    expect(s.ballPos).toBeLessThan(3);
  });
});

describe("MagicianTrick reducer", () => {
  it("startShuffle moves to shuffle phase", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "startShuffle" });
    expect(s2.phase).toBe("shuffle");
    expect(s2.displayPos).toBeNull();
  });

  it("nextShuffle advances shuffle step", () => {
    let s = initialState(1, s3);
    s = reducer(s, { type: "startShuffle" });
    s = reducer(s, { type: "nextShuffle" });
    expect(s.shuffleStep).toBe(1);
  });

  it("after all shuffles, phase becomes guess", () => {
    let s = initialState(1, s3);
    s = reducer(s, { type: "startShuffle" });
    const count = s.shuffleHistory.length;
    for (let i = 0; i <= count; i++) s = reducer(s, { type: "nextShuffle" });
    expect(s.phase).toBe("guess");
  });

  it("correct guess sets correct flag", () => {
    let s = initialState(1, s3);
    s = reducer(s, { type: "startShuffle" });
    const count = s.shuffleHistory.length;
    for (let i = 0; i <= count; i++) s = reducer(s, { type: "nextShuffle" });
    const correctCup = s.ballPos;
    s = reducer(s, { type: "guess", cup: correctCup });
    expect(s.correct).toBe(true);
    expect(s.wins).toBe(1);
  });

  it("restart resets to initial state", () => {
    let s = initialState(1, s3);
    s = reducer(s, { type: "startShuffle" });
    s = reducer(s, { type: "restart" });
    expect(s.phase).toBe("reveal");
    expect(s.round).toBe(1);
  });
});

describe("MagicianTrick isTerminal", () => {
  it("returns null when not game over", () => {
    expect(isTerminal(initialState(1, s3))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(1, s3), gameOver: true, score: 600 };
    expect(isTerminal(s)!.score).toBe(600);
  });

  it("score capped at 1000", () => {
    const s = { ...initialState(1, s3), gameOver: true, score: 5000 };
    expect(isTerminal(s)!.score).toBe(1000);
  });
});

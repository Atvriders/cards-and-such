import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { ClownTossSettings } from "./state.js";

const s3: ClownTossSettings = { pegs: "3" };
const s5: ClownTossSettings = { pegs: "5" };

describe("ClownToss initialState", () => {
  it("starts with 3 pegs", () => {
    expect(initialState(1, s3).pegs).toHaveLength(3);
  });

  it("starts with 5 pegs", () => {
    expect(initialState(1, s5).pegs).toHaveLength(5);
  });

  it("3 pegs gives 9 rings", () => {
    expect(initialState(1, s3).totalRings).toBe(9);
  });

  it("starts with 0 score", () => {
    expect(initialState(1, s3).score).toBe(0);
  });

  it("not game over initially", () => {
    expect(initialState(1, s3).gameOver).toBe(false);
  });
});

describe("ClownToss reducer", () => {
  it("toss decrements ringsLeft", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "toss", pegId: 0 });
    expect(s2.ringsLeft).toBe(s.ringsLeft - 1);
  });

  it("game over when rings run out", () => {
    let s = initialState(1, s3);
    while (s.ringsLeft > 0) {
      s = reducer(s, { type: "toss", pegId: 0 });
    }
    expect(s.gameOver).toBe(true);
  });

  it("restart resets state", () => {
    let s = initialState(1, s3);
    s = reducer(s, { type: "toss", pegId: 0 });
    s = reducer(s, { type: "restart" });
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("invalid peg id does nothing", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "toss", pegId: 99 });
    expect(s2.ringsLeft).toBe(s.ringsLeft);
  });
});

describe("ClownToss isTerminal", () => {
  it("returns null when not game over", () => {
    expect(isTerminal(initialState(1, s3))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(1, s3), gameOver: true, score: 500 };
    expect(isTerminal(s)!.score).toBe(100);
  });

  it("score capped at 1000", () => {
    const s = { ...initialState(1, s3), gameOver: true, score: 99999 };
    expect(isTerminal(s)!.score).toBe(1000);
  });
});

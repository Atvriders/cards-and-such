import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, cardRank } from "./state.js";

const s10 = { rounds: "10" as const };

describe("CardRankGuess initialState", () => {
  it("starts in guessing phase", () => {
    const s = initialState(1, s10);
    expect(s.phase).toBe("guessing");
    expect(s.round).toBe(1);
  });
  it("is deterministic", () => {
    expect(initialState(5, s10).card).toBe(initialState(5, s10).card);
  });
  it("card is 0-51", () => {
    const s = initialState(1, s10);
    expect(s.card).toBeGreaterThanOrEqual(0);
    expect(s.card).toBeLessThanOrEqual(51);
  });
  it("starts with 0 score", () => {
    expect(initialState(1, s10).score).toBe(0);
  });
});

describe("CardRankGuess reducer", () => {
  it("exact guess awards 50 pts", () => {
    const s = initialState(1, s10);
    const exact = cardRank(s.card);
    const s2 = reducer(s, { type: "guess", rank: exact });
    expect(s2.lastPoints).toBe(50);
    expect(s2.score).toBe(50);
  });
  it("far-off guess awards 0 pts", () => {
    const s = initialState(1, s10);
    const exact = cardRank(s.card);
    const far = (exact + 6) % 13;
    const s2 = reducer(s, { type: "guess", rank: far });
    expect(s2.lastPoints).toBe(0);
  });
  it("next advances to round 2", () => {
    const s = initialState(1, s10);
    const s2 = reducer(s, { type: "guess", rank: 0 });
    const s3 = reducer(s2, { type: "next" });
    expect(s3.round).toBe(2);
    expect(s3.phase).toBe("guessing");
  });
  it("gameover after last round", () => {
    let s = initialState(1, { rounds: "5" });
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "guess", rank: 0 });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});

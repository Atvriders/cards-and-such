import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s8 = { rounds: "8" as const };

describe("CardShuffleBet initialState", () => {
  it("starts in memorize phase with 3 cards", () => {
    const s = initialState(1, s8);
    expect(s.phase).toBe("memorize");
    expect(s.cards.length).toBe(3);
  });
  it("highestPos is 0, 1, or 2", () => {
    const s = initialState(1, s8);
    expect(s.highestPos).toBeGreaterThanOrEqual(0);
    expect(s.highestPos).toBeLessThanOrEqual(2);
  });
  it("is deterministic", () => {
    expect(initialState(7, s8).cards).toEqual(initialState(7, s8).cards);
  });
  it("score starts 0", () => {
    expect(initialState(1, s8).score).toBe(0);
  });
});

describe("CardShuffleBet reducer", () => {
  it("ready transitions to guess", () => {
    const s = reducer(initialState(1, s8), { type: "ready" });
    expect(s.phase).toBe("guess");
  });
  it("correct guess awards 40 pts", () => {
    const s = initialState(1, s8);
    const s2 = reducer(s, { type: "ready" });
    const s3 = reducer(s2, { type: "guess", pos: s.highestPos });
    expect(s3.score).toBe(40);
  });
  it("wrong guess awards 0", () => {
    const s = initialState(1, s8);
    const s2 = reducer(s, { type: "ready" });
    const wrong = (s.highestPos + 1) % 3;
    const s3 = reducer(s2, { type: "guess", pos: wrong });
    expect(s3.score).toBe(0);
  });
  it("gameover after last round", () => {
    let s = initialState(1, { rounds: "6" });
    for (let i = 0; i < 6; i++) {
      s = reducer(s, { type: "ready" });
      s = reducer(s, { type: "guess", pos: 0 });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s0 = () => initialState(42, { rounds: "10" });

describe("CardBidStreak", () => {
  it("starts with 50 coins, round 1, bidding phase", () => {
    const s = s0();
    expect(s.coins).toBe(50);
    expect(s.round).toBe(1);
    expect(s.phase).toBe("bidding");
  });

  it("correct guess increases coins and streak", () => {
    const s = s0();
    const before = s.coins;
    const s2 = reducer(s, { type: "guess", higher: true });
    const s3 = reducer(s, { type: "guess", higher: false });
    const correct = s2.lastCorrect ? s2 : s3;
    expect(correct.streak).toBe(1);
    expect(correct.coins).toBeGreaterThan(before);
  });

  it("wrong guess resets streak", () => {
    const s = s0();
    const s2 = reducer(s, { type: "guess", higher: true });
    const s3 = reducer(s, { type: "guess", higher: false });
    const wrong = s2.lastCorrect === false ? s2 : s3;
    expect(wrong.streak).toBe(0);
  });

  it("isTerminal returns null mid-game and score when gameover", () => {
    const s = s0();
    expect(isTerminal(s)).toBeNull();
    const s2 = { ...s, phase: "gameover" as const };
    expect(isTerminal(s2)?.score).toBeDefined();
  });
});

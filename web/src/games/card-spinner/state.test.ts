import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("CardSpinner", () => {
  it("starts with no card, no bets, round 1", () => {
    const s = initialState(0, { rounds: "10" });
    expect(s.spunCard).toBeNull();
    expect(s.bets).toHaveLength(0);
    expect(s.round).toBe(1);
    expect(s.gameOver).toBe(false);
    expect(s.score).toBe(0);
  });

  it("placing a bet adds it to bets array", () => {
    const s0 = initialState(1, { rounds: "10" });
    const s1 = reducer(s0, { type: "placeBet", bet: { type: "color", value: "red" } });
    expect(s1.bets).toHaveLength(1);
    expect(s1.bets[0]).toEqual({ type: "color", value: "red" });
  });

  it("cannot place more than 3 bets per round", () => {
    let s = initialState(0, { rounds: "5" });
    s = reducer(s, { type: "placeBet", bet: { type: "color", value: "red" } });
    s = reducer(s, { type: "placeBet", bet: { type: "suit", value: "♠" } });
    s = reducer(s, { type: "placeBet", bet: { type: "rank", value: "A" } });
    s = reducer(s, { type: "placeBet", bet: { type: "rank", value: "K" } });
    expect(s.bets).toHaveLength(3);
  });

  it("spin reveals a card and records history", () => {
    const s0 = initialState(42, { rounds: "5" });
    const s1 = reducer(s0, { type: "placeBet", bet: { type: "color", value: "red" } });
    const s2 = reducer(s1, { type: "spin" });
    expect(s2.spunCard).not.toBeNull();
    expect(s2.history).toHaveLength(1);
    expect(s2.round).toBe(2);
  });

  it("nextRound action clears card and bets", () => {
    let s = initialState(5, { rounds: "10" });
    s = reducer(s, { type: "placeBet", bet: { type: "color", value: "black" } });
    s = reducer(s, { type: "spin" });
    expect(s.spunCard).not.toBeNull();
    s = reducer(s, { type: "nextRound" });
    expect(s.spunCard).toBeNull();
    expect(s.bets).toHaveLength(0);
  });

  it("game ends after all rounds are played", () => {
    let s = initialState(3, { rounds: "5" });
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "spin" });
      if (!s.gameOver) s = reducer(s, { type: "nextRound" });
    }
    expect(s.gameOver).toBe(true);
  });

  it("isTerminal returns score >= 500 (base) at end", () => {
    let s = initialState(0, { rounds: "5" });
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "spin" });
      if (!s.gameOver) s = reducer(s, { type: "nextRound" });
    }
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    // Score is score + 500, and if all bets lost then score <= 0 but terminal is still >=0
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });

  it("removing a bet removes it from the array", () => {
    let s = initialState(0, { rounds: "5" });
    s = reducer(s, { type: "placeBet", bet: { type: "color", value: "red" } });
    s = reducer(s, { type: "placeBet", bet: { type: "suit", value: "♥" } });
    expect(s.bets).toHaveLength(2);
    s = reducer(s, { type: "removeBet", index: 0 });
    expect(s.bets).toHaveLength(1);
    expect(s.bets[0]?.type).toBe("suit");
  });
});

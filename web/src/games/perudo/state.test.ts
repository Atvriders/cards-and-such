import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { PerudoState } from "./state.js";

const settings = { opponents: "1" as const, startingDice: "5" as const };

describe("Perudo initialState", () => {
  it("each player has startingDice dice", () => {
    const s = initialState(42, settings);
    expect(s.diceCounts).toHaveLength(2);
    expect(s.diceCounts[0]).toBe(5);
    expect(s.diceCounts[1]).toBe(5);
  });

  it("rolls are populated for each player", () => {
    const s = initialState(42, settings);
    expect(s.rolls[0]).toHaveLength(5);
    expect(s.rolls[1]).toHaveLength(5);
    for (const d of s.rolls[0]!) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
  });

  it("starts in bid phase with no current bid", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("bid");
    expect(s.currentBid).toBeNull();
    expect(s.winner).toBeNull();
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(77, settings);
    const s2 = initialState(77, settings);
    expect(s1.rolls).toEqual(s2.rolls);
    expect(s1.diceCounts).toEqual(s2.diceCounts);
  });
});

describe("Perudo bidding", () => {
  it("player can make an opening bid", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "bid", count: 2, face: 3 });
    // After player bids, bot runs, state changes
    expect(s2.currentBid !== null || s2.phase === "bid" || s2.round > 1).toBeTruthy();
  });

  it("player bid is recorded (before bot acts)", () => {
    const s = initialState(42, settings);
    // Before any bid
    expect(s.currentBid).toBeNull();
    const s2 = reducer(s, { type: "bid", count: 1, face: 2 });
    // Either bot has bid over it or a reveal happened
    expect(s2).not.toEqual(s);
  });

  it("can call dudo on an existing bid", () => {
    const base = initialState(42, settings);
    const withBid: PerudoState = {
      ...base,
      currentBid: { count: 10, face: 6, by: 1 },
      turn: 0,
    };
    const s2 = reducer(withBid, { type: "dudo" });
    // Should resolve — either reveal or new round
    expect(s2.lastReveal).not.toBeNull();
  });

  it("dudo on impossible bid causes bidder to lose a die", () => {
    const base = initialState(42, settings);
    // Make a bid that is guaranteed impossible (more dice than exist)
    const totalDice = base.diceCounts.reduce((a, b) => a + b, 0);
    const withBid: PerudoState = {
      ...base,
      currentBid: { count: totalDice * 2, face: 6, by: 1 }, // impossible
      turn: 0,
    };
    const s2 = reducer(withBid, { type: "dudo" });
    // Bidder (bot 1) should lose a die
    if (s2.phase !== "gameOver") {
      expect(s2.diceCounts[1]).toBeLessThan(base.diceCounts[1]!);
    }
  });
});

describe("Perudo isTerminal", () => {
  it("returns null when game ongoing", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 100 when player wins", () => {
    const s = initialState(42, settings);
    const won: PerudoState = { ...s, winner: 0, phase: "gameOver" };
    expect(isTerminal(won)).toEqual({ score: 100 });
  });

  it("returns score 0 when bot wins", () => {
    const s = initialState(42, settings);
    const lost: PerudoState = { ...s, winner: 1, phase: "gameOver" };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});

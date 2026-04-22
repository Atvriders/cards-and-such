import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DudoState } from "./state.js";

const settings = { startingDice: "5" as const };

describe("Dudo initialState", () => {
  it("both players have startingDice dice", () => {
    const s = initialState(42, settings);
    expect(s.playerDice).toBe(5);
    expect(s.botDice).toBe(5);
  });

  it("rolls are populated with valid die faces", () => {
    const s = initialState(42, settings);
    expect(s.playerRoll).toHaveLength(5);
    for (const d of s.playerRoll) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
  });

  it("starts in bid phase with player to go first", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("bid");
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(55, settings);
    const s2 = initialState(55, settings);
    expect(s1.playerRoll).toEqual(s2.playerRoll);
    expect(s1.botRoll).toEqual(s2.botRoll);
  });
});

describe("Dudo bidding", () => {
  it("opening bid is valid and transitions state", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "bid", count: 1, face: 3 });
    expect(s2).not.toEqual(s);
  });

  it("calling dudo with no bid does nothing", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "dudo" });
    expect(s2).toEqual(s);
  });

  it("dudo on an impossible bid causes bidder to lose a die", () => {
    const base = initialState(42, settings);
    const impossibleBid: DudoState = {
      ...base,
      currentBid: { count: 30, face: 6, by: 1 }, // impossible
      turn: 0,
    };
    const s2 = reducer(impossibleBid, { type: "dudo" });
    if (s2.phase === "gameOver") {
      expect(s2.winner).toBe(0);
    } else {
      expect(s2.botDice).toBeLessThan(base.botDice);
    }
  });

  it("dudo on valid bid causes challenger to lose a die", () => {
    // Make the entire bot roll all 1s (wilds), and bid 1 of face 2
    // This bid is trivially true because ones are wild
    const base = initialState(42, settings);
    const guaranteedBid: DudoState = {
      ...base,
      playerRoll: [1, 1, 1, 1, 1], // all wilds
      botRoll: [1, 1, 1, 1, 1],    // all wilds
      currentBid: { count: 1, face: 2, by: 1 }, // actual is 10 (all ones wild), bid is 1
      turn: 0,
    };
    const s2 = reducer(guaranteedBid, { type: "dudo" });
    // Challenger (player) should lose a die
    if (s2.phase === "gameOver") {
      expect(s2.winner).toBe(1);
    } else {
      expect(s2.playerDice).toBeLessThan(base.playerDice);
    }
  });
});

describe("Dudo isTerminal", () => {
  it("returns null when game ongoing", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 100 when player wins", () => {
    const s = initialState(42, settings);
    const won: DudoState = { ...s, winner: 0, phase: "gameOver" };
    expect(isTerminal(won)).toEqual({ score: 100 });
  });

  it("returns score 0 when bot wins", () => {
    const s = initialState(42, settings);
    const lost: DudoState = { ...s, winner: 1, phase: "gameOver" };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});

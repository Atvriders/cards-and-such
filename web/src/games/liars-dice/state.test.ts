import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { LiarsDiceState, DieFace } from "./state.js";

const defaultSettings = { startingDice: "5" as const, botAggressiveness: "balanced" as const };

describe("LiarsDice initialState", () => {
  it("starts with correct dice counts and no bid", () => {
    const s = initialState(42, defaultSettings);
    expect(s.playerDice.length).toBe(5);
    expect(s.botDice.length).toBe(5);
    expect(s.currentBid).toBeNull();
    expect(s.winner).toBeNull();
    expect(s.turn).toBe(0);
    expect(s.round).toBe(1);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.playerDice).toEqual(s2.playerDice);
    expect(s1.botDice).toEqual(s2.botDice);
  });

  it("respects startingDice setting (3)", () => {
    const s = initialState(1, { startingDice: "3", botAggressiveness: "balanced" });
    expect(s.playerDice.length).toBe(3);
    expect(s.botDice.length).toBe(3);
  });

  it("all dice values are 1-6", () => {
    const s = initialState(42, defaultSettings);
    const all = [...s.playerDice, ...s.botDice];
    for (const d of all) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
  });
});

describe("LiarsDice bid", () => {
  it("player can place an initial bid", () => {
    const s = initialState(42, defaultSettings);
    // After player bids, bot will respond (raise or call)
    const s2 = reducer(s, { type: "bid", count: 1, face: 3 as DieFace });
    // The bot has responded — either turn is back to 0 (bot raised) or reveal happened
    // Either way, state should have changed
    expect(s2).not.toBe(s);
  });

  it("rejects a bid when not player's turn", () => {
    const s = initialState(42, defaultSettings);
    const withBotTurn: LiarsDiceState = { ...s, turn: 1 };
    const s2 = reducer(withBotTurn, { type: "bid", count: 1, face: 2 as DieFace });
    expect(s2).toBe(withBotTurn);
  });

  it("rejects a bid that is not strictly higher than current bid", () => {
    const s = initialState(42, defaultSettings);
    const withBid: LiarsDiceState = {
      ...s,
      currentBid: { count: 3, face: 4 as DieFace, by: 1 },
      turn: 0,
    };
    // Same count, same face — invalid
    const s2 = reducer(withBid, { type: "bid", count: 3, face: 4 as DieFace });
    expect(s2).toBe(withBid);
    // Lower count — invalid
    const s3 = reducer(withBid, { type: "bid", count: 2, face: 4 as DieFace });
    expect(s3).toBe(withBid);
  });

  it("accepts a valid raise (higher count)", () => {
    const s = initialState(42, defaultSettings);
    const withBid: LiarsDiceState = {
      ...s,
      currentBid: { count: 2, face: 3 as DieFace, by: 1 },
      turn: 0,
    };
    const s2 = reducer(withBid, { type: "bid", count: 3, face: 3 as DieFace });
    expect(s2).not.toBe(withBid);
  });

  it("accepts a valid raise (same count, higher face)", () => {
    const s = initialState(42, defaultSettings);
    const withBid: LiarsDiceState = {
      ...s,
      currentBid: { count: 2, face: 3 as DieFace, by: 1 },
      turn: 0,
    };
    const s2 = reducer(withBid, { type: "bid", count: 2, face: 4 as DieFace });
    expect(s2).not.toBe(withBid);
  });
});

describe("LiarsDice call", () => {
  it("resolves round and produces lastReveal", () => {
    const s = initialState(42, defaultSettings);
    // Place a high (implausible) bid to force caller wins
    const withBid: LiarsDiceState = {
      ...s,
      currentBid: { count: 99, face: 6 as DieFace, by: 0 },
      turn: 0,
    };
    const s2 = reducer(withBid, { type: "call" });
    expect(s2.lastReveal).not.toBeNull();
    // bidder (0) loses a die since count 99 is impossible
    expect(s2.lastReveal?.wonBy).toBe(0); // caller wins
  });

  it("rejects call when no bid exists", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "call" });
    expect(s2).toBe(s);
  });

  it("rejects call when not player's turn", () => {
    const s = initialState(42, defaultSettings);
    const withBid: LiarsDiceState = {
      ...s,
      currentBid: { count: 1, face: 2 as DieFace, by: 1 },
      turn: 1,
    };
    const s2 = reducer(withBid, { type: "call" });
    expect(s2).toBe(withBid);
  });

  it("sets winner when a player runs out of dice", () => {
    // Player has 1 die, bot has 5 dice, player calls an impossible bid from bot
    const base = initialState(42, defaultSettings);
    const s: LiarsDiceState = {
      ...base,
      playerDice: [3 as DieFace],
      botDice: [1, 2, 3, 4, 5] as DieFace[],
      currentBid: { count: 99, face: 6 as DieFace, by: 1 }, // bot's bid, obviously wrong
      turn: 0,
    };
    const s2 = reducer(s, { type: "call" });
    // Player called and won — bot loses a die (5-1=4 remain), no winner yet
    expect(s2.winner).toBeNull(); // bot still has dice
    expect(s2.botDice.length).toBeLessThan(5);
  });

  it("player wins when bot runs out of dice", () => {
    const base = initialState(42, defaultSettings);
    const s: LiarsDiceState = {
      ...base,
      playerDice: [3, 4, 5] as DieFace[],
      botDice: [1 as DieFace], // bot has 1 die
      currentBid: { count: 99, face: 6 as DieFace, by: 1 }, // impossible bid by bot
      turn: 0,
    };
    const s2 = reducer(s, { type: "call" });
    // Player called, bot's bid was wrong, bot loses 1 die → bot at 0 → player wins
    expect(s2.winner).toBe(0);
  });
});

describe("LiarsDice isTerminal", () => {
  it("returns null when game ongoing", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score > 0 when player wins", () => {
    const s = initialState(42, defaultSettings);
    const won: LiarsDiceState = { ...s, winner: 0, playerDice: [1, 2, 3] as DieFace[] };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    // score = 100 + 3*50 = 250
    expect(result?.score).toBe(250);
  });

  it("returns 0 score when bot wins", () => {
    const s = initialState(42, defaultSettings);
    const lost: LiarsDiceState = { ...s, winner: 1 };
    const result = isTerminal(lost);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(0);
  });
});

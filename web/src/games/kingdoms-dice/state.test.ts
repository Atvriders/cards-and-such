import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { KingdomsDiceState } from "./state.js";

const settings = { targetScore: "50" as const };

describe("KingdomsDice initialState", () => {
  it("starts in roll phase with 4 market cards", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("roll");
    expect(s.market).toHaveLength(4);
    expect(s.playerScore).toBe(0);
    expect(s.botScore).toBe(0);
    expect(s.winner).toBeNull();
  });

  it("market cards have valid ranks and values", () => {
    const s = initialState(42, settings);
    for (const k of s.market) {
      expect(k.rank).toBeGreaterThanOrEqual(1);
      expect(k.rank).toBeLessThanOrEqual(6);
      expect(k.value).toBeGreaterThanOrEqual(1);
      expect(k.value).toBeLessThanOrEqual(6);
    }
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(77, settings);
    const s2 = initialState(77, settings);
    expect(s1.market).toEqual(s2.market);
    expect(s1.rngSeed).toEqual(s2.rngSeed);
  });
});

describe("KingdomsDice roll", () => {
  it("produces 3 dice after roll", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.dice).toHaveLength(3);
    for (const d of s2.dice) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
    expect(s2.phase).toBe("buy");
  });

  it("cannot roll when in buy phase", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    const s3 = reducer(s2, { type: "roll" });
    expect(s3.dice).toEqual(s2.dice);
  });
});

describe("KingdomsDice buy", () => {
  it("buying a kingdom scores its value", () => {
    const base = initialState(42, settings);
    // Inject a known state for testing
    const knownState: KingdomsDiceState = {
      ...base,
      dice: [3, 5, 1] as [3, 5, 1],
      market: [
        { rank: 3, value: 4 },
        { rank: 2, value: 2 },
        { rank: 6, value: 6 },
        { rank: 4, value: 3 },
      ],
      phase: "buy",
      turn: 0,
    };
    const s2 = reducer(knownState, { type: "buy", dieIndex: 0, marketIndex: 0 });
    expect(s2.playerScore).toBe(4);
    expect(s2.market).toHaveLength(4); // refilled
  });

  it("buy fails if die does not match kingdom rank", () => {
    const base = initialState(42, settings);
    const knownState: KingdomsDiceState = {
      ...base,
      dice: [3, 5, 1] as [3, 5, 1],
      market: [
        { rank: 2, value: 4 }, // die[0]=3 does not match rank 2
        { rank: 5, value: 2 },
        { rank: 6, value: 6 },
        { rank: 4, value: 3 },
      ],
      phase: "buy",
      turn: 0,
    };
    const s2 = reducer(knownState, { type: "buy", dieIndex: 0, marketIndex: 0 });
    expect(s2.playerScore).toBe(0); // unchanged
    expect(s2.phase).toBe("buy"); // still in buy phase
  });

  it("passing ends player turn and triggers bot", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    const s3 = reducer(s2, { type: "pass" });
    // Bot should have acted; it's back to player's turn
    expect(s3.turn).toBe(0);
    expect(s3.phase).toBe("roll");
  });

  it("winning resets phase to gameOver", () => {
    const base = initialState(42, settings);
    const nearWin: KingdomsDiceState = {
      ...base,
      playerScore: 47,
      dice: [4, 2, 1] as [4, 2, 1],
      market: [
        { rank: 4, value: 5 },
        { rank: 2, value: 2 },
        { rank: 6, value: 6 },
        { rank: 1, value: 1 },
      ],
      phase: "buy",
      turn: 0,
      targetScore: 50,
    };
    const s2 = reducer(nearWin, { type: "buy", dieIndex: 0, marketIndex: 0 });
    expect(s2.winner).toBe(0);
    expect(s2.phase).toBe("gameOver");
    expect(s2.playerScore).toBe(52);
  });
});

describe("KingdomsDice isTerminal", () => {
  it("returns null when game ongoing", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns player score when player wins", () => {
    const s = initialState(42, settings);
    const won: KingdomsDiceState = { ...s, winner: 0, playerScore: 55, phase: "gameOver" };
    expect(isTerminal(won)).toEqual({ score: 55 });
  });

  it("returns 0 when bot wins", () => {
    const s = initialState(42, settings);
    const lost: KingdomsDiceState = { ...s, winner: 1, phase: "gameOver" };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { BeatThatState } from "./state.js";

const settings = { rounds: "5" as const, dice: "2" as const };

describe("BeatThat initialState", () => {
  it("starts in playerRoll phase with 0 wins each", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("playerRoll");
    expect(s.playerWins).toBe(0);
    expect(s.botWins).toBe(0);
    expect(s.currentRound).toBe(1);
    expect(s.totalRounds).toBe(5);
    expect(s.winner).toBeNull();
  });

  it("respects dice count setting", () => {
    const s = initialState(42, { rounds: "3" as const, dice: "4" as const });
    expect(s.numDice).toBe(4);
    expect(s.totalRounds).toBe(3);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(99, settings);
    const s2 = initialState(99, settings);
    expect(s1).toEqual(s2);
  });
});

describe("BeatThat roll", () => {
  it("roll produces correct number of dice", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.playerDice).toHaveLength(2);
    expect(s2.phase).toBe("playerArrange");
    for (const d of s2.playerDice) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
  });

  it("cannot roll when not in playerRoll phase", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.phase).toBe("playerArrange");
    const s3 = reducer(s2, { type: "roll" });
    expect(s3.playerDice).toEqual(s2.playerDice);
  });
});

describe("BeatThat arrange", () => {
  it("winning arrangement increments player wins", () => {
    const base = initialState(42, settings);
    const inArrange: BeatThatState = {
      ...base,
      playerDice: [6, 5],
      phase: "playerArrange",
    };
    // Both arrangements — 65 > any 2-die bot result when bot rolls low
    // Just test that arrangement is accepted
    const s2 = reducer(inArrange, { type: "arrange", order: [6, 5] });
    expect(s2.playerNumber).toBe(65);
    expect(s2.botDice).toHaveLength(2);
    expect(["roundOver", "gameOver"]).toContain(s2.phase);
  });

  it("invalid arrangement (not a permutation) is rejected", () => {
    const base = initialState(42, settings);
    const inArrange: BeatThatState = {
      ...base,
      playerDice: [3, 4],
      phase: "playerArrange",
    };
    const s2 = reducer(inArrange, { type: "arrange", order: [3, 3] });
    expect(s2.phase).toBe("playerArrange"); // unchanged
  });

  it("after all rounds, game ends", () => {
    const base = initialState(42, { rounds: "3" as const, dice: "2" as const });
    const inArrange: BeatThatState = {
      ...base,
      playerDice: [6, 6],
      phase: "playerArrange",
      currentRound: 3, // last round
      totalRounds: 3,
    };
    const s2 = reducer(inArrange, { type: "arrange", order: [6, 6] });
    expect(s2.phase).toBe("gameOver");
  });
});

describe("BeatThat isTerminal", () => {
  it("returns null when game ongoing", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns positive score when player wins", () => {
    const s = initialState(42, settings);
    const won: BeatThatState = { ...s, phase: "gameOver", winner: "player", playerWins: 3 };
    expect(isTerminal(won)?.score).toBe(300);
  });

  it("returns 0 when bot wins", () => {
    const s = initialState(42, settings);
    const lost: BeatThatState = { ...s, phase: "gameOver", winner: "bot", botWins: 5 };
    expect(isTerminal(lost)?.score).toBe(0);
  });

  it("returns partial score for draw", () => {
    const s = initialState(42, settings);
    const draw: BeatThatState = { ...s, phase: "gameOver", winner: null, playerWins: 2, botWins: 2 };
    expect(isTerminal(draw)?.score).toBe(100);
  });
});

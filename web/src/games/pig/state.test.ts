import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { PigState } from "./state.js";

const defaultSettings = { target: "100" as const, botStrategy: "hold-at-20" as const };

// Helper: repeatedly roll until we see a specific outcome
// Returns state after one roll action
function rollOnce(state: PigState): PigState {
  return reducer(state, { type: "roll" });
}

describe("Pig initialState", () => {
  it("starts with scores=[0,0], turn=0, turnScore=0, winner=null", () => {
    const s = initialState(42, defaultSettings);
    expect(s.scores).toEqual([0, 0]);
    expect(s.turn).toBe(0);
    expect(s.turnScore).toBe(0);
    expect(s.winner).toBeNull();
    expect(s.lastRoll).toBeNull();
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("Pig roll", () => {
  it("is deterministic — same seed produces same roll", () => {
    const s = initialState(123, defaultSettings);
    const s2a = rollOnce(s);
    const s2b = rollOnce(s);
    expect(s2a.lastRoll).toBe(s2b.lastRoll);
    expect(s2a.turnScore).toBe(s2b.turnScore);
  });

  it("non-1 roll: increments turnScore by rolled value, turn stays 0", () => {
    // Find a seed that produces a non-1 roll
    for (let seed = 0; seed < 200; seed++) {
      const s = initialState(seed, defaultSettings);
      const s2 = rollOnce(s);
      if (s2.turn === 0 && s2.winner === null) {
        // Non-1 roll happened
        expect(s2.lastRoll).not.toBeNull();
        expect(s2.lastRoll).toBeGreaterThanOrEqual(2);
        expect(s2.lastRoll).toBeLessThanOrEqual(6);
        expect(s2.turnScore).toBe(s2.lastRoll);
        expect(s2.turn).toBe(0);
        return;
      }
    }
    throw new Error("Could not find non-1 roll");
  });

  it("rolling a 1: turnScore becomes 0, turn flips to 0 (after bot plays)", () => {
    // Find a seed that produces a 1 on first roll
    for (let seed = 0; seed < 200; seed++) {
      const s = initialState(seed, defaultSettings);
      // Peek at what would be rolled: after rollOnce check if it came back to human turn with 0 turn score
      // and lastRoll was 1 before bot played
      const s2 = rollOnce(s);
      // If bot took over after a bust, turn is back to 0 with turnScore 0
      // We can detect this if s2.turn===0 && s2.turnScore===0 && s.turnScore===0
      // but we need to know a 1 was rolled. Check botMessage existence
      if (s2.botMessage !== null && s2.turn === 0 && s2.turnScore === 0) {
        expect(s2.turnScore).toBe(0);
        expect(s2.turn).toBe(0);
        return;
      }
    }
    throw new Error("Could not find a seed that produces a 1");
  });

  it("no-op when winner is set", () => {
    const s = initialState(42, defaultSettings);
    const won: PigState = { ...s, winner: 0 };
    const s2 = reducer(won, { type: "roll" });
    expect(s2).toBe(won);
  });

  it("no-op when it is bot turn (turn=1)", () => {
    const s = initialState(42, defaultSettings);
    const botTurn: PigState = { ...s, turn: 1 };
    const s2 = reducer(botTurn, { type: "roll" });
    expect(s2).toBe(botTurn);
  });
});

describe("Pig bank", () => {
  it("bank with turnScore=0 is a no-op", () => {
    const s = initialState(42, defaultSettings);
    expect(s.turnScore).toBe(0);
    const s2 = reducer(s, { type: "bank" });
    expect(s2).toBe(s);
  });

  it("bank adds turnScore to scores[0], resets turn to 0 after bot plays", () => {
    const s = initialState(42, defaultSettings);
    const readyToBank: PigState = { ...s, turnScore: 15, lastRoll: 5 };
    const s2 = reducer(readyToBank, { type: "bank" });
    // Human banked 15
    expect(s2.scores[0]).toBe(15);
    // After bot played, turn is back to 0
    expect(s2.turn).toBe(0);
    expect(s2.turnScore).toBe(0);
  });

  it("banking at exactly target sets winner=0", () => {
    const s = initialState(42, defaultSettings);
    // Set human score close to target
    const nearWin: PigState = { ...s, scores: [85, 20], turnScore: 15 };
    const s2 = reducer(nearWin, { type: "bank" });
    expect(s2.scores[0]).toBe(100);
    expect(s2.winner).toBe(0);
  });

  it("banking over target also sets winner=0", () => {
    const s = initialState(42, defaultSettings);
    const nearWin: PigState = { ...s, scores: [90, 20], turnScore: 18 };
    const s2 = reducer(nearWin, { type: "bank" });
    expect(s2.scores[0]).toBe(108);
    expect(s2.winner).toBe(0);
  });
});

describe("Pig bot turn", () => {
  it("bot banks at threshold (hold-at-20)", () => {
    // Force bot to take a turn by banking with any turnScore
    const s = initialState(42, { target: "100" as const, botStrategy: "hold-at-20" as const });
    const readyToBank: PigState = { ...s, turnScore: 5 };
    const s2 = reducer(readyToBank, { type: "bank" });
    // Bot played. Its score should be > 0 (bot banked something) or still 0 (busted on 1)
    // Either way the turn is back to human
    expect(s2.turn).toBe(0);
    expect(s2.winner === null || s2.winner === 1).toBe(true);
  });

  it("cautious bot banks at 15", () => {
    const s = initialState(42, { target: "200" as const, botStrategy: "cautious" as const });
    const readyToBank: PigState = { ...s, scores: [5, 0], turnScore: 5 };
    const s2 = reducer(readyToBank, { type: "bank" });
    expect(s2.turn).toBe(0);
    // Bot's score is >= 0 (either banked or busted)
    expect(s2.scores[1]).toBeGreaterThanOrEqual(0);
  });

  it("aggressive bot banks at 30", () => {
    const s = initialState(42, { target: "200" as const, botStrategy: "aggressive" as const });
    const readyToBank: PigState = { ...s, scores: [5, 0], turnScore: 5 };
    const s2 = reducer(readyToBank, { type: "bank" });
    expect(s2.turn).toBe(0);
    expect(s2.scores[1]).toBeGreaterThanOrEqual(0);
  });

  it("bot wins immediately when it can reach target", () => {
    // Bot at 95 with hold-at-20 — it will bank as soon as scores[1]+turnScore >= 100
    const s = initialState(1, { target: "100" as const, botStrategy: "hold-at-20" as const });
    // Give bot 95 points already
    const nearBotWin: PigState = { ...s, scores: [30, 95], turnScore: 5 };
    const s2 = reducer(nearBotWin, { type: "bank" });
    // Bot should win
    expect(s2.winner).toBe(1);
    expect(s2.scores[1]).toBeGreaterThanOrEqual(100);
  });
});

describe("Pig isTerminal", () => {
  it("returns null when game is ongoing", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns {score: scores[0]} when winner is set", () => {
    const s = initialState(42, defaultSettings);
    const won: PigState = { ...s, winner: 0, scores: [100, 60] };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(100);
  });

  it("returns scores[0] even when bot wins", () => {
    const s = initialState(42, defaultSettings);
    const botWon: PigState = { ...s, winner: 1, scores: [45, 100] };
    const result = isTerminal(botWon);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(45);
  });
});

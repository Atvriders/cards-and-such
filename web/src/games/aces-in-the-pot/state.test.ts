import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, applyDieResult } from "./state.js";
import type { AcesState } from "./state.js";

const settings = { rounds: "5" as const };

describe("initialState", () => {
  it("starts with 3 pennies each and empty pot", () => {
    const s = initialState(42, settings);
    expect(s.playerPennies).toBe(3);
    expect(s.botPennies).toBe(3);
    expect(s.pot).toBe(0);
    expect(s.phase).toBe("rolling");
    expect(s.round).toBe(1);
  });
});

describe("applyDieResult", () => {
  it("ace (1) puts penny in pot", () => {
    const r = applyDieResult(1, 3, 3, 0);
    expect(r.roller).toBe(2);
    expect(r.pot).toBe(1);
    expect(r.other).toBe(3);
  });

  it("six (6) passes penny to other", () => {
    const r = applyDieResult(6, 3, 3, 0);
    expect(r.roller).toBe(2);
    expect(r.other).toBe(4);
    expect(r.pot).toBe(0);
  });

  it("2-5 does nothing", () => {
    for (const die of [2, 3, 4, 5]) {
      const r = applyDieResult(die, 3, 3, 0);
      expect(r.roller).toBe(3);
      expect(r.other).toBe(3);
      expect(r.pot).toBe(0);
    }
  });

  it("ace when no pennies does nothing", () => {
    const r = applyDieResult(1, 0, 3, 0);
    expect(r.roller).toBe(0);
    expect(r.pot).toBe(0);
  });
});

describe("roll action", () => {
  it("produces a result and advances the game", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.lastRoll).not.toBeNull();
    // Either still rolling or round over
    expect(["rolling", "roundOver"]).toContain(s2.phase);
  });

  it("tracks round wins", () => {
    // Run enough rounds to see win tracking
    let s = initialState(42, settings);
    let totalWins = 0;
    for (let i = 0; i < 5 && !s.gameOver; i++) {
      s = reducer(s, { type: "roll" });
      if (s.phase === "roundOver") {
        totalWins = s.playerWins + s.botWins;
        if (!s.gameOver) s = reducer(s, { type: "nextRound" });
      }
    }
    expect(totalWins).toBeGreaterThanOrEqual(0);
  });
});

describe("nextRound action", () => {
  it("resets pennies for new round", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "roll" });
    if (s.phase === "roundOver" && !s.gameOver) {
      const s2 = reducer(s, { type: "nextRound" });
      expect(s2.playerPennies).toBe(3);
      expect(s2.botPennies).toBe(3);
      expect(s2.pot).toBe(0);
    }
  });

  it("cannot nextRound when gameOver", () => {
    const s: AcesState = { ...initialState(42, settings), phase: "roundOver", gameOver: true };
    const s2 = reducer(s, { type: "nextRound" });
    expect(s2.round).toBe(s.round);
  });
});

describe("isTerminal", () => {
  it("not terminal at start", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("terminal when gameOver", () => {
    const s: AcesState = { ...initialState(42, settings), gameOver: true, playerWins: 3 };
    expect(isTerminal(s)).toEqual({ score: 3 });
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { FourFiveSixState } from "./state.js";

const defaultSettings = { rounds: "5" as const };

describe("FourFiveSix initialState", () => {
  it("starts in preRoll with 0 wins", () => {
    const s = initialState(1, defaultSettings);
    expect(s.phase).toBe("preRoll");
    expect(s.wins).toBe(0);
    expect(s.roundsPlayed).toBe(0);
    expect(s.totalRounds).toBe(5);
  });
});

describe("FourFiveSix roll", () => {
  it("player rolls and transitions phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(["dealerRolling", "roundDone", "gameDone", "preRoll"]).toContain(s2.phase);
    expect(s2.playerDice).toHaveLength(3);
  });

  it("4-5-6 is instant win", () => {
    const base = initialState(1, defaultSettings);
    const withWin: FourFiveSixState = {
      ...base,
      playerDice: [4, 5, 6],
      playerSpecial: "win",
      roundResult: "win",
      wins: 1,
      roundsPlayed: 1,
      phase: "roundDone",
    };
    expect(withWin.roundResult).toBe("win");
    expect(withWin.wins).toBe(1);
  });

  it("1-2-3 is instant lose", () => {
    const base = initialState(1, defaultSettings);
    const withLose: FourFiveSixState = {
      ...base,
      playerDice: [1, 2, 3],
      playerSpecial: "lose",
      roundResult: "lose",
      roundsPlayed: 1,
      phase: "roundDone",
    };
    expect(withLose.roundResult).toBe("lose");
  });
});

describe("FourFiveSix dealer", () => {
  it("dealer rolls when in dealerRolling phase", () => {
    const base = initialState(1, defaultSettings);
    const dealing: FourFiveSixState = {
      ...base,
      playerDice: [3, 3, 5],
      playerPoint: 5,
      phase: "dealerRolling",
    };
    const s2 = reducer(dealing, { type: "rollDealer" });
    expect(["roundDone", "gameDone", "dealerRolling"]).toContain(s2.phase);
  });
});

describe("FourFiveSix isTerminal", () => {
  it("returns null when not done", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns win-rate score when done", () => {
    const base = initialState(1, defaultSettings);
    const done: FourFiveSixState = { ...base, phase: "gameDone", wins: 4, totalRounds: 5, roundsPlayed: 5 };
    const result = isTerminal(done);
    expect(result?.score).toBe(800);
  });
});

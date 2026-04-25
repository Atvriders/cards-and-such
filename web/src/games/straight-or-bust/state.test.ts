import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkStraight } from "./state.js";
import type { StraightOrBustState } from "./state.js";

const defaultSettings = { rounds: "7" as const };

describe("StraightOrBust initialState", () => {
  it("starts at round 1 with preRoll phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.round).toBe(1);
    expect(s.phase).toBe("preRoll");
    expect(s.totalScore).toBe(0);
    expect(s.rollsUsed).toBe(0);
  });

  it("is deterministic", () => {
    expect(initialState(7, defaultSettings)).toEqual(initialState(7, defaultSettings));
  });
});

describe("StraightOrBust checkStraight", () => {
  it("detects low straight 1-2-3-4-5 → 150", () => {
    const dice = [1, 2, 3, 4, 5].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    const result = checkStraight(dice);
    expect(result.straight).toBe(true);
    expect(result.score).toBe(150);
  });

  it("detects high straight 2-3-4-5-6 → 200", () => {
    const dice = [2, 3, 4, 5, 6].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    const result = checkStraight(dice);
    expect(result.straight).toBe(true);
    expect(result.score).toBe(200);
  });

  it("returns false for non-straight", () => {
    const dice = [1, 1, 3, 4, 5].map((v) => ({ value: v as 1|2|3|4|5|6, kept: false }));
    const result = checkStraight(dice);
    expect(result.straight).toBe(false);
    expect(result.score).toBe(0);
  });
});

describe("StraightOrBust roll", () => {
  it("rolls 5 dice and moves to rolling phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.dice.length).toBe(5);
    expect(["rolling", "done"]).toContain(s2.phase);
    expect(s2.rollsUsed).toBe(1);
  });

  it("busts after 3 rolls without straight", () => {
    // Roll 3 times and check: either done (straight) or busted (score=0)
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    if (s.phase === "done") return; // straight on first roll — skip
    s = reducer(s, { type: "roll" });
    if (s.phase === "done") return;
    s = reducer(s, { type: "roll" });
    expect(s.phase).toBe("done");
    // If busted, score for this round should be 0
    if (!checkStraight(s.dice).straight) {
      expect(s.roundResults[0]?.score).toBe(0);
    }
  });
});

describe("StraightOrBust nextRound", () => {
  it("advances round and resets dice", () => {
    const s: StraightOrBustState = {
      ...initialState(42, defaultSettings),
      phase: "done",
      round: 1,
      roundResults: [{ straight: false, score: 0, rollsTaken: 3 }],
    };
    const s2 = reducer(s, { type: "nextRound" });
    expect(s2.round).toBe(2);
    expect(s2.phase).toBe("preRoll");
    expect(s2.rollsUsed).toBe(0);
  });

  it("sets gameOver after last round", () => {
    const maxRounds = parseInt(defaultSettings.rounds, 10);
    const s: StraightOrBustState = {
      ...initialState(42, defaultSettings),
      phase: "done",
      round: maxRounds,
      roundResults: Array(maxRounds).fill({ straight: false, score: 0, rollsTaken: 3 }),
    };
    const s2 = reducer(s, { type: "nextRound" });
    expect(s2.gameOver).toBe(true);
  });
});

describe("StraightOrBust isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score when game over", () => {
    const s: StraightOrBustState = { ...initialState(1, defaultSettings), gameOver: true, totalScore: 450 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(450);
  });
});

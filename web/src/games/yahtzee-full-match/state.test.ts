import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  ALL_CATEGORIES,
  UPPER_CATEGORIES,
  computeCategoryScore,
  upperSum,
  totalScore,
  cpuChooseCategory,
} from "./state.js";
import type { YahtzeeFullMatchState, PlayerCard } from "./state.js";

const defaultSettings = { _dummy: false };

function withDice(
  state: YahtzeeFullMatchState,
  values: ReadonlyArray<1 | 2 | 3 | 4 | 5 | 6>,
): YahtzeeFullMatchState {
  return {
    ...state,
    dice: values.map((v) => ({ value: v, kept: false })),
  };
}

describe("yahtzee-full-match initialState", () => {
  it("starts a fresh game with 13 rounds and empty scorecards", () => {
    const s = initialState(42, defaultSettings);
    expect(s.round).toBe(1);
    expect(s.rollsUsed).toBe(0);
    expect(s.dice.length).toBe(5);
    expect(s.phase).toBe("rolling");
    expect(s.turn).toBe("player");
    expect(Object.keys(s.player.scores).length).toBe(0);
    expect(Object.keys(s.cpu.scores).length).toBe(0);
    expect(s.player.yahtzeeBonus).toBe(0);
  });

  it("is deterministic under the same seed", () => {
    const a = initialState(123, defaultSettings);
    const b = initialState(123, defaultSettings);
    expect(a).toEqual(b);
  });

  it("isTerminal returns null on a fresh state", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });
});

describe("yahtzee-full-match reducer — roll", () => {
  it("advances rollsUsed from 0 -> 1 and produces dice in [1..6]", () => {
    const s0 = initialState(7, defaultSettings);
    const s1 = reducer(s0, { type: "roll" });
    expect(s1.rollsUsed).toBe(1);
    for (const d of s1.dice) {
      expect(d.value).toBeGreaterThanOrEqual(1);
      expect(d.value).toBeLessThanOrEqual(6);
    }
    // Deterministic
    const s1b = reducer(s0, { type: "roll" });
    expect(s1b.dice).toEqual(s1.dice);
  });

  it("blocks a 4th roll and returns the same state reference", () => {
    let s = initialState(7, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "roll" });
    expect(s.rollsUsed).toBe(3);
    expect(s.phase).toBe("scoring");
    const s4 = reducer(s, { type: "roll" });
    expect(s4).toBe(s);
  });

  it("toggleKeep does nothing before any roll (illegal action returns same ref)", () => {
    const s = initialState(7, defaultSettings);
    const s2 = reducer(s, { type: "toggleKeep", index: 0 });
    expect(s2).toBe(s);
  });

  it("toggleKeep marks a die as kept after a roll", () => {
    let s = initialState(7, defaultSettings);
    s = reducer(s, { type: "roll" });
    const s2 = reducer(s, { type: "toggleKeep", index: 2 });
    expect(s2.dice[2]!.kept).toBe(true);
  });
});

describe("yahtzee-full-match reducer — scoring", () => {
  it("scores Aces correctly", () => {
    let s = initialState(7, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = withDice(s, [1, 1, 1, 4, 5]);
    const after = reducer(s, { type: "score", category: "aces" });
    expect(after.player.scores["aces"]).toBe(3);
    // Player scored, now CPU's turn auto-runs
    expect(after.turn).toBe("cpu");
    expect(after.phase).toBe("cpuTurn");
  });

  it("rejects scoring without a roll", () => {
    const s = initialState(7, defaultSettings);
    const s2 = reducer(s, { type: "score", category: "aces" });
    expect(s2).toBe(s);
  });

  it("rejects re-scoring an already-used category", () => {
    let s = initialState(7, defaultSettings);
    s = reducer(s, { type: "roll" });
    s = withDice(s, [1, 1, 1, 4, 5]);
    s = reducer(s, { type: "score", category: "aces" });
    // CPU turn fires
    s = reducer(s, { type: "cpuTurn" });
    // Now back to player. Roll, then try to re-score aces.
    s = reducer(s, { type: "roll" });
    s = withDice(s, [1, 1, 1, 1, 1]);
    const before = s;
    const after = reducer(s, { type: "score", category: "aces" });
    expect(after).toBe(before);
  });

  it("applies the Yahtzee +100 bonus chip when yahtzee already scored", () => {
    // Build a card where yahtzee is already filled at 50.
    let s = initialState(7, defaultSettings);
    s.player.scores["yahtzee"] = 50;
    // Need an open chance to score into.
    s = reducer(s, { type: "roll" });
    s = withDice(s, [3, 3, 3, 3, 3]);
    const after = reducer(s, { type: "score", category: "chance" });
    // Chance is 15 (sum); plus the +100 bonus chip
    expect(after.player.scores["chance"]).toBe(15);
    expect(after.player.yahtzeeBonus).toBe(100);
  });

  it("applies the Yahtzee joker rule: bonus yahtzee into Full House scores 25", () => {
    let s = initialState(7, defaultSettings);
    // Pre-fill yahtzee and the matching upper section (fives, since dice will be 5s)
    s.player.scores["yahtzee"] = 50;
    s.player.scores["fives"] = 25; // upper-section "fives" is filled
    s = reducer(s, { type: "roll" });
    s = withDice(s, [5, 5, 5, 5, 5]);
    const after = reducer(s, { type: "score", category: "fullHouse" });
    expect(after.player.scores["fullHouse"]).toBe(25);
  });
});

describe("yahtzee-full-match scoring totals", () => {
  it("awards a 35-point upper bonus when upper sum >= 63", () => {
    const card: PlayerCard = {
      scores: { aces: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18 },
      yahtzeeBonus: 0,
    };
    expect(upperSum(card)).toBe(63);
    expect(totalScore(card)).toBe(63 + 35);
  });

  it("no upper bonus when sum < 63", () => {
    const card: PlayerCard = {
      scores: { aces: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 17 },
      yahtzeeBonus: 0,
    };
    expect(totalScore(card)).toBe(62);
  });

  it("computeCategoryScore: large straight on 1..5 is 40", () => {
    const dice = [1, 2, 3, 4, 5].map((v) => ({ value: v as 1 | 2 | 3 | 4 | 5, kept: false }));
    const card: PlayerCard = { scores: {}, yahtzeeBonus: 0 };
    expect(computeCategoryScore(dice, "largeStraight", card)).toBe(40);
    expect(computeCategoryScore(dice, "smallStraight", card)).toBe(30);
  });
});

describe("yahtzee-full-match CPU heuristic", () => {
  it("picks a high-value category over zero scratches", () => {
    const card: PlayerCard = { scores: {}, yahtzeeBonus: 0 };
    const dice = [6, 6, 6, 6, 6].map((v) => ({ value: v as 6, kept: false }));
    const pick = cpuChooseCategory(card, dice);
    // Best is yahtzee (50)
    expect(pick).toBe("yahtzee");
  });

  it("avoids scratching Yahtzee with a low-value roll when other open boxes exist", () => {
    const card: PlayerCard = { scores: {}, yahtzeeBonus: 0 };
    const dice = [1, 2, 3, 4, 5].map((v) => ({ value: v as 1 | 2 | 3 | 4 | 5, kept: false }));
    const pick = cpuChooseCategory(card, dice);
    // 1..5 large straight is 40 — CPU should pick largeStraight, not yahtzee (=0)
    expect(pick).toBe("largeStraight");
  });
});

describe("yahtzee-full-match terminal state", () => {
  it("becomes terminal after both player and CPU fill all 13 rows", () => {
    let s = initialState(42, defaultSettings);
    for (let i = 0; i < ALL_CATEGORIES.length; i++) {
      const cat = ALL_CATEGORIES[i]!;
      // Player roll + score
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "score", category: cat });
      // CPU auto-turn
      if (s.phase === "cpuTurn") {
        s = reducer(s, { type: "cpuTurn" });
      }
    }
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(typeof t?.score).toBe("number");
    expect(t!.score).toBeGreaterThanOrEqual(0);
    // All upper categories present on both cards
    for (const c of UPPER_CATEGORIES) {
      expect(c in s.player.scores).toBe(true);
      expect(c in s.cpu.scores).toBe(true);
    }
  });
});

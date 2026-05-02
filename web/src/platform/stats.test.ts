import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ACHIEVEMENTS } from "./stats.js";
import type { StatsState } from "./stats.js";

/**
 * Predicate-level tests for every achievement in `ACHIEVEMENTS`.
 *
 * Each case sets up just enough localStorage / `StatsState` to satisfy
 * the predicate, then asserts `isUnlocked` flips to true. Together these
 * provide a regression net against renaming an id, breaking a probe, or
 * silently dropping an entry from the array. The negative baseline
 * (zeroed state -> zero unlocks except `champion`-style false cases)
 * guards against predicates that always return true.
 */

function emptyStats(): StatsState {
  return {
    totalPlayed: 0,
    totalWins: 0,
    longestStreak: 0,
    currentStreak: 0,
    perGame: {},
    perCategory: {},
    daysPlayed: [],
    unlocked: [],
  };
}

function find(id: string) {
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  if (!a) throw new Error(`achievement '${id}' missing from ACHIEVEMENTS`);
  return a;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("ACHIEVEMENTS – existing", () => {
  it("first-win fires after one win", () => {
    const s = emptyStats();
    s.totalWins = 1;
    expect(find("first-win").isUnlocked(s)).toBe(true);
  });

  it("ten-wins / hundred-wins fire at thresholds", () => {
    const s = emptyStats();
    s.totalWins = 10;
    expect(find("ten-wins").isUnlocked(s)).toBe(true);
    s.totalWins = 100;
    expect(find("hundred-wins").isUnlocked(s)).toBe(true);
  });

  it("daily-player fires at 7 distinct days", () => {
    const s = emptyStats();
    s.daysPlayed = ["a", "b", "c", "d", "e", "f", "g"];
    expect(find("daily-player").isUnlocked(s)).toBe(true);
  });

  it("sampler fires at 10 distinct categories", () => {
    const s = emptyStats();
    for (let i = 0; i < 10; i++) s.perCategory[`cat-${i}`] = 1;
    expect(find("sampler").isUnlocked(s)).toBe(true);
  });

  it("champion fires after 5 best-score games", () => {
    const s = emptyStats();
    for (let i = 0; i < 5; i++) s.perGame[`g-${i}`] = { played: 1, wins: 0, best: 100 };
    expect(find("champion").isUnlocked(s)).toBe(true);
  });
});

describe("ACHIEVEMENTS – breadth + pace", () => {
  it("card-shark fires at 50 unique games", () => {
    const s = emptyStats();
    for (let i = 0; i < 50; i++) s.perGame[`g-${i}`] = { played: 1, wins: 0, best: 0 };
    expect(find("card-shark").isUnlocked(s)).toBe(true);
  });

  it("card-sage fires at 200 unique games", () => {
    const s = emptyStats();
    for (let i = 0; i < 200; i++) s.perGame[`g-${i}`] = { played: 1, wins: 0, best: 0 };
    expect(find("card-sage").isUnlocked(s)).toBe(true);
  });

  it("five-and-done fires after winning 5 different games", () => {
    const s = emptyStats();
    for (let i = 0; i < 5; i++) s.perGame[`g-${i}`] = { played: 1, wins: 1, best: 0 };
    expect(find("five-and-done").isUnlocked(s)).toBe(true);
  });

  it("speed-run fires when a best-time is under 30s", () => {
    localStorage.setItem("cards-best-times", JSON.stringify({ klondike: 20 }));
    expect(find("speed-run").isUnlocked(emptyStats())).toBe(true);
  });

  it("marathon fires when a best-time exceeds 10 minutes", () => {
    localStorage.setItem("cards-best-times", JSON.stringify({ epic: 700 }));
    expect(find("marathon").isUnlocked(emptyStats())).toBe(true);
  });
});

describe("ACHIEVEMENTS – daily streaks", () => {
  it("streak-starter fires at a 3-day streak", () => {
    localStorage.setItem("cards-daily-streak", JSON.stringify({ current: 3, longest: 3, lastDate: "2026-01-03", days: [] }));
    expect(find("streak-starter").isUnlocked(emptyStats())).toBe(true);
  });

  it("streak-keeper fires at 7 days", () => {
    localStorage.setItem("cards-daily-streak", JSON.stringify({ current: 7, longest: 7, lastDate: "2026-01-07", days: [] }));
    expect(find("streak-keeper").isUnlocked(emptyStats())).toBe(true);
  });

  it("streak-legend fires at 30 days (and respects `longest`)", () => {
    localStorage.setItem("cards-daily-streak", JSON.stringify({ current: 1, longest: 30, lastDate: "2026-01-30", days: [] }));
    expect(find("streak-legend").isUnlocked(emptyStats())).toBe(true);
  });
});

describe("ACHIEVEMENTS – ratings + favorites", () => {
  it("tastemaker fires after rating 25 games", () => {
    const map: Record<string, number> = {};
    for (let i = 0; i < 25; i++) map[`g-${i}`] = 3;
    localStorage.setItem("cards-ratings", JSON.stringify(map));
    expect(find("tastemaker").isUnlocked(emptyStats())).toBe(true);
  });

  it("critic fires after a 5-star rating", () => {
    localStorage.setItem("cards-ratings", JSON.stringify({ klondike: 5 }));
    expect(find("critic").isUnlocked(emptyStats())).toBe(true);
  });

  it("collector fires at 10 favorites", () => {
    const favs: string[] = [];
    for (let i = 0; i < 10; i++) favs.push(`g-${i}`);
    localStorage.setItem("cards-favorites", JSON.stringify(favs));
    expect(find("collector").isUnlocked(emptyStats())).toBe(true);
  });
});

describe("ACHIEVEMENTS – hints", () => {
  it("hint-free fires only with hints used + 10 wins", () => {
    const s = emptyStats();
    s.totalWins = 10;
    // No hints recorded yet -> still locked.
    expect(find("hint-free").isUnlocked(s)).toBe(false);
    localStorage.setItem("cards-hints-used", JSON.stringify({ klondike: 1 }));
    expect(find("hint-free").isUnlocked(s)).toBe(true);
  });

  it("hint-reliant fires after 50 total hints", () => {
    localStorage.setItem("cards-hints-used", JSON.stringify({ a: 30, b: 20 }));
    expect(find("hint-reliant").isUnlocked(emptyStats())).toBe(true);
  });
});

describe("ACHIEVEMENTS – per-category breadth", () => {
  const catCases: Array<[string, string]> = [
    ["solitaire-specialist", "solitaire"],
    ["dice-devotee", "dice"],
    ["card-connoisseur", "cards"],
    ["board-builder", "board"],
    ["arcade-ace", "arcade"],
  ];

  for (const [id, cat] of catCases) {
    it(`${id} fires at 25 ${cat} plays`, () => {
      const s = emptyStats();
      s.perCategory[cat] = 25;
      expect(find(id).isUnlocked(s)).toBe(true);
    });
  }
});

describe("ACHIEVEMENTS – baseline", () => {
  it("none of the new achievements fire on a fresh state", () => {
    const s = emptyStats();
    const newIds = [
      "card-shark", "card-sage", "five-and-done",
      "speed-run", "marathon",
      "streak-starter", "streak-keeper", "streak-legend",
      "tastemaker", "critic", "collector",
      "hint-free", "hint-reliant",
      "solitaire-specialist", "dice-devotee", "card-connoisseur",
      "board-builder", "arcade-ace",
    ];
    for (const id of newIds) {
      expect(find(id).isUnlocked(s)).toBe(false);
    }
  });

  it("array contains 18 new achievements (24 total)", () => {
    expect(ACHIEVEMENTS.length).toBe(24);
  });
});

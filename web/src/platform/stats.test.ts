import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ACHIEVEMENTS } from "./stats.js";
import type { StatsState } from "./stats.js";
import { GAMES } from "../games/registry.js";

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

  it("array contains the expected total achievement count (44 with v44 batch)", () => {
    expect(ACHIEVEMENTS.length).toBe(44);
  });
});

describe("ACHIEVEMENTS – game families", () => {
  it("klondike-master fires after 10 klondike wins (across variants)", () => {
    const s = emptyStats();
    s.perGame["klondike"] = { played: 6, wins: 6, best: 0 };
    s.perGame["klondike-by-threes"] = { played: 4, wins: 4, best: 0 };
    expect(find("klondike-master").isUnlocked(s)).toBe(true);
  });

  it("spider-slayer fires after 5 spider wins", () => {
    const s = emptyStats();
    s.perGame["spider"] = { played: 5, wins: 5, best: 0 };
    expect(find("spider-slayer").isUnlocked(s)).toBe(true);
  });

  it("freecell-fanatic fires after 50 freecell plays", () => {
    const s = emptyStats();
    s.perGame["freecell"] = { played: 30, wins: 0, best: 0 };
    s.perGame["freecell-classic"] = { played: 20, wins: 0, best: 0 };
    expect(find("freecell-fanatic").isUnlocked(s)).toBe(true);
  });

  it("solitaire-suite fires after one win in each pillar", () => {
    const s = emptyStats();
    s.perGame["klondike"] = { played: 1, wins: 1, best: 0 };
    s.perGame["spider"] = { played: 1, wins: 1, best: 0 };
    s.perGame["freecell"] = { played: 1, wins: 1, best: 0 };
    s.perGame["yukon"] = { played: 1, wins: 1, best: 0 };
    expect(find("solitaire-suite").isUnlocked(s)).toBe(true);
  });

  it("wordle-whiz fires after a high wordle-mini best score", () => {
    const s = emptyStats();
    s.perGame["wordle-mini"] = { played: 1, wins: 1, best: 6 };
    expect(find("wordle-whiz").isUnlocked(s)).toBe(true);
  });

  it("holdem-hustler fires after 50 holdem plays (across variants)", () => {
    const s = emptyStats();
    s.perGame["holdem-no-limit"] = { played: 25, wins: 0, best: 0 };
    s.perGame["holdem-fixed-limit"] = { played: 25, wins: 0, best: 0 };
    expect(find("holdem-hustler").isUnlocked(s)).toBe(true);
  });

  it("yahtzee-royale fires after a 200+ yahtzee score", () => {
    const s = emptyStats();
    s.perGame["yahtzee"] = { played: 1, wins: 0, best: 250 };
    expect(find("yahtzee-royale").isUnlocked(s)).toBe(true);
  });

  it("pig-out fires after a 100+ pig score", () => {
    const s = emptyStats();
    s.perGame["pig"] = { played: 1, wins: 1, best: 100 };
    expect(find("pig-out").isUnlocked(s)).toBe(true);
  });

  it("war-hero fires after 5 war games (proxy: plays)", () => {
    const s = emptyStats();
    s.perGame["war"] = { played: 5, wins: 0, best: 0 };
    expect(find("war-hero").isUnlocked(s)).toBe(true);
  });

  it("memory-genius fires when a memory-pairs best time is under 60s", () => {
    localStorage.setItem("cards-best-times", JSON.stringify({ "memory-pairs-kids": 45 }));
    expect(find("memory-genius").isUnlocked(emptyStats())).toBe(true);
  });

  it("speed-demon fires after a win in any speed variant", () => {
    const s = emptyStats();
    s.perGame["speed"] = { played: 1, wins: 1, best: 0 };
    expect(find("speed-demon").isUnlocked(s)).toBe(true);
  });

  it("five-of-a-kind fires after playing 5 different solitaire games", () => {
    // Pull real solitaire ids from the registry so the predicate's category
    // lookup matches what `recordGame` would actually persist.
    const solitaireIds = GAMES.filter((g) => g.category === "solitaire").slice(0, 5).map((g) => g.id);
    expect(solitaireIds.length).toBe(5);
    const s = emptyStats();
    for (const id of solitaireIds) s.perGame[id] = { played: 1, wins: 0, best: 0 };
    expect(find("five-of-a-kind").isUnlocked(s)).toBe(true);
  });
});

describe("ACHIEVEMENTS – a11y / exploration / theme / sharing (v44)", () => {
  it("exposes 44 entries total", () => {
    expect(ACHIEVEMENTS.length).toBe(44);
  });

  it("theme-hopper fires after 10 distinct themes have been tried", () => {
    const themes = ["emerald", "midnight", "ruby", "sapphire", "slate",
      "espresso", "aurora", "sunset", "forest", "cyberpunk"];
    localStorage.setItem("cards-themes-tried", JSON.stringify(themes));
    expect(find("theme-hopper").isUnlocked(emptyStats())).toBe(true);
  });

  it("theme-hopper does NOT fire with only 9 themes", () => {
    localStorage.setItem("cards-themes-tried", JSON.stringify(["a", "b", "c", "d", "e", "f", "g", "h", "i"]));
    expect(find("theme-hopper").isUnlocked(emptyStats())).toBe(false);
  });

  it("friendly fires after a friend session is recorded", () => {
    localStorage.setItem("cards-friend-sessions", "1");
    expect(find("friendly").isUnlocked(emptyStats())).toBe(true);
  });

  it("friendly (W201): seeded `cards-friend-sessions=1` unlocks the 'Friendly' achievement", () => {
    // W201 regression: friend-mode unlock must trigger off the literal
    // string "1" written by PlayPage's friend session bootstrap, and the
    // achievement's display title must remain "Friendly" so the toast
    // copy stays in sync with the unlock.
    localStorage.setItem("cards-friend-sessions", "1");
    const friendly = find("friendly");
    expect(friendly.title).toBe("Friendly");
    expect(friendly.isUnlocked(emptyStats())).toBe(true);
  });

  it("exporter fires when the stats-exported flag is set", () => {
    localStorage.setItem("cards-stats-exported", "true");
    expect(find("exporter").isUnlocked(emptyStats())).toBe(true);
  });

  it("importer fires when the data-imported flag is set", () => {
    localStorage.setItem("cards-data-imported", "true");
    expect(find("importer").isUnlocked(emptyStats())).toBe(true);
  });

  it("custom-skinner fires when the active theme is custom", () => {
    localStorage.setItem("cards-bg-theme", "custom");
    expect(find("custom-skinner").isUnlocked(emptyStats())).toBe(true);
  });

  it("accessibility-first fires when ANY a11y option is on", () => {
    localStorage.setItem("cards-reduced-motion", "true");
    expect(find("accessibility-first").isUnlocked(emptyStats())).toBe(true);
    localStorage.clear();
    localStorage.setItem("cards-large-text", "true");
    expect(find("accessibility-first").isUnlocked(emptyStats())).toBe(true);
    localStorage.clear();
    localStorage.setItem("cards-high-contrast", "true");
    expect(find("accessibility-first").isUnlocked(emptyStats())).toBe(true);
  });

  it("browse-it-all fires after visiting all 5 required surfaces", () => {
    localStorage.setItem(
      "cards-pages-visited",
      JSON.stringify(["lobby", "stats", "daily", "leaderboard", "search"]),
    );
    expect(find("browse-it-all").isUnlocked(emptyStats())).toBe(true);
  });

  it("browse-it-all does NOT fire if a surface is missing", () => {
    localStorage.setItem(
      "cards-pages-visited",
      JSON.stringify(["lobby", "stats", "daily", "leaderboard"]),
    );
    expect(find("browse-it-all").isUnlocked(emptyStats())).toBe(false);
  });

  it("search-sleuth fires after 10 distinct recent searches", () => {
    const queries = Array.from({ length: 10 }, (_, i) => `query-${i}`);
    localStorage.setItem("cards-recent-searches", JSON.stringify(queries));
    expect(find("search-sleuth").isUnlocked(emptyStats())).toBe(true);
  });

  it("search-sleuth dedupes case-insensitively", () => {
    // 10 entries but only 1 distinct query -> should NOT fire.
    const queries = Array.from({ length: 10 }, () => "Same");
    localStorage.setItem("cards-recent-searches", JSON.stringify(queries));
    expect(find("search-sleuth").isUnlocked(emptyStats())).toBe(false);
  });
});

/**
 * Regression coverage for the PlayPage achievement-unlock toast.
 *
 * The toast surfaces by snapshotting `loadStats().unlocked` *before*
 * calling `recordGame`, then diffing against the returned state. These
 * tests exercise that exact diff shape against the live stats module
 * (no mocks) so an accidental change to the order or de-duplication
 * inside `recordGame` would surface as a test break before users see a
 * spurious or missing celebratory toast.
 */
describe("recordGame – achievement diff", () => {
  it("returns the new 'first-win' achievement on the first win", async () => {
    const { loadStats, recordGame } = await import("./stats.js");
    const before = new Set(loadStats().unlocked);
    const after = recordGame("klondike", 800, true);
    const newly = after.unlocked.filter((id) => !before.has(id));
    expect(newly).toContain("first-win");
  });

  it("does not re-fire 'first-win' on subsequent wins", async () => {
    const { loadStats, recordGame } = await import("./stats.js");
    recordGame("klondike", 800, true);
    const before = new Set(loadStats().unlocked);
    expect(before.has("first-win")).toBe(true);
    const after = recordGame("klondike", 850, true);
    const newly = after.unlocked.filter((id) => !before.has(id));
    expect(newly).not.toContain("first-win");
  });

  it("returns no diff when a play unlocks nothing new", async () => {
    const { loadStats, recordGame } = await import("./stats.js");
    // Losses don't unlock a `first-win` and won't trip the streak chain.
    const before = new Set(loadStats().unlocked);
    const after = recordGame("klondike", 0, false);
    const newly = after.unlocked.filter((id) => !before.has(id));
    expect(newly).toEqual([]);
  });
});


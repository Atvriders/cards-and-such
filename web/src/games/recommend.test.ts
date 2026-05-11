import { describe, expect, it } from "vitest";
import { getRecommendations, type RecommendStats } from "./recommend.js";
import type { GameCategory, GamePlugin } from "../platform/game-plugin/types.js";

/**
 * Build a minimal stub plugin sufficient for the recommender — it only
 * inspects `id` and `category`. The rest is filled with sensible no-ops
 * so `GamePlugin` typechecks.
 */
function fake(id: string, category: GameCategory): GamePlugin {
  return {
    id,
    title: id,
    category,
    players: { min: 1, max: 1, multiplayer: false },
    description: id,
    settings: {},
    initialState: () => ({}),
    reducer: (s: unknown) => s,
    isTerminal: () => null,
    component: () => null,
  } as unknown as GamePlugin;
}

/** Deterministic RNG so the random surprise / shuffle slots are stable. */
function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const CATALOG: GamePlugin[] = [
  fake("klondike", "solitaire"),
  fake("klondike-by-threes", "solitaire"),
  fake("klondike-easy", "solitaire"),
  fake("klondike-double", "solitaire"),
  fake("freecell", "solitaire"),
  fake("spider", "solitaire"),
  fake("holdem", "cards"),
  fake("holdem-no-limit", "cards"),
  fake("speed", "cards"),
  fake("yahtzee", "dice"),
  fake("pig", "dice"),
  fake("game-of-life", "board"),
  fake("chess", "board"),
  fake("aim-trainer", "arcade"),
  fake("3d-tunnel-runner", "arcade"),
];

const NOW = 1_700_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

describe("getRecommendations", () => {
  it("returns 6 games when the catalogue is large enough", () => {
    const stats: RecommendStats = {
      perGame: { klondike: { played: 20, wins: 5, best: 100 } },
      perCategory: { solitaire: 20 },
    };
    const recs = getRecommendations(stats, new Set(), {}, CATALOG, {
      rng: seededRng(42),
      now: NOW,
    });
    expect(recs.length).toBe(6);
  });

  it("excludes the user's top-5 most-played games", () => {
    const stats: RecommendStats = {
      perGame: {
        klondike: { played: 50, wins: 0, best: 0 },
        freecell: { played: 40, wins: 0, best: 0 },
        spider: { played: 30, wins: 0, best: 0 },
        holdem: { played: 20, wins: 0, best: 0 },
        yahtzee: { played: 10, wins: 0, best: 0 },
      },
      perCategory: { solitaire: 120, cards: 20, dice: 10 },
    };
    const recs = getRecommendations(stats, new Set(), {}, CATALOG, {
      rng: seededRng(7),
      now: NOW,
    });
    const ids = recs.map((g) => g.id);
    for (const top of ["klondike", "freecell", "spider", "holdem", "yahtzee"]) {
      expect(ids).not.toContain(top);
    }
  });

  it("includes a variant from the most-played family", () => {
    const stats: RecommendStats = {
      perGame: { klondike: { played: 30, wins: 5, best: 100 } },
      perCategory: { solitaire: 30 },
    };
    const recs = getRecommendations(stats, new Set(), {}, CATALOG, {
      rng: seededRng(1),
      now: NOW,
    });
    const ids = recs.map((g) => g.id);
    // At least one of the klondike-* variants ends up in the strip.
    expect(
      ids.some((id) => id.startsWith("klondike-")),
    ).toBe(true);
  });

  it("filters out highly-rated games played within the last 7 days", () => {
    const stats: RecommendStats = {
      perGame: { klondike: { played: 5, wins: 0, best: 0 } },
      perCategory: { solitaire: 5 },
    };
    const ratings = { holdem: 5, "aim-trainer": 5 };
    // holdem played yesterday — should NOT be the rediscovery slot.
    // aim-trainer last played 10 days ago — eligible.
    const lastPlayed = {
      holdem: NOW - 1 * DAY,
      "aim-trainer": NOW - 10 * DAY,
    };
    const recs = getRecommendations(stats, new Set(), ratings, CATALOG, {
      rng: seededRng(123),
      now: NOW,
      lastPlayed,
    });
    const ids = recs.map((g) => g.id);
    // aim-trainer must appear since holdem is excluded as "recent".
    expect(ids).toContain("aim-trainer");
  });

  it("returns [] when the catalogue is empty", () => {
    const recs = getRecommendations(
      { perGame: {}, perCategory: {} },
      new Set(),
      {},
      [],
    );
    expect(recs).toEqual([]);
  });

  it("never repeats a game in the output", () => {
    const stats: RecommendStats = {
      perGame: { klondike: { played: 10, wins: 0, best: 0 } },
      perCategory: { solitaire: 10 },
    };
    const recs = getRecommendations(stats, new Set(["spider"]), { spider: 5 }, CATALOG, {
      rng: seededRng(99),
      now: NOW,
    });
    const ids = recs.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

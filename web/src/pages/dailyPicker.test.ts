import { describe, expect, it } from "vitest";
import {
  estimatedMinutes,
  getTodaysDaily,
  getYesterdaysDaily,
  parScore,
  pickDailyGame,
  todayStamp,
  yesterdayStamp,
} from "./dailyPicker.js";
import type { GamePlugin, GameCategory } from "../platform/game-plugin/types.js";

/** Build a minimal stub GamePlugin — only the fields dailyPicker reads. */
function stub(id: string, category: GameCategory): GamePlugin {
  return {
    id,
    title: id,
    category,
    players: { min: 1, max: 1, multiplayer: false },
    description: "",
    settings: {},
    initialState: () => ({}),
    reducer: (s) => s,
    isTerminal: () => null,
    component: () => null,
  } as unknown as GamePlugin;
}

const fixedGames: readonly GamePlugin[] = [
  stub("a", "solitaire"),
  stub("b", "cards"),
  stub("c", "dice"),
  stub("d", "board"),
  stub("e", "arcade"),
];

describe("dailyPicker", () => {
  it("same date returns the same gameId", () => {
    const a = pickDailyGame("2026-05-02", fixedGames);
    const b = pickDailyGame("2026-05-02", fixedGames);
    expect(a.game.id).toBe(b.game.id);
    expect(a.seed).toBe(b.seed);
  });

  it("different dates can produce different gameIds (across a year of stamps)", () => {
    const ids = new Set<string>();
    for (let day = 1; day <= 365; day++) {
      const d = new Date(2026, 0, day);
      const stamp =
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      ids.add(pickDailyGame(stamp, fixedGames).game.id);
    }
    // With 5 games and a deterministic FNV hash, we expect to see >1 distinct
    // pick across a year — anything else means the picker is degenerate.
    expect(ids.size).toBeGreaterThan(1);
  });

  it("today/yesterday helpers stay in sync with their stamps", () => {
    const now = new Date(2026, 4, 2); // 2026-05-02 local
    expect(todayStamp(now)).toBe("2026-05-02");
    expect(yesterdayStamp(now)).toBe("2026-05-01");

    const today = getTodaysDaily(now);
    const yest = getYesterdaysDaily(now);
    expect(today.stamp).toBe("2026-05-02");
    expect(yest.stamp).toBe("2026-05-01");
    // Different stamps must not produce identical seeds (FNV avalanche on a
    // 1-char delta is overwhelmingly distinct).
    expect(today.seed).not.toBe(yest.seed);
  });

  it("parScore is deterministic for the same (game, seed)", () => {
    const game = stub("solitaire-x", "solitaire");
    const seed = 0xdeadbeef;
    const a = parScore(game, seed);
    const b = parScore(game, seed);
    expect(a).toBe(b);
    // Sanity: par stays a positive integer above the 50 floor.
    expect(Number.isInteger(a)).toBe(true);
    expect(a).toBeGreaterThanOrEqual(50);
  });

  it("estimatedMinutes returns a positive number for every category", () => {
    const cats: GameCategory[] = ["solitaire", "cards", "dice", "board", "arcade"];
    for (const c of cats) {
      const m = estimatedMinutes(stub("g", c));
      expect(typeof m).toBe("number");
      expect(Number.isFinite(m)).toBe(true);
      expect(m).toBeGreaterThan(0);
    }
  });
});

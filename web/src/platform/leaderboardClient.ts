/**
 * Leaderboard client abstraction.
 *
 * This module is a *future-facing* stub for a global leaderboard backend.
 * The intent is to give the rest of the codebase a stable, testable seam to
 * call (`postScore`, `getTop`, `getRank`) so that swapping in a real HTTP
 * client later is a one-liner. Today we ship two pure-TypeScript
 * implementations only:
 *
 *   - {@link LocalOnlyClient}: the production default. `postScore` is a
 *     no-op (we have nowhere to send the score yet); `getTop` reads the
 *     player's own personal-best from the existing local stats blob and
 *     returns a single row representing themselves.
 *
 *   - {@link MockClient}: a deterministic 5-fake-player implementation
 *     used for UI development / Storybook / Settings → Data toggle.
 *
 * Important: there is intentionally **no network code** in this file.
 * Adding HTTP belongs to a follow-up that owns the server contract.
 */

import { loadStats } from "./stats.js";
import { useAuth } from "./stores/auth.js";

/** A row returned by {@link LeaderboardClient.getTop}. */
export interface LeaderboardEntry {
  name: string;
  score: number;
  /** Best time in seconds, or 0 if not tracked. */
  time: number;
  /** ISO 8601 string. */
  date: string;
}

export interface LeaderboardClient {
  postScore(gameId: string, score: number, time: number, seed: number): Promise<void>;
  getTop(gameId: string, limit?: number): Promise<LeaderboardEntry[]>;
  getRank(gameId: string): Promise<number | null>;
}

const LS_BEST_TIMES = "cards-best-times";

function readBestTimes(): Record<string, number> {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(LS_BEST_TIMES);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

function readMyName(): string {
  try {
    return useAuth.getState().username ?? "You";
  } catch {
    return "You";
  }
}

/**
 * Local-only client.
 *
 * `postScore` is a no-op. `getTop` returns at most one row — the current
 * user's personal best for the requested game, drawn from the existing
 * local stats blob. `getRank` returns 1 if the user has any plays for the
 * game, otherwise null. This keeps the "Top players" UI honest about the
 * fact that we only know about the local player.
 */
export class LocalOnlyClient implements LeaderboardClient {
  async postScore(_gameId: string, _score: number, _time: number, _seed: number): Promise<void> {
    // No backend yet — drop the post on the floor. Wrapped in async so
    // callers can `await` without branching.
    return;
  }

  async getTop(gameId: string, limit = 10): Promise<LeaderboardEntry[]> {
    const stats = loadStats();
    const my = stats.perGame[gameId];
    if (!my || my.best <= 0) return [];
    const bestTimes = readBestTimes();
    const time = bestTimes[gameId] ?? 0;
    const name = readMyName();
    const row: LeaderboardEntry = {
      name,
      score: my.best,
      time,
      date: new Date().toISOString(),
    };
    return [row].slice(0, Math.max(1, limit));
  }

  async getRank(gameId: string): Promise<number | null> {
    const stats = loadStats();
    const my = stats.perGame[gameId];
    if (!my || my.played <= 0) return null;
    return 1;
  }
}

/* ------------------------------------------------------------------
 * MockClient: deterministic faux-leaderboard for UI testing.
 * ------------------------------------------------------------------ */

const MOCK_NAMES = ["Alice", "Bob", "Charlie", "Diana", "Eve"] as const;

/**
 * Tiny deterministic PRNG (mulberry32) used only by the mock client.
 * We avoid pulling in a real RNG dependency since the goal is just
 * "stable scores for a given seed".
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string id to a seed integer. Deterministic. */
function hashId(id: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Mock client used when the user enables the Settings → Data
 * "Use mock leaderboard" toggle. Returns 5 deterministic fake players
 * plus the current user (if they have a personal best). Scores depend
 * only on `gameId`, so the same game id produces the same fake board
 * across reloads — useful for screenshots and tests.
 */
export class MockClient implements LeaderboardClient {
  async postScore(_gameId: string, _score: number, _time: number, _seed: number): Promise<void> {
    return;
  }

  async getTop(gameId: string, limit = 10): Promise<LeaderboardEntry[]> {
    const baseSeed = hashId(gameId);
    const rng = mulberry32(baseSeed);
    // Anchor the dates to a fixed epoch (today, midnight UTC) so two
    // calls produce identical ISO strings. Using `Date.now()` directly
    // would introduce sub-millisecond drift between calls and break
    // deterministic equality.
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    const nowAnchor = todayUtc.getTime();
    const fake: LeaderboardEntry[] = MOCK_NAMES.map((name, i) => {
      // Scores cluster around 500–2500 with a slight downward slope by
      // index so the list looks roughly sorted before we sort it.
      const score = Math.floor(500 + rng() * 2000) + (5 - i) * 50;
      const time = Math.floor(30 + rng() * 270);
      // Dates spread over the last ~30 days so the UI has variety.
      const daysAgo = Math.floor(rng() * 30);
      const d = new Date(nowAnchor - daysAgo * 24 * 60 * 60 * 1000);
      return { name, score, time, date: d.toISOString() };
    });

    // Mix in the local user's personal best (if any) so the mock board
    // includes "you" alongside the fakes — this is the most useful UX
    // for designers tweaking the page.
    const local = await new LocalOnlyClient().getTop(gameId, 1);
    const combined = [...fake, ...local];
    combined.sort((a, b) => b.score - a.score);
    return combined.slice(0, Math.max(1, limit));
  }

  async getRank(gameId: string): Promise<number | null> {
    const top = await this.getTop(gameId, 100);
    const me = readMyName();
    const idx = top.findIndex((r) => r.name === me);
    return idx >= 0 ? idx + 1 : null;
  }
}

/* ------------------------------------------------------------------
 * Active-client selection.
 * ------------------------------------------------------------------ */

const LS_USE_MOCK = "cards-leaderboard-mock";

/** Read the Settings → Data toggle. Defaults to false. */
export function isMockLeaderboardEnabled(): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(LS_USE_MOCK) === "true";
  } catch {
    return false;
  }
}

export function setMockLeaderboardEnabled(on: boolean): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(LS_USE_MOCK, String(on));
  } catch {
    /* ignore */
  }
}

/**
 * Returns the active client based on the Settings toggle. Calling this
 * each render is fine — it's a cheap construction with no I/O. Tests can
 * pass an explicit client to components instead.
 */
export function getLeaderboardClient(): LeaderboardClient {
  return isMockLeaderboardEnabled() ? new MockClient() : new LocalOnlyClient();
}

export const LEADERBOARD_MOCK_KEY = LS_USE_MOCK;

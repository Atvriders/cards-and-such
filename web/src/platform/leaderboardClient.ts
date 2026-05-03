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
 * FriendsClient: deterministic faux "friends" list.
 *
 * Stores up to 10 fake friends in localStorage under
 * `cards-mock-friends`. Each friend has a stable `name` plus a
 * per-game `scores` map (`gameId` → integer score). The list is
 * generated lazily on first read from a fixed name pool + the same
 * mulberry32 PRNG used by {@link MockClient}, so the same device
 * sees the same friends across reloads but different devices may
 * differ if a developer pre-seeds storage.
 *
 * The client implements {@link LeaderboardClient.getTop} as
 * "friends-only" — it returns each friend's score for the requested
 * game, plus the local user's personal best, sorted by score
 * descending. `postScore` is a no-op (we never invent server traffic
 * for fake friends). `getRank` reports the user's position among
 * friends.
 * ------------------------------------------------------------------ */

const LS_FRIENDS = "cards-mock-friends";
const FRIEND_NAME_POOL = [
  "Casey", "Riley", "Morgan", "Jordan", "Avery",
  "Quinn", "Sasha", "Reese", "Drew", "Parker",
] as const;
const FRIEND_LIMIT = 10;

/** A single fake friend: name + per-game high scores. */
export interface MockFriend {
  name: string;
  /** gameId → score. Missing keys mean "no score yet". */
  scores: Record<string, number>;
}

/** Read the friends roster from localStorage. Tolerates corrupt JSON. */
export function loadMockFriends(): MockFriend[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(LS_FRIENDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: MockFriend[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const name = (item as { name?: unknown }).name;
      const scores = (item as { scores?: unknown }).scores;
      if (typeof name !== "string" || !name) continue;
      if (!scores || typeof scores !== "object") continue;
      const cleanScores: Record<string, number> = {};
      for (const [k, v] of Object.entries(scores as Record<string, unknown>)) {
        if (typeof v === "number" && Number.isFinite(v)) cleanScores[k] = Math.floor(v);
      }
      out.push({ name, scores: cleanScores });
      if (out.length >= FRIEND_LIMIT) break;
    }
    return out;
  } catch {
    return [];
  }
}

/** Persist the (clipped) friends roster to localStorage. */
export function saveMockFriends(friends: MockFriend[]): void {
  try {
    if (typeof localStorage === "undefined") return;
    const clipped = friends.slice(0, FRIEND_LIMIT);
    localStorage.setItem(LS_FRIENDS, JSON.stringify(clipped));
  } catch {
    /* ignore quota / private-mode */
  }
}

/**
 * Build a deterministic default roster of up to 10 friends with
 * per-game scores keyed by gameId. We seed each friend's scores
 * differently so the friends list looks varied; same seed → same
 * roster, suitable for snapshots.
 */
function buildDefaultFriends(): MockFriend[] {
  const games = ["klondike", "spider", "freecell", "yahtzee", "minesweeper", "snake", "tetris", "chess"];
  return FRIEND_NAME_POOL.map((name, i) => {
    const rng = mulberry32(hashId(`friend:${name}`) ^ (i * 0x9e3779b1));
    const scores: Record<string, number> = {};
    for (const g of games) {
      scores[g] = Math.floor(400 + rng() * 2400);
    }
    return { name, scores };
  });
}

/**
 * Friends-only client. Returns the local user (if they have a
 * personal best) plus every friend who has a score for the
 * requested game. Falls back to populating a default roster on
 * first read.
 */
export class FriendsClient implements LeaderboardClient {
  async postScore(_gameId: string, _score: number, _time: number, _seed: number): Promise<void> {
    return;
  }

  async getTop(gameId: string, limit = 10): Promise<LeaderboardEntry[]> {
    let friends = loadMockFriends();
    if (friends.length === 0) {
      friends = buildDefaultFriends();
      saveMockFriends(friends);
    }
    // Anchor dates so two calls return identical ISO strings — same
    // rationale as MockClient.getTop.
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    const nowAnchor = todayUtc.getTime();
    const baseRng = mulberry32(hashId(`friends:${gameId}`));
    const rows: LeaderboardEntry[] = [];
    for (const f of friends) {
      const score = f.scores[gameId];
      if (typeof score !== "number" || score <= 0) continue;
      const time = Math.floor(30 + baseRng() * 270);
      const daysAgo = Math.floor(baseRng() * 30);
      const date = new Date(nowAnchor - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      rows.push({ name: f.name, score, time, date });
    }
    const local = await new LocalOnlyClient().getTop(gameId, 1);
    const combined = [...rows, ...local];
    combined.sort((a, b) => b.score - a.score);
    return combined.slice(0, Math.max(1, limit));
  }

  async getRank(gameId: string): Promise<number | null> {
    const top = await this.getTop(gameId, FRIEND_LIMIT + 1);
    const me = readMyName();
    const idx = top.findIndex((r) => r.name === me);
    return idx >= 0 ? idx + 1 : null;
  }
}

const LS_USE_FRIENDS = "cards-leaderboard-friends";

/** Read the Settings → Data "Use mock friends" toggle. Defaults to false. */
export function isMockFriendsEnabled(): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(LS_USE_FRIENDS) === "true";
  } catch {
    return false;
  }
}

export function setMockFriendsEnabled(on: boolean): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(LS_USE_FRIENDS, String(on));
  } catch {
    /* ignore */
  }
}

export const FRIENDS_MOCK_KEY = LS_USE_FRIENDS;
export const FRIENDS_STORAGE_KEY = LS_FRIENDS;

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

/**
 * Returns the active *friends* client. If the friends toggle is on we
 * use the {@link FriendsClient} (deterministic faux roster); otherwise
 * we fall back to the same client the rest of the leaderboard uses so
 * the friends-only tab still has *something* to show.
 */
export function getFriendsClient(): LeaderboardClient {
  return isMockFriendsEnabled() ? new FriendsClient() : getLeaderboardClient();
}

export const LEADERBOARD_MOCK_KEY = LS_USE_MOCK;

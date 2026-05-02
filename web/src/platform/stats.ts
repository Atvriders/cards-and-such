import { GAMES } from "../games/registry.js";
import { useToast } from "./ui/Toast.js";
import { emitSparkles } from "./Sparkles.js";

const STORAGE_KEY = "cards-and-such:stats:v1";

export interface PerGameStats {
  played: number;
  wins: number;
  best: number;
}

export interface StatsState {
  totalPlayed: number;
  totalWins: number;
  longestStreak: number;
  currentStreak: number;
  perGame: Record<string, PerGameStats>;
  perCategory: Record<string, number>;
  daysPlayed: string[];
  unlocked: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: (s: StatsState) => boolean;
}

/* ------------------------------------------------------------------
 * localStorage probes used by achievement predicates.
 *
 * Achievements may need signals that don't live on `StatsState`:
 * favorites, ratings, daily streak, hint counters, and best times.
 * Each helper is defensive (try/catch + shape checks) so a corrupt
 * blob never crashes the predicate evaluator inside `recordGame`.
 * ------------------------------------------------------------------ */

function readJSON<T>(key: string): T | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function favoritesCount(): number {
  const v = readJSON<unknown>("cards-favorites");
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string").length;
  if (v && typeof v === "object") {
    let n = 0;
    for (const val of Object.values(v as Record<string, unknown>)) if (val) n += 1;
    return n;
  }
  return 0;
}

function ratingsMap(): Record<string, number> {
  const v = readJSON<Record<string, number>>("cards-ratings");
  if (!v || typeof v !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === "number" && Number.isFinite(val)) out[k] = val;
  }
  return out;
}

function dailyLongestStreak(): number {
  const v = readJSON<{ current?: number; longest?: number; count?: number }>("cards-daily-streak");
  if (!v || typeof v !== "object") return 0;
  const longest = typeof v.longest === "number" ? v.longest : 0;
  const current = typeof v.current === "number" ? v.current : (typeof v.count === "number" ? v.count : 0);
  return Math.max(longest, current);
}

function hintsUsedTotal(): number {
  const v = readJSON<Record<string, number>>("cards-hints-used");
  if (!v || typeof v !== "object") return 0;
  let total = 0;
  for (const val of Object.values(v)) {
    if (typeof val === "number" && Number.isFinite(val)) total += val;
  }
  return total;
}

function bestTimes(): number[] {
  const v = readJSON<Record<string, number>>("cards-best-times");
  if (!v || typeof v !== "object") return [];
  const out: number[] = [];
  for (const val of Object.values(v)) {
    if (typeof val === "number" && Number.isFinite(val) && val > 0) out.push(val);
  }
  return out;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-win",
    title: "First Win",
    description: "Win your first game.",
    isUnlocked: (s) => s.totalWins >= 1,
  },
  {
    id: "ten-wins",
    title: "10 Wins",
    description: "Rack up 10 wins.",
    isUnlocked: (s) => s.totalWins >= 10,
  },
  {
    id: "hundred-wins",
    title: "100 Wins",
    description: "Reach 100 wins.",
    isUnlocked: (s) => s.totalWins >= 100,
  },
  {
    id: "daily-player",
    title: "Daily Player (7 days)",
    description: "Play on 7 different days.",
    isUnlocked: (s) => s.daysPlayed.length >= 7,
  },
  {
    id: "sampler",
    title: "Sampler (10 categories)",
    description: "Play games from 10 different categories.",
    isUnlocked: (s) => Object.keys(s.perCategory).length >= 10,
  },
  {
    id: "champion",
    title: "Champion (top score in 5 games)",
    description: "Set a personal-best top score in 5 different games.",
    isUnlocked: (s) => Object.values(s.perGame).filter((g) => g.best > 0).length >= 5,
  },

  /* ---- breadth of play ---- */
  {
    id: "card-shark",
    title: "Card Shark",
    description: "Play 50 unique games.",
    isUnlocked: (s) => Object.keys(s.perGame).length >= 50,
  },
  {
    id: "card-sage",
    title: "Card Sage",
    description: "Play 200 unique games.",
    isUnlocked: (s) => Object.keys(s.perGame).length >= 200,
  },
  {
    id: "five-and-done",
    title: "Five & Done",
    description: "Win 5 different games at least once each.",
    isUnlocked: (s) => Object.values(s.perGame).filter((g) => g.wins >= 1).length >= 5,
  },

  /* ---- pace ---- */
  {
    id: "speed-run",
    title: "Speed Run",
    description: "Finish any game in under 30 seconds.",
    isUnlocked: () => bestTimes().some((t) => t > 0 && t < 30),
  },
  {
    id: "marathon",
    title: "Marathon",
    description: "Finish any game taking longer than 10 minutes.",
    isUnlocked: () => bestTimes().some((t) => t > 600),
  },

  /* ---- daily streaks ---- */
  {
    id: "streak-starter",
    title: "Streak Starter",
    description: "Hit a 3-day daily streak.",
    isUnlocked: () => dailyLongestStreak() >= 3,
  },
  {
    id: "streak-keeper",
    title: "Streak Keeper",
    description: "Hit a 7-day daily streak.",
    isUnlocked: () => dailyLongestStreak() >= 7,
  },
  {
    id: "streak-legend",
    title: "Streak Legend",
    description: "Hit a 30-day daily streak.",
    isUnlocked: () => dailyLongestStreak() >= 30,
  },

  /* ---- ratings + favorites ---- */
  {
    id: "tastemaker",
    title: "Tastemaker",
    description: "Rate 25 different games.",
    isUnlocked: () => Object.keys(ratingsMap()).length >= 25,
  },
  {
    id: "critic",
    title: "Critic",
    description: "Award a 5-star rating.",
    isUnlocked: () => Object.values(ratingsMap()).some((v) => v >= 5),
  },
  {
    id: "collector",
    title: "Collector",
    description: "Favorite 10 games.",
    isUnlocked: () => favoritesCount() >= 10,
  },

  /* ---- hints ---- */
  {
    id: "hint-free",
    title: "Hint-Free",
    description: "Win 10 games after having used at least one hint.",
    isUnlocked: (s) => hintsUsedTotal() >= 1 && s.totalWins >= 10,
  },
  {
    id: "hint-reliant",
    title: "Hint Reliant",
    description: "Use 50 hints in total.",
    isUnlocked: () => hintsUsedTotal() >= 50,
  },

  /* ---- per-category breadth ---- */
  {
    id: "solitaire-specialist",
    title: "Solitaire Specialist",
    description: "Play 25 solitaire games.",
    isUnlocked: (s) => (s.perCategory["solitaire"] ?? 0) >= 25,
  },
  {
    id: "dice-devotee",
    title: "Dice Devotee",
    description: "Play 25 dice games.",
    isUnlocked: (s) => (s.perCategory["dice"] ?? 0) >= 25,
  },
  {
    id: "card-connoisseur",
    title: "Card Connoisseur",
    description: "Play 25 card games.",
    isUnlocked: (s) => (s.perCategory["cards"] ?? 0) >= 25,
  },
  {
    id: "board-builder",
    title: "Board Builder",
    description: "Play 25 board games.",
    isUnlocked: (s) => (s.perCategory["board"] ?? 0) >= 25,
  },
  {
    id: "arcade-ace",
    title: "Arcade Ace",
    description: "Play 25 arcade games.",
    isUnlocked: (s) => (s.perCategory["arcade"] ?? 0) >= 25,
  },
];

function emptyState(): StatsState {
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

export function loadStats(): StatsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<StatsState>;
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

function saveStats(s: StatsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function categoryFor(gameId: string): string {
  const plugin = GAMES.find((g) => g.id === gameId);
  return plugin?.category ?? "unknown";
}

export function recordGame(gameId: string, score: number, won: boolean): StatsState {
  const s = loadStats();
  s.totalPlayed += 1;
  if (won) {
    s.totalWins += 1;
    s.currentStreak += 1;
    if (s.currentStreak > s.longestStreak) s.longestStreak = s.currentStreak;
  } else {
    s.currentStreak = 0;
  }

  const prev = s.perGame[gameId] ?? { played: 0, wins: 0, best: 0 };
  s.perGame[gameId] = {
    played: prev.played + 1,
    wins: prev.wins + (won ? 1 : 0),
    best: Math.max(prev.best, score),
  };

  const cat = categoryFor(gameId);
  s.perCategory[cat] = (s.perCategory[cat] ?? 0) + 1;

  const day = todayKey();
  if (!s.daysPlayed.includes(day)) s.daysPlayed.push(day);

  const newlyUnlocked: Achievement[] = [];
  for (const a of ACHIEVEMENTS) {
    if (a.isUnlocked(s) && !s.unlocked.includes(a.id)) {
      s.unlocked.push(a.id);
      newlyUnlocked.push(a);
    }
  }
  saveStats(s);

  for (const a of newlyUnlocked) {
    try {
      useToast.getState().push("success", `Achievement unlocked: ${a.title}`);
    } catch {
      /* toast unavailable */
    }
    // Sparkle burst near the toast so the unlock feels celebratory.
    // Toasts pin to the top-right; emit slightly below/left so the
    // particles overlap the toast card visually.
    try {
      if (typeof window !== "undefined") {
        const x = window.innerWidth - 120;
        const y = 80;
        emitSparkles(x, y);
      }
    } catch {
      /* sparkles unavailable */
    }
  }
  return s;
}

export function favoriteCategory(s: StatsState): string | null {
  const entries = Object.entries(s.perCategory);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function resetStats(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

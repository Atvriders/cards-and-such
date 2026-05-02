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

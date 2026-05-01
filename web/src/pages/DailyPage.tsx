import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GAMES } from "../games/registry.js";
import "./DailyPage.css";

interface PerGameStats { played: number; wins: number; best: number }
interface StatsState { perGame: Record<string, PerGameStats> }

/** Reads the global per-game stats blob written by the play loop. Tolerates
 *  missing/legacy data — returns an empty record on any error. */
function loadStats(): StatsState {
  try {
    const raw = localStorage.getItem("cards-and-such:stats:v1");
    if (!raw) return { perGame: {} };
    const parsed = JSON.parse(raw) as Partial<StatsState>;
    return { perGame: parsed.perGame ?? {} };
  } catch {
    return { perGame: {} };
  }
}

type Difficulty = "easy" | "medium" | "hard";
type Status = "not-started" | "in-progress" | "completed";

interface DailyEntry {
  id: string;
  title: string;
  difficulty: Difficulty;
  scoreToBeat: number;
  status: Status;
  rank: number; // 0..N-1, smaller = higher score-to-beat (gold)
}

interface StreakRecord {
  lastDate: string;
  count: number;
}

const STREAK_KEY = "cards-daily-streak";
const COMPLETIONS_KEY = "cards-daily-completions";

function todaySeed(): number {
  return (Date.now() / 86400000) | 0;
}

function dateStamp(seed: number): string {
  const d = new Date(seed * 86400000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** Mulberry32 — small, deterministic PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickDifficulty(rng: () => number): Difficulty {
  const r = rng();
  if (r < 0.34) return "easy";
  if (r < 0.72) return "medium";
  return "hard";
}

function loadStreak(): StreakRecord {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { lastDate: "", count: 0 };
    const parsed = JSON.parse(raw) as Partial<StreakRecord>;
    return { lastDate: parsed.lastDate ?? "", count: parsed.count ?? 0 };
  } catch {
    return { lastDate: "", count: 0 };
  }
}

function saveStreak(s: StreakRecord): void {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

function loadCompletions(stamp: string): Set<string> {
  try {
    const raw = localStorage.getItem(COMPLETIONS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { stamp?: string; ids?: string[] };
    if (parsed.stamp !== stamp) return new Set();
    return new Set(parsed.ids ?? []);
  } catch {
    return new Set();
  }
}

/** Public helper — call from PlayPage on win to record a daily completion
 *  and bump the streak (idempotent within a day). */
export function recordDailyCompletion(gameId: string, stamp: string): void {
  try {
    const raw = localStorage.getItem(COMPLETIONS_KEY);
    const data = raw ? (JSON.parse(raw) as { stamp?: string; ids?: string[] }) : {};
    const ids = data.stamp === stamp ? new Set(data.ids ?? []) : new Set<string>();
    const isFirstToday = ids.size === 0;
    ids.add(gameId);
    localStorage.setItem(COMPLETIONS_KEY, JSON.stringify({ stamp, ids: Array.from(ids) }));
    if (isFirstToday) {
      const streak = loadStreak();
      const yest = dateStamp(((Date.parse(stamp + "T00:00:00Z") / 86400000) | 0) - 1);
      const next: StreakRecord = {
        lastDate: stamp,
        count: streak.lastDate === yest ? streak.count + 1 : 1,
      };
      saveStreak(next);
    }
  } catch { /* ignore */ }
}

export default function DailyPage(): JSX.Element {
  const seed = useMemo(() => todaySeed(), []);
  const stamp = useMemo(() => dateStamp(seed), [seed]);

  const entries = useMemo<DailyEntry[]>(() => {
    if (GAMES.length === 0) return [];
    const rng = mulberry32(seed);
    // 3-5 games for the day (deterministic count).
    const count = 3 + Math.floor(rng() * 3); // 3,4, or 5
    const picked: DailyEntry[] = [];
    const seen = new Set<string>();
    let attempts = 0;
    while (picked.length < count && attempts < count * 20) {
      attempts++;
      const g = GAMES[Math.floor(rng() * GAMES.length) % GAMES.length]!;
      if (seen.has(g.id)) continue;
      seen.add(g.id);
      const difficulty = pickDifficulty(rng);
      const baseScore = difficulty === "easy" ? 250 : difficulty === "medium" ? 750 : 1800;
      const jitter = Math.floor(rng() * 400);
      picked.push({
        id: g.id,
        title: g.title,
        difficulty,
        scoreToBeat: baseScore + jitter,
        status: "not-started",
        rank: 0,
      });
    }
    // Rank by score-to-beat descending (gold = hardest score).
    const sorted = [...picked].sort((a, b) => b.scoreToBeat - a.scoreToBeat);
    sorted.forEach((e, i) => { e.rank = i; });
    return picked;
  }, [seed]);

  const [streak, setStreak] = useState<StreakRecord>(() => loadStreak());
  const [completions, setCompletions] = useState<Set<string>>(() => loadCompletions(stamp));

  // Re-read storage when the page becomes visible (user returns from playing).
  useEffect(() => {
    const refresh = (): void => {
      setStreak(loadStreak());
      setCompletions(loadCompletions(stamp));
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [stamp]);

  // Determine in-progress: a played game (per global stats) that isn't yet
  // marked complete for today.
  const stats = useMemo(() => loadStats(), []);
  const decorated = useMemo<DailyEntry[]>(() => entries.map((e) => {
    let status: Status = "not-started";
    if (completions.has(e.id)) status = "completed";
    else if (stats.perGame[e.id]?.played) status = "in-progress";
    return { ...e, status };
  }), [entries, completions, stats]);

  // Streak is "alive" only if last completion was today or yesterday.
  const yesterdayStamp = dateStamp(seed - 1);
  const streakAlive = streak.lastDate === stamp || streak.lastDate === yesterdayStamp;
  const streakDisplay = streakAlive ? streak.count : 0;

  return (
    <div className="daily-page" data-testid="daily-page">
      <header className="daily-banner" aria-label="Today's challenge">
        <h1>Today's Challenge</h1>
        <p className="daily-banner-sub">A fresh hand of {decorated.length} games, rotated daily. Beat the score to claim the medal.</p>
        <span className="daily-banner-date" data-testid="daily-date">{stamp}</span>
        <div className="daily-streak" data-testid="daily-streak" aria-label={`Daily streak ${streakDisplay} days`}>
          <span className="daily-streak-flame" aria-hidden="true">🔥</span>
          <div>
            <div className="daily-streak-count">{streakDisplay}</div>
            <div className="daily-streak-label">day streak</div>
          </div>
        </div>
      </header>

      <section aria-label="Daily games">
        <div className="daily-grid">
          {decorated.map((e) => {
            const medalClass = e.rank === 0 ? "gold" : e.rank === 1 ? "silver" : e.rank === 2 ? "bronze" : null;
            return (
              <Link
                key={e.id}
                to={`/play/${e.id}?daily=${stamp}`}
                className="daily-card"
                data-testid={`daily-card-${e.id}`}
              >
                {medalClass && (
                  <span
                    className={`daily-card-medal daily-card-medal--${medalClass}`}
                    aria-label={`${medalClass} tier`}
                  >
                    {e.rank + 1}
                  </span>
                )}
                <span className={`daily-card-difficulty daily-card-difficulty--${e.difficulty}`}>
                  {e.difficulty}
                </span>
                <h3 className="daily-card-title">{e.title}</h3>
                <dl>
                  <div className="daily-card-row">
                    <dt>Score to beat</dt>
                    <dd>{e.scoreToBeat.toLocaleString()}</dd>
                  </div>
                </dl>
                <span className={`daily-card-status daily-card-status--${e.status}`}>
                  {e.status === "not-started" ? "Not started" : e.status === "in-progress" ? "In progress" : "Completed"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

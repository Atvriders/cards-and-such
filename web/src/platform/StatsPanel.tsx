import { useCallback, useEffect, useState } from "react";
import { loadStats, type PerGameStats } from "./stats.js";
import { readRating } from "./StarRating.js";

interface StatsPanelProps {
  gameId: string;
  bestTime: number | null;
}

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

const COLLAPSE_KEY = "cards-stats-panel-collapsed";

function readCollapsed(): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCollapsed(v: boolean): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(COLLAPSE_KEY, v ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function readPerGame(gameId: string): PerGameStats {
  const s = loadStats();
  return s.perGame[gameId] ?? { played: 0, wins: 0, best: 0 };
}

/**
 * Resets stats for a single game without nuking the global stats blob —
 * keeps achievements + global counters intact, but clears the per-game row,
 * the best time, and the user rating.
 */
function resetGameStats(gameId: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    // per-game stats row inside cards-and-such:stats:v1
    const raw = localStorage.getItem("cards-and-such:stats:v1");
    if (raw) {
      const parsed = JSON.parse(raw) as { perGame?: Record<string, PerGameStats> };
      if (parsed && parsed.perGame && parsed.perGame[gameId]) {
        delete parsed.perGame[gameId];
        localStorage.setItem("cards-and-such:stats:v1", JSON.stringify(parsed));
      }
    }
    // best time
    const bt = localStorage.getItem("cards-best-times");
    if (bt) {
      const parsed = JSON.parse(bt) as Record<string, number>;
      if (parsed && parsed[gameId] != null) {
        delete parsed[gameId];
        localStorage.setItem("cards-best-times", JSON.stringify(parsed));
      }
    }
    // rating
    const rt = localStorage.getItem("cards-ratings");
    if (rt) {
      const parsed = JSON.parse(rt) as Record<string, number>;
      if (parsed && parsed[gameId] != null) {
        delete parsed[gameId];
        localStorage.setItem("cards-ratings", JSON.stringify(parsed));
      }
    }
  } catch {
    /* ignore */
  }
}

export function StatsPanel({ gameId, bestTime }: StatsPanelProps): JSX.Element {
  const [stats, setStats] = useState<PerGameStats>(() => readPerGame(gameId));
  const [rating, setRating] = useState<number>(() => readRating(gameId));
  const [collapsed, setCollapsed] = useState<boolean>(() => readCollapsed());
  const [confirming, setConfirming] = useState<boolean>(false);

  // Refresh when gameId changes (or when the panel re-mounts after a reset).
  useEffect(() => {
    setStats(readPerGame(gameId));
    setRating(readRating(gameId));
  }, [gameId]);

  const refresh = useCallback(() => {
    setStats(readPerGame(gameId));
    setRating(readRating(gameId));
  }, [gameId]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      writeCollapsed(next);
      return next;
    });
  }, []);

  const onReset = useCallback(() => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    resetGameStats(gameId);
    setConfirming(false);
    refresh();
  }, [confirming, gameId, refresh]);

  const winRate =
    stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <aside
      className={`stats-panel${collapsed ? " is-collapsed" : ""}`}
      data-testid="stats-panel"
      aria-label="Your stats for this game"
    >
      <button
        type="button"
        className="stats-panel-toggle"
        onClick={toggleCollapsed}
        aria-expanded={!collapsed}
        aria-controls="stats-panel-body"
        data-testid="stats-panel-toggle"
      >
        <span className="stats-panel-title">Your stats</span>
        <span className="stats-panel-caret" aria-hidden="true">
          {collapsed ? "+" : "-"}
        </span>
      </button>
      {!collapsed && (
        <div className="stats-panel-body" id="stats-panel-body">
          <dl className="stats-panel-grid">
            <div className="stats-panel-row">
              <dt>Times played</dt>
              <dd data-testid="stats-played">{stats.played}</dd>
            </div>
            <div className="stats-panel-row">
              <dt>Best score</dt>
              <dd data-testid="stats-best">{stats.best}</dd>
            </div>
            {bestTime != null && (
              <div className="stats-panel-row">
                <dt>Best time</dt>
                <dd data-testid="stats-best-time">{formatTime(bestTime)}</dd>
              </div>
            )}
            <div className="stats-panel-row">
              <dt>Win rate</dt>
              <dd data-testid="stats-win-rate">
                {stats.played > 0 ? `${winRate}%` : "–"}
              </dd>
            </div>
            {rating > 0 && (
              <div className="stats-panel-row">
                <dt>Your rating</dt>
                <dd data-testid="stats-rating">
                  {"★".repeat(rating)}
                  {"☆".repeat(5 - rating)}
                </dd>
              </div>
            )}
          </dl>
          <div className="stats-panel-actions">
            <button
              type="button"
              className="stats-panel-reset"
              onClick={onReset}
              data-testid="stats-panel-reset"
            >
              {confirming ? "Click again to confirm" : "Reset stats"}
            </button>
            {confirming && (
              <button
                type="button"
                className="stats-panel-cancel"
                onClick={() => setConfirming(false)}
                data-testid="stats-panel-cancel"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

export default StatsPanel;

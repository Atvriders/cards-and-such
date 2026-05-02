import { useMemo } from "react";
import { ACHIEVEMENTS, favoriteCategory, loadStats } from "../platform/stats.js";
import type { Achievement, StatsState } from "../platform/stats.js";
import { GAMES } from "../games/registry.js";
import "./StatsPage.css";

const PIE_COLORS = ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#f472b6"];

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function last14Days(playedSet: Set<string>): { label: string; v: number }[] {
  const out: { label: string; v: number }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({ label: dayKey(d).slice(5), v: playedSet.has(dayKey(d)) ? 1 : 0 });
  }
  return out;
}

/* Read raw JSON from localStorage, returning null on any failure. Used by the
 * progress probes below so the StatsPage can render numeric progress for the
 * achievements whose predicates live outside `StatsState`. */
function progressJSON<T>(key: string): T | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function favsCount(): number {
  const v = progressJSON<unknown>("cards-favorites");
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string").length;
  if (v && typeof v === "object") {
    let n = 0;
    for (const val of Object.values(v as Record<string, unknown>)) if (val) n += 1;
    return n;
  }
  return 0;
}

function ratingsCount(): number {
  const v = progressJSON<Record<string, number>>("cards-ratings");
  if (!v || typeof v !== "object") return 0;
  return Object.keys(v).length;
}

function streakLongest(): number {
  const v = progressJSON<{ current?: number; longest?: number; count?: number }>("cards-daily-streak");
  if (!v || typeof v !== "object") return 0;
  const longest = typeof v.longest === "number" ? v.longest : 0;
  const current = typeof v.current === "number" ? v.current : (typeof v.count === "number" ? v.count : 0);
  return Math.max(longest, current);
}

function hintsTotal(): number {
  const v = progressJSON<Record<string, number>>("cards-hints-used");
  if (!v || typeof v !== "object") return 0;
  let total = 0;
  for (const val of Object.values(v)) if (typeof val === "number" && Number.isFinite(val)) total += val;
  return total;
}

function progressFor(a: Achievement, s: StatsState): { cur: number; goal: number } {
  switch (a.id) {
    case "first-win": return { cur: Math.min(s.totalWins, 1), goal: 1 };
    case "ten-wins": return { cur: Math.min(s.totalWins, 10), goal: 10 };
    case "hundred-wins": return { cur: Math.min(s.totalWins, 100), goal: 100 };
    case "daily-player": return { cur: Math.min(s.daysPlayed.length, 7), goal: 7 };
    case "sampler": return { cur: Math.min(Object.keys(s.perCategory).length, 10), goal: 10 };
    case "champion": {
      const c = Object.values(s.perGame).filter((g) => g.best > 0).length;
      return { cur: Math.min(c, 5), goal: 5 };
    }
    case "card-shark": return { cur: Math.min(Object.keys(s.perGame).length, 50), goal: 50 };
    case "card-sage": return { cur: Math.min(Object.keys(s.perGame).length, 200), goal: 200 };
    case "five-and-done": {
      const c = Object.values(s.perGame).filter((g) => g.wins >= 1).length;
      return { cur: Math.min(c, 5), goal: 5 };
    }
    case "streak-starter": return { cur: Math.min(streakLongest(), 3), goal: 3 };
    case "streak-keeper": return { cur: Math.min(streakLongest(), 7), goal: 7 };
    case "streak-legend": return { cur: Math.min(streakLongest(), 30), goal: 30 };
    case "tastemaker": return { cur: Math.min(ratingsCount(), 25), goal: 25 };
    case "collector": return { cur: Math.min(favsCount(), 10), goal: 10 };
    case "hint-reliant": return { cur: Math.min(hintsTotal(), 50), goal: 50 };
    case "solitaire-specialist": return { cur: Math.min(s.perCategory["solitaire"] ?? 0, 25), goal: 25 };
    case "dice-devotee": return { cur: Math.min(s.perCategory["dice"] ?? 0, 25), goal: 25 };
    case "card-connoisseur": return { cur: Math.min(s.perCategory["cards"] ?? 0, 25), goal: 25 };
    case "board-builder": return { cur: Math.min(s.perCategory["board"] ?? 0, 25), goal: 25 };
    case "arcade-ace": return { cur: Math.min(s.perCategory["arcade"] ?? 0, 25), goal: 25 };
    default: return { cur: a.isUnlocked(s) ? 1 : 0, goal: 1 };
  }
}

interface BarDatum { label: string; v: number }
function BarChart({ data, w = 320, h = 140 }: { data: BarDatum[]; w?: number; h?: number }): JSX.Element {
  const max = Math.max(1, ...data.map((d) => d.v));
  const pad = 24;
  const bw = data.length ? (w - pad * 2) / data.length : 0;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="stats-svg" role="img" aria-label="Games played per category" data-testid="stats-bar-chart">
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="rgba(148,163,184,0.25)" />
      {data.map((d, i) => {
        const bh = ((h - pad * 2) * d.v) / max;
        const x = pad + i * bw + bw * 0.15;
        const y = h - pad - bh;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={bw * 0.7} height={bh} fill="#a78bfa" rx="3" />
            <text x={x + bw * 0.35} y={h - pad + 12} fontSize="9" fill="rgba(203,213,225,0.7)" textAnchor="middle">{d.label.slice(0, 6)}</text>
            <text x={x + bw * 0.35} y={y - 3} fontSize="9" fill="#e2e8f0" textAnchor="middle">{d.v}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, w = 320, h = 140 }: { data: BarDatum[]; w?: number; h?: number }): JSX.Element {
  const max = Math.max(1, ...data.map((d) => d.v));
  const pad = 22;
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const pts = data.map((d, i) => [pad + i * step, h - pad - ((h - pad * 2) * d.v) / max] as const);
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="stats-svg" role="img" aria-label="Activity over last 14 days" data-testid="stats-line-chart">
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="rgba(148,163,184,0.25)" />
      <path d={path} fill="none" stroke="#60a5fa" strokeWidth="2" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#60a5fa" />
      ))}
      <text x={pad} y={h - 4} fontSize="9" fill="rgba(203,213,225,0.6)">14d ago</text>
      <text x={w - pad} y={h - 4} fontSize="9" fill="rgba(203,213,225,0.6)" textAnchor="end">today</text>
    </svg>
  );
}

interface PieDatum { label: string; v: number }
function PieChart({ data, size = 160 }: { data: PieDatum[]; size?: number }): JSX.Element {
  const total = data.reduce((a, b) => a + b.v, 0);
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;
  let acc = 0;
  return (
    <div className="stats-pie-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} className="stats-svg stats-pie" role="img" aria-label="Time per game (top 5)" data-testid="stats-pie-chart">
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="rgba(148,163,184,0.15)" />
        ) : data.map((d, i) => {
          const frac = d.v / total;
          const a0 = acc * 2 * Math.PI - Math.PI / 2;
          acc += frac;
          const a1 = acc * 2 * Math.PI - Math.PI / 2;
          const large = frac > 0.5 ? 1 : 0;
          const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
          const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
          const path = `M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
          return <path key={d.label} d={path} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#0a0c16" strokeWidth="1" />;
        })}
      </svg>
      <ul className="stats-pie-legend">
        {data.map((d, i) => (
          <li key={d.label}><span className="swatch" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{d.label} <em>{d.v}</em></li>
        ))}
      </ul>
    </div>
  );
}

export default function StatsPage(): JSX.Element {
  const stats = useMemo(() => loadStats(), []);
  const fav = favoriteCategory(stats);

  const bestPerCategory = useMemo(() => {
    const out: Record<string, { gameId: string; title: string; score: number }> = {};
    for (const [gameId, gs] of Object.entries(stats.perGame)) {
      const plugin = GAMES.find((g) => g.id === gameId);
      if (!plugin) continue;
      const cat = plugin.category;
      const cur = out[cat];
      if (!cur || gs.best > cur.score) out[cat] = { gameId, title: plugin.title, score: gs.best };
    }
    return out;
  }, [stats]);

  const categoryBarData = useMemo<BarDatum[]>(
    () => Object.entries(stats.perCategory).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, v]) => ({ label, v })),
    [stats],
  );
  const lineData = useMemo<BarDatum[]>(() => last14Days(new Set(stats.daysPlayed)), [stats]);
  const topGamesPie = useMemo<PieDatum[]>(() => {
    return Object.entries(stats.perGame)
      .map(([id, gs]) => {
        const plug = GAMES.find((g) => g.id === id);
        return { label: plug?.title ?? id, v: gs.played };
      })
      .filter((d) => d.v > 0)
      .sort((a, b) => b.v - a.v)
      .slice(0, 5);
  }, [stats]);

  return (
    <div className="stats-page" data-testid="stats-page">
      <h1>Your Stats</h1>

      <section className="stats-card-grid">
        <div className="stats-card" data-testid="stats-activity">
          <h2>Activity</h2>
          <div className="stats-summary">
            <div className="stat-card" data-testid="stat-total-played"><div className="stat-label">Games Played</div><div className="stat-value">{stats.totalPlayed}</div></div>
            <div className="stat-card" data-testid="stat-total-wins"><div className="stat-label">Total Wins</div><div className="stat-value">{stats.totalWins}</div></div>
          </div>
          <div className="stats-chart-label">Last 14 days</div>
          <LineChart data={lineData} />
        </div>

        <div className="stats-card" data-testid="stats-records">
          <h2>Records</h2>
          <div className="stats-summary">
            <div className="stat-card" data-testid="stat-longest-streak"><div className="stat-label">Longest Streak</div><div className="stat-value">{stats.longestStreak}</div></div>
            <div className="stat-card" data-testid="stat-favorite-category"><div className="stat-label">Favorite</div><div className="stat-value">{fav ?? "—"}</div></div>
          </div>
          <div className="stats-chart-label">Time spent (top 5 games)</div>
          {topGamesPie.length === 0 ? <p className="stats-empty">No games played yet.</p> : <PieChart data={topGamesPie} />}
        </div>

        <div className="stats-card" data-testid="stats-categories">
          <h2>Categories</h2>
          <div className="stats-chart-label">Games played per category</div>
          {categoryBarData.length === 0 ? <p className="stats-empty">No games played yet.</p> : <BarChart data={categoryBarData} />}
          {Object.keys(bestPerCategory).length > 0 && (
            <ul className="stats-best-list">
              {Object.entries(bestPerCategory).map(([cat, info]) => (
                <li key={cat}>
                  <span className={`play-category play-category--${cat}`}>{cat}</span>
                  <span className="best-title">{info.title}</span>
                  <span className="best-score">{info.score}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="stats-card" data-testid="stats-achievements">
          <h2>Achievements</h2>
          <div className="achievements-grid">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = stats.unlocked.includes(a.id);
              const { cur, goal } = progressFor(a, stats);
              const pct = Math.round((cur / goal) * 100);
              return (
                <div key={a.id} className={`achievement-card ${unlocked ? "unlocked" : "locked"}`} data-testid={`achievement-${a.id}`} data-state={unlocked ? "unlocked" : "locked"}>
                  <div className="achievement-title">{a.title}</div>
                  <div className="achievement-desc">{a.description}</div>
                  <div className="achievement-progress" data-testid={`achievement-progress-${a.id}`}>
                    <div className="achievement-progress-bar" role="progressbar" aria-valuenow={cur} aria-valuemin={0} aria-valuemax={goal} data-pct={pct}><div className="achievement-progress-fill" style={{ width: `${pct}%` }} /></div>
                    <div className="achievement-progress-label">{cur}/{goal}</div>
                  </div>
                  <div className="achievement-status">{unlocked ? "Unlocked" : "Locked"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

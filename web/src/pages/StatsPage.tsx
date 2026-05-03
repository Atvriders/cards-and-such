import { useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { Link } from "react-router-dom";
import { ACHIEVEMENTS, favoriteCategory, loadStats, resetStats } from "../platform/stats.js";
import type { Achievement, StatsState } from "../platform/stats.js";
import { GAMES } from "../games/registry.js";
import { downloadSvg } from "../platform/svgShare.js";
import { useConfirm } from "../platform/ConfirmDialog.js";
import { TIME_HISTORY_KEY_PREFIX, readTimeHistory } from "../platform/userdata.js";
import { loadReplays } from "../platform/replays.js";
import "./StatsPage.css";

/**
 * Tiny inline sparkline for per-game stats rows. Renders a polyline (or a
 * single horizontal bar when only one data point is available) using the
 * current `--accent` CSS variable via `currentColor`. No labels, no axes —
 * meant to fit alongside a numeric value in a row, not stand on its own.
 *
 * `data` is treated as ordered samples (oldest -> newest); empty arrays
 * collapse to a flat baseline so the layout doesn't shift.
 */
function Sparkline({
  data,
  width = 60,
  height = 16,
  testId,
}: {
  data: number[];
  width?: number;
  height?: number;
  testId?: string;
}): JSX.Element {
  const pad = 1;
  const w = width;
  const h = height;
  const safe = data.filter((n) => typeof n === "number" && Number.isFinite(n));
  if (safe.length === 0) {
    return (
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        className="stats-sparkline"
        aria-hidden="true"
        focusable="false"
        data-testid={testId}
      >
        <line
          x1={pad}
          y1={h - pad}
          x2={w - pad}
          y2={h - pad}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
      </svg>
    );
  }
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const range = max - min || 1;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  if (safe.length === 1) {
    // Single sample: draw a centered horizontal bar so the cell has visual weight.
    const y = pad + innerH / 2;
    return (
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        className="stats-sparkline"
        aria-hidden="true"
        focusable="false"
        data-testid={testId}
      >
        <line
          x1={pad}
          y1={y}
          x2={w - pad}
          y2={y}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  const step = innerW / (safe.length - 1);
  const points = safe
    .map((v, i) => {
      const x = pad + i * step;
      const y = pad + innerH - ((v - min) / range) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="stats-sparkline"
      aria-hidden="true"
      focusable="false"
      data-testid={testId}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PIE_COLORS = ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#f472b6"];

const CATEGORY_FILTERS = [
  { id: "all", label: "All" },
  { id: "solitaire", label: "Solitaire" },
  { id: "cards", label: "Cards" },
  { id: "dice", label: "Dice" },
  { id: "board", label: "Board" },
  { id: "arcade", label: "Arcade" },
] as const;

type CategoryFilter = typeof CATEGORY_FILTERS[number]["id"];

const RANGE_OPTIONS = [7, 14, 30, 90] as const;
type RangeOption = typeof RANGE_OPTIONS[number];

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function lastNDays(playedSet: Set<string>, n: number): { label: string; v: number }[] {
  const out: { label: string; v: number }[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
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

function ratingFor(id: string): number | null {
  const v = progressJSON<Record<string, number>>("cards-ratings");
  if (!v || typeof v !== "object") return null;
  const r = v[id];
  return typeof r === "number" && Number.isFinite(r) ? r : null;
}

function bestTimeFor(id: string): number | null {
  const v = progressJSON<Record<string, number>>("cards-best-times");
  if (!v || typeof v !== "object") return null;
  const t = v[id];
  return typeof t === "number" && Number.isFinite(t) && t > 0 ? t : null;
}

function lastPlayedFor(id: string): number | null {
  const v = progressJSON<Record<string, number>>("cards-last-played");
  if (!v || typeof v !== "object") return null;
  const t = v[id];
  return typeof t === "number" && Number.isFinite(t) ? t : null;
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

/** Per-game hint usage. Reads `cards-hints-used` (a `Record<gameId, number>`)
 *  and returns the count for `id`, or 0 when missing/corrupt. Powers the
 *  StatsPage drill-down "Hints used" row alongside its undo counterpart. */
function hintsUsedFor(id: string): number {
  const v = progressJSON<Record<string, number>>("cards-hints-used");
  if (!v || typeof v !== "object") return 0;
  const n = v[id];
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : 0;
}

function undosTotal(): number {
  const v = progressJSON<Record<string, number>>("cards-undos-used");
  if (!v || typeof v !== "object") return 0;
  let total = 0;
  for (const val of Object.values(v)) if (typeof val === "number" && Number.isFinite(val)) total += val;
  return total;
}

/** Per-game undo usage. Mirror of {@link hintsUsedFor} for the
 *  `cards-undos-used` blob written by PlayPage's `undo()` callback. */
function undosUsedFor(id: string): number {
  const v = progressJSON<Record<string, number>>("cards-undos-used");
  if (!v || typeof v !== "object") return 0;
  const n = v[id];
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : 0;
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

interface BarDatum { label: string; v: number; id?: string }
function BarChart({
  data,
  w = 320,
  h = 140,
  onSelect,
  selectedId,
  svgRef,
}: {
  data: BarDatum[];
  w?: number;
  h?: number;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  svgRef?: RefObject<SVGSVGElement>;
}): JSX.Element {
  const max = Math.max(1, ...data.map((d) => d.v));
  const pad = 24;
  const bw = data.length ? (w - pad * 2) / data.length : 0;
  return (
    <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} className="stats-svg" role="img" aria-label="Games played per category" data-testid="stats-bar-chart">
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="rgba(148,163,184,0.25)" />
      {data.map((d, i) => {
        const bh = ((h - pad * 2) * d.v) / max;
        const x = pad + i * bw + bw * 0.15;
        const y = h - pad - bh;
        const active = selectedId && d.id === selectedId;
        const clickable = !!onSelect && !!d.id;
        return (
          <g
            key={d.label}
            style={clickable ? { cursor: "pointer" } : undefined}
            onClick={clickable ? () => onSelect?.(d.id as string) : undefined}
            data-testid={d.id ? `stats-drill-${d.id}` : undefined}
          >
            <rect
              x={x}
              y={y}
              width={bw * 0.7}
              height={bh}
              fill={active ? "#c7cdfe" : "#a78bfa"}
              rx="3"
            />
            <text x={x + bw * 0.35} y={h - pad + 12} fontSize="9" fill="rgba(203,213,225,0.7)" textAnchor="middle">{d.label.slice(0, 6)}</text>
            <text x={x + bw * 0.35} y={y - 3} fontSize="9" fill="#e2e8f0" textAnchor="middle">{d.v}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, w = 320, h = 140, rangeLabel, svgRef }: { data: BarDatum[]; w?: number; h?: number; rangeLabel: string; svgRef?: RefObject<SVGSVGElement> }): JSX.Element {
  const max = Math.max(1, ...data.map((d) => d.v));
  const pad = 22;
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const pts = data.map((d, i) => [pad + i * step, h - pad - ((h - pad * 2) * d.v) / max] as const);
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} className="stats-svg" role="img" aria-label={`Activity over last ${rangeLabel}`} data-testid="stats-line-chart">
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="rgba(148,163,184,0.25)" />
      <path d={path} fill="none" stroke="#60a5fa" strokeWidth="2" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#60a5fa" />
      ))}
      <text x={pad} y={h - 4} fontSize="9" fill="rgba(203,213,225,0.6)">{rangeLabel} ago</text>
      <text x={w - pad} y={h - 4} fontSize="9" fill="rgba(203,213,225,0.6)" textAnchor="end">today</text>
    </svg>
  );
}

/** Categories used by the day-of-week heatmap (mirrors `CATEGORY_FILTERS`
 *  minus the "all" pseudo-entry). Order is fixed so the row layout is stable
 *  across renders; new categories must be added explicitly. */
const HEATMAP_CATEGORIES = ["solitaire", "cards", "dice", "board", "arcade"] as const;
type HeatmapCategory = typeof HEATMAP_CATEGORIES[number];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/**
 * Walk `cards-time-history:<gameId>` localStorage entries and bucket each
 * play within the last `windowDays` days into a category × day-of-week grid.
 * Returns a `[catIdx][dayIdx]` count matrix where `dayIdx` is Mon=0..Sun=6.
 *
 * Pure, deterministic given a fixed `now`; tolerates corrupt JSON the same
 * way `readTimeHistory` does (it falls back through `progressJSON`).
 */
function buildCategoryDowHeatmap(
  windowDays: number,
  now: number = Date.now(),
): { counts: number[][]; max: number; total: number } {
  const counts: number[][] = HEATMAP_CATEGORIES.map(() => [0, 0, 0, 0, 0, 0, 0]);
  let max = 0;
  let total = 0;
  if (typeof localStorage === "undefined") return { counts, max, total };
  const cutoff = now - windowDays * 24 * 60 * 60 * 1000;
  // Pre-index game ids -> category to avoid O(games) lookups per entry.
  const catById: Record<string, HeatmapCategory> = {};
  for (const g of GAMES) {
    if ((HEATMAP_CATEGORIES as readonly string[]).includes(g.category)) {
      catById[g.id] = g.category as HeatmapCategory;
    }
  }
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(TIME_HISTORY_KEY_PREFIX)) continue;
    const gameId = k.slice(TIME_HISTORY_KEY_PREFIX.length);
    const cat = catById[gameId];
    if (!cat) continue;
    const catIdx = HEATMAP_CATEGORIES.indexOf(cat);
    const entries = progressJSON<unknown>(k);
    if (!Array.isArray(entries)) continue;
    for (const e of entries) {
      if (!e || typeof e !== "object") continue;
      const ts = (e as { ts?: unknown }).ts;
      if (typeof ts !== "number" || !Number.isFinite(ts)) continue;
      if (ts < cutoff || ts > now) continue;
      // JS getDay() returns Sun=0..Sat=6; remap to Mon=0..Sun=6.
      const jsDow = new Date(ts).getDay();
      const dowIdx = (jsDow + 6) % 7;
      counts[catIdx][dowIdx] += 1;
      total += 1;
      if (counts[catIdx][dowIdx] > max) max = counts[catIdx][dowIdx];
    }
  }
  return { counts, max, total };
}

/**
 * Walk every `cards-time-history:<gameId>` localStorage entry and bucket each
 * play timestamp into one of 24 local-time hour bins (0..23). Returns the
 * counts array, the peak hour (or null when no data), and the total samples.
 *
 * Pure given a fixed `now` (only used to skip future-dated entries that may
 * appear when the user's clock has drifted backwards). Tolerates corrupt
 * localStorage blobs the same way the rest of this file does.
 */
function buildHourOfDayCounts(
  now: number = Date.now(),
): { counts: number[]; peakHour: number | null; total: number } {
  const counts = new Array<number>(24).fill(0);
  let total = 0;
  if (typeof localStorage === "undefined") {
    return { counts, peakHour: null, total };
  }
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(TIME_HISTORY_KEY_PREFIX)) continue;
    const entries = progressJSON<unknown>(k);
    if (!Array.isArray(entries)) continue;
    for (const e of entries) {
      if (!e || typeof e !== "object") continue;
      const ts = (e as { ts?: unknown }).ts;
      if (typeof ts !== "number" || !Number.isFinite(ts)) continue;
      // Skip future-dated entries (clock skew) but accept everything historical.
      if (ts > now) continue;
      const hr = new Date(ts).getHours();
      if (hr < 0 || hr > 23) continue;
      counts[hr] += 1;
      total += 1;
    }
  }
  let peakHour: number | null = null;
  let peakV = 0;
  for (let h = 0; h < 24; h++) {
    if (counts[h] > peakV) {
      peakV = counts[h];
      peakHour = h;
    }
  }
  return { counts, peakHour, total };
}

/**
 * 24-bar chart of plays per hour of day. The peak bar is recolored to the
 * active accent so it's the obvious focal point; ties go to the earliest
 * hour (matches `buildHourOfDayCounts`). When `total === 0` we render an
 * empty-state placeholder rather than a flat baseline.
 */
function HourChart({
  data,
  w = 320,
  h = 140,
}: {
  data: { counts: number[]; peakHour: number | null; total: number };
  w?: number;
  h?: number;
}): JSX.Element {
  const { counts, peakHour, total } = data;
  const max = Math.max(1, ...counts);
  const pad = 24;
  const bw = (w - pad * 2) / 24;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="stats-svg"
      role="img"
      aria-label={
        peakHour != null
          ? `Plays by hour of day (peak ${peakHour}:00, ${total} total)`
          : "Plays by hour of day (no data yet)"
      }
      data-testid="stats-hour-chart"
      data-peak-hour={peakHour ?? ""}
      data-total={total}
    >
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="rgba(148,163,184,0.25)" />
      {counts.map((v, hr) => {
        const bh = ((h - pad * 2) * v) / max;
        const x = pad + hr * bw + bw * 0.1;
        const y = h - pad - bh;
        const isPeak = peakHour === hr && total > 0;
        // Label every 6h so 24 ticks don't crowd the axis.
        const showLabel = hr % 6 === 0 || hr === 23;
        return (
          <g
            key={hr}
            data-testid={`stats-hour-bar-${hr}`}
            data-peak={isPeak ? "true" : undefined}
            data-count={v}
          >
            <rect
              x={x}
              y={y}
              width={bw * 0.8}
              height={bh}
              rx="2"
              fill={isPeak ? "#fbbf24" : "#a78bfa"}
            />
            {showLabel && (
              <text
                x={x + bw * 0.4}
                y={h - pad + 12}
                fontSize="9"
                fill="rgba(203,213,225,0.7)"
                textAnchor="middle"
              >
                {hr}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * 5×7 heatmap: rows are categories (solitaire/cards/dice/board/arcade),
 * columns are days of the week (Mon..Sun). Cell opacity is linear in
 * `count / max`, with a faint floor for empty cells so the grid stays
 * legible. Renders as a CSS grid of `<div>`s rather than an SVG so the
 * accent-colored background reads correctly under any theme.
 */
function HeatmapChart({
  data,
}: {
  data: { counts: number[][]; max: number; total: number };
}): JSX.Element {
  const { counts, max } = data;
  return (
    <div className="stats-heatmap" data-testid="stats-cat-heatmap" role="img" aria-label="Plays by category and day of week, last 30 days">
      <div className="stats-heatmap-row stats-heatmap-row--head" aria-hidden="true">
        <span className="stats-heatmap-cat" />
        {DAY_LABELS.map((d) => (
          <span key={d} className="stats-heatmap-dow">{d}</span>
        ))}
      </div>
      {HEATMAP_CATEGORIES.map((cat, ci) => (
        <div key={cat} className="stats-heatmap-row">
          <span className="stats-heatmap-cat">{cat}</span>
          {DAY_LABELS.map((d, di) => {
            const v = counts[ci][di];
            const opacity = max > 0 ? 0.12 + 0.88 * (v / max) : 0.08;
            return (
              <span
                key={d}
                className="stats-heatmap-cell"
                style={{ opacity }}
                title={`${cat} · ${d}: ${v}`}
                data-testid={`stats-cat-heatmap-${cat}-${d.toLowerCase()}`}
                data-count={v}
              >{v > 0 ? v : ""}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface PieDatum { label: string; v: number }
function PieChart({ data, size = 160, svgRef }: { data: PieDatum[]; size?: number; svgRef?: RefObject<SVGSVGElement> }): JSX.Element {
  const total = data.reduce((a, b) => a + b.v, 0);
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;
  let acc = 0;
  return (
    <div className="stats-pie-wrap">
      <svg ref={svgRef} viewBox={`0 0 ${size} ${size}`} className="stats-svg stats-pie" role="img" aria-label="Time per game (top 5)" data-testid="stats-pie-chart">
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

/**
 * Resolve the current `--accent` CSS variable from the document root, with
 * a hard-coded fallback that matches the StatsPage default purple. Used at
 * export time so the downloaded SVG echoes the user's active theme even if
 * the theme is set via inline style on a parent that isn't `<html>`.
 */
function resolveAccent(): string {
  if (typeof document === "undefined" || typeof getComputedStyle === "undefined") return "#a78bfa";
  const probe = document.querySelector(".stats-page") ?? document.documentElement;
  const v = getComputedStyle(probe as Element).getPropertyValue("--accent").trim();
  return v || "#a78bfa";
}

/**
 * Serialize a live `<svg>` DOM element into a standalone, printable SVG
 * document: white background, black axis labels, and the supplied accent
 * color recolored on the bar/line/pie strokes. We clone before mutating so
 * the on-screen chart is unaffected, and we strip React-only attributes
 * (`data-testid`) that have no meaning outside the app.
 */
function chartToStandaloneSvg(node: SVGSVGElement, accent: string): string {
  const clone = node.cloneNode(true) as SVGSVGElement;
  // Ensure xmlns + a printable width/height so consumers (Inkscape, browsers
  // opening the file directly) get a fixed size rather than 100% × auto.
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const vb = clone.getAttribute("viewBox") ?? "0 0 320 140";
  const [, , vbW, vbH] = vb.split(/\s+/).map((n) => parseFloat(n));
  clone.setAttribute("width", String(Math.round(vbW || 320)));
  clone.setAttribute("height", String(Math.round(vbH || 140)));
  clone.removeAttribute("class");
  // Drop React/test-only attrs
  clone.querySelectorAll("[data-testid]").forEach((el) => el.removeAttribute("data-testid"));
  // Recolor the dark-theme purple bars and the blue line stroke to use --accent
  // so the export reflects the user's active theme.
  clone.querySelectorAll('[fill="#a78bfa"]').forEach((el) => el.setAttribute("fill", accent));
  clone.querySelectorAll('[fill="#60a5fa"]').forEach((el) => el.setAttribute("fill", accent));
  clone.querySelectorAll('[stroke="#60a5fa"]').forEach((el) => el.setAttribute("stroke", accent));
  // Axis labels were dim slate for dark UI — make them solid black on white
  // for printability.
  clone.querySelectorAll("text").forEach((el) => el.setAttribute("fill", "#000000"));
  // Make the baseline crisper against white.
  clone.querySelectorAll('line[stroke="rgba(148,163,184,0.25)"]').forEach((el) =>
    el.setAttribute("stroke", "#94a3b8"),
  );
  // Inject a white background rect as the first child.
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("x", "0");
  bg.setAttribute("y", "0");
  bg.setAttribute("width", "100%");
  bg.setAttribute("height", "100%");
  bg.setAttribute("fill", "#ffffff");
  clone.insertBefore(bg, clone.firstChild);
  const inner = new XMLSerializer().serializeToString(clone);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${inner}`;
}

/**
 * Bundle the three live chart SVGs into a single 1200×1800 vertical-stack
 * document. Each panel is laid out with a header label and 540px of plot
 * height, so consumers get one printable page rather than three files.
 */
function buildCombinedSvg(
  bar: SVGSVGElement | null,
  line: SVGSVGElement | null,
  pie: SVGSVGElement | null,
  accent: string,
): string {
  const W = 1200;
  const H = 1800;
  const PANEL_H = 540;
  const HEAD_H = 60;
  const GAP = 30;

  // Reuse the single-chart sanitizer to get a clean inner SVG, then strip
  // the outer <svg> wrapper so we can re-embed each as a <g>.
  const innerBody = (svg: SVGSVGElement | null, label: string, idx: number): string => {
    const y0 = idx * (PANEL_H + GAP) + 80;
    const titleY = y0 + 10;
    const plotY = y0 + HEAD_H;
    const vbW = svg?.viewBox?.baseVal?.width || 320;
    const vbH = svg?.viewBox?.baseVal?.height || 140;
    const targetW = W - 80;
    const targetH = PANEL_H - HEAD_H;
    // Fit-inside scale so the chart fills the panel without distortion.
    const scale = Math.min(targetW / vbW, targetH / vbH);
    const drawW = vbW * scale;
    const drawH = vbH * scale;
    const offsetX = 40 + (targetW - drawW) / 2;
    const offsetY = plotY + (targetH - drawH) / 2;
    let body = "";
    if (svg) {
      const sanitized = chartToStandaloneSvg(svg, accent);
      // Strip the XML prolog and the outer <svg ...> tags so the contents can
      // be inlined as a <g>. Also drop the white-bg <rect> we just added —
      // we'll paint the combined background ourselves.
      const m = sanitized.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
      const guts = m ? m[1].replace(/<rect[^>]*fill="#ffffff"[^>]*\/>/, "") : "";
      body = `<g transform="translate(${offsetX.toFixed(2)} ${offsetY.toFixed(2)}) scale(${scale.toFixed(4)})">${guts}</g>`;
    } else {
      body = `<text x="${W / 2}" y="${plotY + targetH / 2}" fill="#94a3b8" font-family="Inter, system-ui, sans-serif" font-size="20" text-anchor="middle">No data</text>`;
    }
    return `
      <text x="40" y="${titleY}" fill="#0f172a" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="700">${label}</text>
      ${body}
    `;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <text x="40" y="50" fill="#0f172a" font-family="Inter, system-ui, sans-serif" font-size="32" font-weight="800">Cards &amp; Such — Stats</text>
  <text x="${W - 40}" y="50" fill="#64748b" font-family="Inter, system-ui, sans-serif" font-size="16" text-anchor="end">${new Date().toISOString().slice(0, 10)}</text>
  <line x1="40" y1="64" x2="${W - 40}" y2="64" stroke="${accent}" stroke-width="2"/>
  ${innerBody(line, "Activity", 0)}
  ${innerBody(pie, "Time spent (top 5)", 1)}
  ${innerBody(bar, "Top played", 2)}
</svg>`;
}

/**
 * Build a JSON blob containing the user's full stats subset — the parsed
 * `StatsState` plus every per-game side-table (best times, ratings,
 * favorites, time history, hints, undos). Distinct from `userdata.exportAll()`,
 * which also bundles theme/sound/UI settings; this is purely the stats blob
 * for power-user backups and bug-report attachments.
 */
interface StatsJsonExport {
  version: 1;
  exportedAt: string;
  app: "cards-and-such";
  kind: "stats";
  stats: StatsState;
  bestTimes: Record<string, number> | null;
  ratings: Record<string, number> | null;
  favorites: unknown;
  hintsUsed: Record<string, number> | null;
  undosUsed: Record<string, number> | null;
  timeHistory: Record<string, unknown>;
}

function buildStatsJson(): StatsJsonExport {
  const timeHistory: Record<string, unknown> = {};
  if (typeof localStorage !== "undefined") {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(TIME_HISTORY_KEY_PREFIX)) continue;
      const parsed = progressJSON<unknown>(k);
      if (parsed != null) timeHistory[k] = parsed;
    }
  }
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: "cards-and-such",
    kind: "stats",
    stats: loadStats(),
    bestTimes: progressJSON<Record<string, number>>("cards-best-times"),
    ratings: progressJSON<Record<string, number>>("cards-ratings"),
    favorites: progressJSON<unknown>("cards-favorites"),
    hintsUsed: progressJSON<Record<string, number>>("cards-hints-used"),
    undosUsed: progressJSON<Record<string, number>>("cards-undos-used"),
    timeHistory,
  };
}

function downloadStatsJson(filename: string): void {
  if (typeof document === "undefined" || typeof URL === "undefined") return;
  const json = JSON.stringify(buildStatsJson(), null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Quote a value per RFC 4180: wrap in double-quotes when it contains a comma,
 * quote, CR, or LF; double any embedded quote. Numbers are emitted bare.
 */
function csvCell(v: string | number): string {
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
  const s = String(v);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Build a CSV summary of every game that appears in `stats.perGame`,
 * augmented with the per-game side-tables (best time, rating, hints, undos).
 * Columns: gameId,plays,wins,winRate,bestTime,bestScore,rating,hintsUsed,undosUsed
 * Empty values are emitted as empty cells (not "0" or "—") so downstream
 * spreadsheets can distinguish "no data" from a true zero.
 */
function buildStatsCsv(): string {
  const stats = loadStats();
  const header = [
    "gameId",
    "plays",
    "wins",
    "winRate",
    "bestTime",
    "bestScore",
    "rating",
    "hintsUsed",
    "undosUsed",
  ].join(",");
  const rows: string[] = [header];
  const ids = Object.keys(stats.perGame).sort();
  for (const id of ids) {
    const gs = stats.perGame[id];
    const winRate = gs.played > 0 ? gs.wins / gs.played : null;
    const bestTime = bestTimeFor(id);
    const rating = ratingFor(id);
    const cells: (string | number)[] = [
      csvCell(id),
      csvCell(gs.played),
      csvCell(gs.wins),
      winRate != null ? winRate.toFixed(4) : "",
      bestTime != null ? csvCell(bestTime) : "",
      csvCell(gs.best || 0),
      rating != null ? rating.toFixed(2) : "",
      csvCell(hintsUsedFor(id)),
      csvCell(undosUsedFor(id)),
    ];
    rows.push(cells.join(","));
  }
  return rows.join("\r\n") + "\r\n";
}

function downloadStatsCsv(filename: string): void {
  if (typeof document === "undefined" || typeof URL === "undefined") return;
  const csv = buildStatsCsv();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function formatRelativeTime(ms: number): string {
  const diff = Math.max(0, Date.now() - ms);
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.round(mo / 12)}y ago`;
}

/** Aggregate of plays / wins / mean elapsed-seconds within a single bucket of
 *  the "this week vs prior week" comparison card. `avgTime` is `null` when no
 *  finished plays carried a positive elapsed time, so the UI can render an
 *  em-dash rather than "0s" — those are meaningfully different. */
interface WeekBucket {
  plays: number;
  wins: number;
  avgTime: number | null;
}

/**
 * Walk every `cards-time-history:<gameId>` localStorage entry and bucket each
 * play timestamp into either the current 7-day window (`[now-7d, now]`) or the
 * prior 7-day window (`[now-14d, now-7d)`). A play counts as a "win" when its
 * `score` field is a positive finite number — this matches how PlayPage records
 * a finished game. `avgTime` is the simple mean of every entry's `time` (in
 * seconds) within that window, ignoring zero / negative / non-finite values.
 *
 * Pure given a fixed `now`. Tolerates corrupt JSON the same way the rest of
 * this file does (skips silently, never throws).
 */
function buildWeekAggregates(
  now: number = Date.now(),
): { current: WeekBucket; prior: WeekBucket } {
  const dayMs = 24 * 60 * 60 * 1000;
  const curStart = now - 7 * dayMs;
  const priorStart = now - 14 * dayMs;
  const cur = { plays: 0, wins: 0, timeSum: 0, timeN: 0 };
  const prv = { plays: 0, wins: 0, timeSum: 0, timeN: 0 };
  if (typeof localStorage === "undefined") {
    return {
      current: { plays: 0, wins: 0, avgTime: null },
      prior: { plays: 0, wins: 0, avgTime: null },
    };
  }
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(TIME_HISTORY_KEY_PREFIX)) continue;
    const entries = progressJSON<unknown>(k);
    if (!Array.isArray(entries)) continue;
    for (const e of entries) {
      if (!e || typeof e !== "object") continue;
      const ts = (e as { ts?: unknown }).ts;
      const time = (e as { time?: unknown }).time;
      const score = (e as { score?: unknown }).score;
      if (typeof ts !== "number" || !Number.isFinite(ts)) continue;
      if (ts > now) continue;
      const bucket = ts >= curStart ? cur : ts >= priorStart ? prv : null;
      if (!bucket) continue;
      bucket.plays += 1;
      if (typeof score === "number" && Number.isFinite(score) && score > 0) {
        bucket.wins += 1;
      }
      if (typeof time === "number" && Number.isFinite(time) && time > 0) {
        bucket.timeSum += time;
        bucket.timeN += 1;
      }
    }
  }
  const finalize = (b: typeof cur): WeekBucket => ({
    plays: b.plays,
    wins: b.wins,
    avgTime: b.timeN > 0 ? b.timeSum / b.timeN : null,
  });
  return { current: finalize(cur), prior: finalize(prv) };
}

/** Whole-percent delta from `prior` -> `current`. Returns `null` when either
 *  side is null/undefined or when `prior` is 0 / non-positive (no baseline,
 *  so a percentage isn't meaningful). Positive = up vs prior, negative = down. */
function pctDelta(current: number | null, prior: number | null): number | null {
  if (current == null || prior == null) return null;
  if (!Number.isFinite(current) || !Number.isFinite(prior)) return null;
  if (prior <= 0) return null;
  return Math.round(((current - prior) / prior) * 100);
}

/** Format a mean elapsed-seconds value for the week-summary card. Mirrors
 *  {@link formatBestTime}'s shape so both cards read consistently, but accepts
 *  `null` so the row can render "—" when no plays were timed in the window. */
function formatAvgTime(seconds: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "—";
  return formatBestTime(seconds);
}

function formatBestTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

/** YYYY-MM-DD formatter for the "achieved on" column on the Personal Records
 *  card. Uses local-time fields rather than `toISOString()` so the date that
 *  appears matches what the user saw on their wall clock when the PR landed. */
function formatAchievedDate(ms: number): string {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "—";
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const dy = String(d.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${dy}`;
}

export default function StatsPage(): JSX.Element {
  const showConfirm = useConfirm();
  const [stats, setStats] = useState<StatsState>(() => loadStats());
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [range, setRange] = useState<RangeOption>(14);
  const [search, setSearch] = useState<string>("");
  const [drillId, setDrillId] = useState<string | null>(null);
  // Saved replays (newest-first, capped REPLAY_CAP). Read once at mount;
  // the Replays panel is informational and doesn't write to this store.
  const replays = useMemo(() => loadReplays().slice().reverse(), []);

  // Live refs to each chart's <svg> DOM node — used by the Export buttons to
  // serialize whatever the user is currently looking at, including any
  // category/range filter state, rather than re-deriving from props.
  const barRef = useRef<SVGSVGElement | null>(null);
  const lineRef = useRef<SVGSVGElement | null>(null);
  const pieRef = useRef<SVGSVGElement | null>(null);

  const exportChart = (which: "bar" | "line" | "pie"): void => {
    const node = which === "bar" ? barRef.current : which === "line" ? lineRef.current : pieRef.current;
    if (!node) return;
    const svg = chartToStandaloneSvg(node, resolveAccent());
    downloadSvg(svg, `cards-stats-${which}.svg`);
  };

  const exportAll = (): void => {
    const svg = buildCombinedSvg(barRef.current, lineRef.current, pieRef.current, resolveAccent());
    downloadSvg(svg, "cards-stats-all.svg");
    // Stamp the export flag for the "Exporter" achievement (v44).
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("cards-stats-exported", "true");
      }
    } catch {
      /* ignore quota / private mode */
    }
  };

  const exportJson = (): void => {
    const today = new Date().toISOString().slice(0, 10);
    downloadStatsJson(`cards-stats-${today}.json`);
  };

  const exportCsv = (): void => {
    const today = new Date().toISOString().slice(0, 10);
    downloadStatsCsv(`cards-stats-${today}.csv`);
  };

  const fav = favoriteCategory(stats);

  const matchesCategory = (gameId: string): boolean => {
    if (category === "all") return true;
    const plug = GAMES.find((g) => g.id === gameId);
    return plug?.category === category;
  };

  const filteredPerGame = useMemo(() => {
    const out: Record<string, { played: number; wins: number; best: number }> = {};
    for (const [id, gs] of Object.entries(stats.perGame)) {
      if (matchesCategory(id)) out[id] = gs;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, category]);

  const totalsForFilter = useMemo(() => {
    let played = 0;
    let wins = 0;
    for (const gs of Object.values(filteredPerGame)) {
      played += gs.played;
      wins += gs.wins;
    }
    return { played, wins };
  }, [filteredPerGame]);

  const bestPerCategory = useMemo(() => {
    const out: Record<string, { gameId: string; title: string; score: number }> = {};
    for (const [gameId, gs] of Object.entries(stats.perGame)) {
      const plugin = GAMES.find((g) => g.id === gameId);
      if (!plugin) continue;
      if (category !== "all" && plugin.category !== category) continue;
      const cat = plugin.category;
      const cur = out[cat];
      if (!cur || gs.best > cur.score) out[cat] = { gameId, title: plugin.title, score: gs.best };
    }
    return out;
  }, [stats, category]);

  const categoryBarData = useMemo<BarDatum[]>(() => {
    // Top-played games (was per-category before — now drives drill-down).
    const entries = Object.entries(stats.perGame)
      .filter(([id]) => matchesCategory(id))
      .map(([id, gs]) => {
        const plug = GAMES.find((g) => g.id === id);
        return { id, label: plug?.title ?? id, v: gs.played };
      })
      .filter((d) => d.v > 0)
      .sort((a, b) => b.v - a.v)
      .slice(0, 8);
    return entries;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, category]);

  const lineData = useMemo<BarDatum[]>(() => lastNDays(new Set(stats.daysPlayed), range), [stats, range]);

  /** Top-5 most-hinted games. Reads the `cards-hints-used` blob (a
   *  Record<gameId, number>) directly so the card stays accurate even when the
   *  game isn't in `stats.perGame` yet. Filters out 0-counts and unknown ids. */
  const mostHinted = useMemo<{ id: string; title: string; count: number }[]>(() => {
    const v = progressJSON<Record<string, number>>("cards-hints-used");
    if (!v || typeof v !== "object") return [];
    const rows: { id: string; title: string; count: number }[] = [];
    for (const [id, n] of Object.entries(v)) {
      if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) continue;
      const plug = GAMES.find((g) => g.id === id);
      if (!plug) continue;
      rows.push({ id, title: plug.title, count: n });
    }
    rows.sort((a, b) => b.count - a.count);
    return rows.slice(0, 5);
    // Re-derive when stats change so the card refreshes after a reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  // Category × day-of-week heatmap over the last 30 days. Re-derived from
  // `cards-time-history:*` whenever stats change so a Reset clears the grid.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const heatmapData = useMemo(() => buildCategoryDowHeatmap(30), [stats]);

  // 24-hour-of-day chart aggregated across every game's time history. Re-derived
  // when stats change so Reset clears the bars to all zero.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hourData = useMemo(() => buildHourOfDayCounts(), [stats]);

  // "This week" comparison card: current 7-day window vs prior 7-day window
  // aggregated from `cards-time-history:*`. Re-derived when stats change so a
  // Reset zeroes out plays/wins and clears the avg-time row.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const weekAggregates = useMemo(() => buildWeekAggregates(), [stats]);

  /** Top-10 personal best times across all known games. Reads
   *  `cards-best-times` directly (a `Record<gameId, number>` of seconds), drops
   *  unknown / non-positive entries, sorts ascending (lower is better), then
   *  resolves an achieved-on timestamp by scanning the per-game time history
   *  for the earliest entry whose recorded `time` matches the best. Falls back
   *  to `null` when no matching history entry exists so the row renders as
   *  "—". Re-derives whenever stats change so a Reset wipes the card. */
  const personalRecords = useMemo<{
    id: string;
    title: string;
    time: number;
    achievedAt: number | null;
    isFresh: boolean;
  }[]>(() => {
    const v = progressJSON<Record<string, number>>("cards-best-times");
    if (!v || typeof v !== "object") return [];
    const rows: { id: string; title: string; time: number; achievedAt: number | null; isFresh: boolean }[] = [];
    for (const [id, t] of Object.entries(v)) {
      if (typeof t !== "number" || !Number.isFinite(t) || t <= 0) continue;
      const plug = GAMES.find((g) => g.id === id);
      if (!plug) continue;
      const history = readTimeHistory(id);
      let achievedAt: number | null = null;
      for (const e of history) {
        // Match within 0.05s to absorb float rounding from formatBestTime
        // round-trips elsewhere. Take the EARLIEST match — that's when the PR
        // was first set, even if it was later tied.
        if (Math.abs(e.time - t) <= 0.05) {
          if (achievedAt == null || e.ts < achievedAt) achievedAt = e.ts;
        }
      }
      // "Fresh PR": the most recent history entry IS this best time AND it
      // strictly beats every earlier entry. We compare the latest entry's
      // time to the second-best (minimum across all prior entries) — if no
      // earlier entry exists or every earlier entry is slower, the latest
      // run set a brand-new personal record.
      let isFresh = false;
      if (history.length > 0) {
        const latest = history[history.length - 1];
        if (Math.abs(latest.time - t) <= 0.05) {
          let secondBest = Infinity;
          for (let i = 0; i < history.length - 1; i += 1) {
            const prev = history[i];
            if (Number.isFinite(prev.time) && prev.time > 0 && prev.time < secondBest) {
              secondBest = prev.time;
            }
          }
          if (latest.time < secondBest - 0.05) isFresh = true;
        }
      }
      rows.push({ id, title: plug.title, time: t, achievedAt, isFresh });
    }
    rows.sort((a, b) => a.time - b.time);
    return rows.slice(0, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  const topGamesPie = useMemo<PieDatum[]>(() => {
    return Object.entries(stats.perGame)
      .filter(([id]) => matchesCategory(id))
      .map(([id, gs]) => {
        const plug = GAMES.find((g) => g.id === id);
        return { label: plug?.title ?? id, v: gs.played };
      })
      .filter((d) => d.v > 0)
      .sort((a, b) => b.v - a.v)
      .slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, category]);

  const filteredAchievements = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter(
      (a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q),
    );
  }, [search]);

  const drillInfo = useMemo(() => {
    if (!drillId) return null;
    const plug = GAMES.find((g) => g.id === drillId);
    const gs = stats.perGame[drillId];
    if (!plug || !gs) return null;
    // Pull the per-game time history (last <=20 entries, oldest -> newest)
    // and project the `time` field for the best-times sparkline.
    const history = readTimeHistory(drillId);
    const times = history.map((e) => e.time).filter((t) => Number.isFinite(t) && t > 0);
    return {
      id: drillId,
      title: plug.title,
      category: plug.category,
      played: gs.played,
      wins: gs.wins,
      best: gs.best,
      bestTime: bestTimeFor(drillId),
      lastPlayed: lastPlayedFor(drillId),
      rating: ratingFor(drillId),
      hintsUsed: hintsUsedFor(drillId),
      undosUsed: undosUsedFor(drillId),
      times,
    };
  }, [drillId, stats]);

  const handleReset = async (): Promise<void> => {
    const ok = await showConfirm({
      title: "Reset all stats?",
      message: "This will clear every play count, win, best score, and history entry. This cannot be undone.",
      confirmLabel: "Reset stats",
      danger: true,
    });
    if (!ok) return;
    resetStats();
    setStats(loadStats());
    setDrillId(null);
  };

  return (
    <div className="stats-page" data-testid="stats-page">
      <div className="stats-page-head">
        <h1>Your stats</h1>
        <div className="stats-export-actions">
          <button
            type="button"
            className="btn btn-ghost stats-export-all"
            onClick={exportAll}
            data-testid="stats-export-all"
            title="Download all three charts as a single SVG"
          >Export all charts</button>
          <button
            type="button"
            className="btn btn-ghost stats-export-json"
            onClick={exportJson}
            data-testid="stats-export-json"
            title="Download your full stats blob as JSON (debugging + backups)"
          >
            <span className="stats-export-json-badge" aria-hidden="true">JSON</span>
            Download stats
          </button>
          <button
            type="button"
            className="btn btn-ghost stats-export-csv"
            onClick={exportCsv}
            data-testid="stats-export-csv"
            title="Download per-game stats summary as CSV (spreadsheet-friendly)"
          >
            <span className="stats-export-json-badge" aria-hidden="true">CSV</span>
            Download CSV
          </button>
        </div>
      </div>

      {/* Top control row: category chips */}
      <div className="stats-controls" data-testid="stats-controls">
        <div className="lobby-chips" role="tablist" aria-label="Filter by category">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`lobby-chip${category === c.id ? " is-active" : ""}`}
              onClick={() => setCategory(c.id)}
              data-testid={`stats-cat-filter-${c.id}`}
              aria-pressed={category === c.id}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <section className="stats-card-grid">
        <div className="stats-card stats-card--exportable" data-testid="stats-activity">
          <button
            type="button"
            className="stats-export-btn"
            onClick={() => exportChart("line")}
            data-testid="stats-export-line"
            title="Download activity chart as SVG"
            aria-label="Download activity chart as SVG"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
              <path d="M8 1.5v8.7m0 0L4.5 6.7M8 10.2l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.5 11.5v1.7c0 .55.45 1 1 1h9a1 1 0 0 0 1-1v-1.7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <h2>Activity</h2>
          <div className="stats-summary">
            <div className="stat-card" data-testid="stat-total-played"><div className="stat-label">Games played</div><div className="stat-value">{category === "all" ? stats.totalPlayed : totalsForFilter.played}</div></div>
            <div className="stat-card" data-testid="stat-total-wins"><div className="stat-label">Total wins</div><div className="stat-value">{category === "all" ? stats.totalWins : totalsForFilter.wins}</div></div>
            <div className="stat-card" data-testid="stat-total-hints"><div className="stat-label">Total hints used</div><div className="stat-value">{hintsTotal()}</div></div>
            <div className="stat-card" data-testid="stat-total-undos"><div className="stat-label">Total undos used</div><div className="stat-value">{undosTotal()}</div></div>
          </div>
          <div className="stats-range-row">
            <div className="stats-chart-label">Last {range} days</div>
            <div className="stats-range-toggle" role="tablist" aria-label="Activity range">
              {RANGE_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`stats-range-btn${range === n ? " is-active" : ""}`}
                  onClick={() => setRange(n)}
                  data-testid={`stats-range-${n}d`}
                  aria-pressed={range === n}
                >
                  {n}d
                </button>
              ))}
            </div>
          </div>
          <LineChart data={lineData} rangeLabel={`${range}d`} svgRef={lineRef} />
        </div>

        <div className="stats-card stats-card--exportable" data-testid="stats-records">
          <button
            type="button"
            className="stats-export-btn"
            onClick={() => exportChart("pie")}
            data-testid="stats-export-pie"
            title="Download time-spent pie chart as SVG"
            aria-label="Download time-spent pie chart as SVG"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
              <path d="M8 1.5v8.7m0 0L4.5 6.7M8 10.2l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.5 11.5v1.7c0 .55.45 1 1 1h9a1 1 0 0 0 1-1v-1.7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <h2>Records</h2>
          <div className="stats-summary">
            <div className="stat-card" data-testid="stat-longest-streak"><div className="stat-label">Longest streak</div><div className="stat-value">{stats.longestStreak}</div></div>
            <div className="stat-card" data-testid="stat-favorite-category"><div className="stat-label">Favorite</div><div className="stat-value">{fav ?? "—"}</div></div>
          </div>
          <div className="stats-chart-label">Time spent (top 5 games)</div>
          {topGamesPie.length === 0 ? <p className="stats-empty">No games played yet.</p> : <PieChart data={topGamesPie} svgRef={pieRef} />}
        </div>

        <div className="stats-card stats-card--exportable" data-testid="stats-categories">
          <button
            type="button"
            className="stats-export-btn"
            onClick={() => exportChart("bar")}
            data-testid="stats-export-bar"
            title="Download top-played bar chart as SVG"
            aria-label="Download top-played bar chart as SVG"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
              <path d="M8 1.5v8.7m0 0L4.5 6.7M8 10.2l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.5 11.5v1.7c0 .55.45 1 1 1h9a1 1 0 0 0 1-1v-1.7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <h2>Top played</h2>
          <div className="stats-chart-label">Click a bar to see details</div>
          {categoryBarData.length === 0
            ? <p className="stats-empty">No games played yet.</p>
            : <BarChart data={categoryBarData} onSelect={(id) => setDrillId((cur) => (cur === id ? null : id))} selectedId={drillId} svgRef={barRef} />}

          {drillInfo && (
            <div className="stats-drill-panel" data-testid="stats-drill-panel">
              <div className="stats-drill-head">
                <span className={`play-category play-category--${drillInfo.category}`}>{drillInfo.category}</span>
                <span className="stats-drill-title">{drillInfo.title}</span>
                <button
                  type="button"
                  className="stats-drill-close"
                  onClick={() => setDrillId(null)}
                  aria-label="Close drill-down"
                  data-testid="stats-drill-close"
                >×</button>
              </div>
              <ul className="stats-drill-list">
                <li><span>Plays</span><em>{drillInfo.played}</em></li>
                <li><span>Wins</span><em>{drillInfo.wins}</em></li>
                <li><span>Best score</span><em>{drillInfo.best || "—"}</em></li>
                <li className="stats-drill-best-time">
                  <span>Best time</span>
                  <span className="stats-drill-value">
                    {drillInfo.times.length > 0 && (
                      <Sparkline data={drillInfo.times} testId={`stats-sparkline-${drillInfo.id}`} />
                    )}
                    <em>{drillInfo.bestTime != null ? formatBestTime(drillInfo.bestTime) : "—"}</em>
                  </span>
                </li>
                <li><span>Last played</span><em>{drillInfo.lastPlayed != null ? formatRelativeTime(drillInfo.lastPlayed) : "—"}</em></li>
                <li><span>Your rating</span><em>{drillInfo.rating != null ? `${drillInfo.rating.toFixed(1)}★` : "—"}</em></li>
                <li data-testid="stats-drill-hints"><span>Hints used</span><em>{drillInfo.hintsUsed}</em></li>
                <li data-testid="stats-drill-undos"><span>Undos used</span><em>{drillInfo.undosUsed}</em></li>
              </ul>
              <Link to={`/play/${drillInfo.id}`} className="btn btn-primary stats-drill-play" data-testid="stats-drill-play">Play</Link>
            </div>
          )}

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

        <div className="stats-card" data-testid="stats-most-hinted">
          <h2>Most-hinted games</h2>
          {mostHinted.length === 0 ? (
            <p className="stats-empty">No hints used yet — try the lightbulb button on a game!</p>
          ) : (
            <ul className="stats-most-hinted-list">
              {mostHinted.map((row, idx) => (
                <li key={row.id} data-testid={`stats-most-hinted-row-${idx}`}>
                  <span className="stats-most-hinted-rank">{idx + 1}</span>
                  <span className="stats-most-hinted-title">{row.title}</span>
                  {/* No per-week hint history is tracked, so we render a single
                   *  sample which the Sparkline draws as a small horizontal bar
                   *  proportional only to the row's accent. The data-testid lets
                   *  tests assert presence without depending on shape. */}
                  <Sparkline data={[row.count]} testId={`stats-sparkline-${row.id}`} />
                  <span className="stats-most-hinted-count">{row.count}</span>
                  <Link to={`/play/${row.id}`} className="btn btn-ghost stats-most-hinted-play">Play</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="stats-card" data-testid="stats-hour-of-day">
          <h2>Plays by hour of day</h2>
          <p className="stats-chart-label">
            {hourData.total === 0
              ? "No plays recorded yet — finish a game to start the chart"
              : hourData.peakHour != null
                ? `Peak ${String(hourData.peakHour).padStart(2, "0")}:00 · ${hourData.total} total plays`
                : `${hourData.total} total plays`}
          </p>
          <HourChart data={hourData} />
        </div>

        <div className="stats-card" data-testid="stats-cat-heatmap-card">
          <h2>Plays by category × day-of-week</h2>
          <p className="stats-chart-label">
            {heatmapData.total === 0
              ? "No plays recorded in the last 30 days yet"
              : `${heatmapData.total} plays in the last 30 days`}
          </p>
          <HeatmapChart data={heatmapData} />
        </div>

        <div className="stats-card" data-testid="stats-personal-records">
          <h2>Personal records</h2>
          <p className="stats-chart-label">Top 10 best times across all games</p>
          {personalRecords.length === 0 ? (
            <p className="stats-empty">No best times recorded yet — finish a timed game!</p>
          ) : (
            <ul className="stats-pr-list">
              {personalRecords.map((row, idx) => (
                <li
                  key={row.id}
                  data-testid={`stats-pr-row-${idx}`}
                  data-fresh={row.isFresh ? "true" : undefined}
                >
                  <span className="stats-pr-rank">{idx + 1}</span>
                  <span className="stats-pr-title">
                    {row.title}
                    {row.isFresh && (
                      <span
                        className="stats-pr-new"
                        data-testid={`stats-pr-new-${row.id}`}
                        title="New personal record!"
                        aria-label="New personal record"
                      >
                        <span aria-hidden="true">✨</span> NEW
                      </span>
                    )}
                  </span>
                  <span className="stats-pr-time">{formatBestTime(row.time)}</span>
                  <span className="stats-pr-date">
                    {row.achievedAt != null ? formatAchievedDate(row.achievedAt) : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="stats-card stats-card--week" data-testid="stats-this-week">
          <h2>This week</h2>
          <p className="stats-chart-label">Last 7 days vs prior 7 days</p>
          {(() => {
            const { current, prior } = weekAggregates;
            const playsDelta = pctDelta(current.plays, prior.plays);
            const winsDelta = pctDelta(current.wins, prior.wins);
            // Avg-time deltas are inverted in tone (faster = better), but we
            // still report the raw % change — color signaling is left to the
            // CSS based on direction. A null delta renders as an em-dash.
            const avgDelta = pctDelta(current.avgTime, prior.avgTime);
            const renderDelta = (d: number | null): JSX.Element => {
              if (d == null) return <span className="stats-week-delta is-flat" data-direction="flat">—</span>;
              if (d > 0) return <span className="stats-week-delta is-up" data-direction="up">▲ {d}%</span>;
              if (d < 0) return <span className="stats-week-delta is-down" data-direction="down">▼ {Math.abs(d)}%</span>;
              return <span className="stats-week-delta is-flat" data-direction="flat">0%</span>;
            };
            return (
              <>
                <ul className="stats-week-list" data-testid="stats-this-week-list">
                  <li>
                    <span className="stats-week-label">Plays</span>
                    <em className="stats-week-value">{current.plays}</em>
                    {renderDelta(playsDelta)}
                  </li>
                  <li>
                    <span className="stats-week-label">Wins</span>
                    <em className="stats-week-value">{current.wins}</em>
                    {renderDelta(winsDelta)}
                  </li>
                  <li>
                    <span className="stats-week-label">Avg time</span>
                    <em className="stats-week-value">{formatAvgTime(current.avgTime)}</em>
                    {renderDelta(avgDelta)}
                  </li>
                </ul>
                <ul className="stats-week-list stats-week-list--prev" data-testid="stats-prev-week">
                  <li>
                    <span className="stats-week-label">Prior plays</span>
                    <em className="stats-week-value">{prior.plays}</em>
                  </li>
                  <li>
                    <span className="stats-week-label">Prior wins</span>
                    <em className="stats-week-value">{prior.wins}</em>
                  </li>
                  <li>
                    <span className="stats-week-label">Prior avg time</span>
                    <em className="stats-week-value">{formatAvgTime(prior.avgTime)}</em>
                  </li>
                </ul>
              </>
            );
          })()}
        </div>

        <div className="stats-card" data-testid="stats-replays-panel">
          <h2>Replays</h2>
          <p className="stats-chart-label">Last {replays.length === 0 ? 0 : replays.length} saved replay{replays.length === 1 ? "" : "s"} (max 5)</p>
          {replays.length === 0 ? (
            <p className="stats-empty" data-testid="stats-replays-empty">
              No replays saved yet — finish a game and tap "Save replay" on the win banner.
            </p>
          ) : (
            <ul className="stats-replays-list">
              {replays.map((r, idx) => {
                const plug = GAMES.find((g) => g.id === r.gameId);
                const title = plug?.title ?? r.gameId;
                return (
                  <li
                    key={r.id}
                    className="stats-replay-row"
                    data-testid={`stats-replay-${idx}`}
                  >
                    <span className="stats-replay-title">{title}</span>
                    <span className="stats-replay-meta">
                      seed <code>{r.seed}</code> · {r.actions.length} action{r.actions.length === 1 ? "" : "s"}
                    </span>
                    <Link
                      to={`/play/${r.gameId}?seed=${r.seed}`}
                      className="stats-replay-play"
                      data-testid={`stats-replay-${idx}-play`}
                    >
                      Play
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="stats-card" data-testid="stats-achievements">
          <h2>Achievements</h2>
          <input
            type="search"
            className="stats-search"
            placeholder="Search achievements…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="stats-search"
            aria-label="Search achievements"
          />
          <div className="achievements-grid">
            {filteredAchievements.map((a) => {
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
            {filteredAchievements.length === 0 && (
              <p className="stats-empty" data-testid="stats-search-empty">No achievements match.</p>
            )}
          </div>
        </div>
      </section>

      <footer className="stats-footer">
        <span className="stats-footer-note">Stats are stored locally in your browser.</span>
        <button
          type="button"
          className="btn btn-ghost stats-reset-btn"
          onClick={handleReset}
          data-testid="stats-reset"
        >Reset stats</button>
      </footer>
    </div>
  );
}

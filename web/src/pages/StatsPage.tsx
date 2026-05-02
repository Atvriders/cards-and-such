import { useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { Link } from "react-router-dom";
import { ACHIEVEMENTS, favoriteCategory, loadStats, resetStats } from "../platform/stats.js";
import type { Achievement, StatsState } from "../platform/stats.js";
import { GAMES } from "../games/registry.js";
import { downloadSvg } from "../platform/svgShare.js";
import { useConfirm } from "../platform/ConfirmDialog.js";
import "./StatsPage.css";

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

function formatBestTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export default function StatsPage(): JSX.Element {
  const showConfirm = useConfirm();
  const [stats, setStats] = useState<StatsState>(() => loadStats());
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [range, setRange] = useState<RangeOption>(14);
  const [search, setSearch] = useState<string>("");
  const [drillId, setDrillId] = useState<string | null>(null);

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
        <button
          type="button"
          className="btn btn-ghost stats-export-all"
          onClick={exportAll}
          data-testid="stats-export-all"
          title="Download all three charts as a single SVG"
        >Export all charts</button>
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
                <li><span>Best time</span><em>{drillInfo.bestTime != null ? formatBestTime(drillInfo.bestTime) : "—"}</em></li>
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

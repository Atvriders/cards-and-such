import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  LeaderboardRowSchema,
  GlobalLeaderboardRowSchema,
  type LeaderboardRow,
  type GlobalLeaderboardRow,
} from "@cards/shared";
import { z } from "zod";
import { useToast } from "../platform/ui/Toast.js";
import { useAuth } from "../platform/stores/auth.js";
import { Skeleton } from "../platform/Skeleton.js";
import { OnlineNowPanel } from "./leaderboard/OnlineNowPanel.js";
import { PageHead } from "../platform/PageHead.js";
import { loadStats } from "../platform/stats.js";
import { readRatings } from "../platform/StarRating.js";
import { getLastPlayed } from "../platform/userdata.js";
import { buildLadderSvg, downloadSvg } from "../platform/svgShare.js";
import "./LeaderboardPage.css";

type Tab = "per-game" | "global" | "online" | "my-ladder";
type GameCategory = "solitaire" | "cards" | "dice" | "board" | "arcade";
type CategoryFilter = "all" | GameCategory;
type TimeRange = "all" | "today" | "week" | "month";
type SortMode = "score" | "recent" | "alpha";
type FriendFilter = "all" | "friends";

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "All",
  solitaire: "Solitaire",
  cards: "Cards",
  dice: "Dice",
  board: "Board",
  arcade: "Arcade",
};

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  all: "All time",
  today: "Today",
  week: "This week",
  month: "This month",
};

const SORT_LABELS: Record<SortMode, string> = {
  score: "Highest score",
  recent: "Most recent",
  alpha: "Username (A–Z)",
};

const CATEGORY_ORDER: GameCategory[] = ["solitaire", "cards", "dice", "board", "arcade"];

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const DAY_MS = 24 * 60 * 60 * 1000;

// Curated featured games per category. We deliberately avoid importing the
// full GAMES registry here — it transitively pulls in thousands of game
// modules, which would slow this page's first render and balloon the
// leaderboard's API fan-out. A short curated list keeps the page snappy and
// focused on titles that actually have meaningful score volume.
const FEATURED_GAMES: ReadonlyArray<{ id: string; title: string; category: GameCategory }> = [
  { id: "klondike", title: "Klondike", category: "solitaire" },
  { id: "spider", title: "Spider", category: "solitaire" },
  { id: "freecell", title: "FreeCell", category: "solitaire" },
  { id: "pyramid", title: "Pyramid", category: "solitaire" },
  { id: "tripeaks", title: "TriPeaks", category: "solitaire" },
  { id: "yukon", title: "Yukon", category: "solitaire" },
  { id: "hearts", title: "Hearts", category: "cards" },
  { id: "spades", title: "Spades", category: "cards" },
  { id: "rummy", title: "Rummy", category: "cards" },
  { id: "cribbage", title: "Cribbage", category: "cards" },
  { id: "uno-like", title: "Uno-like", category: "cards" },
  { id: "blackjack", title: "Blackjack", category: "cards" },
  { id: "yahtzee", title: "Yahtzee", category: "dice" },
  { id: "farkle", title: "Farkle", category: "dice" },
  { id: "ten-thousand", title: "Ten Thousand", category: "dice" },
  { id: "pig", title: "Pig", category: "dice" },
  { id: "chess", title: "Chess", category: "board" },
  { id: "checkers", title: "Checkers", category: "board" },
  { id: "connect-4", title: "Connect 4", category: "board" },
  { id: "backgammon", title: "Backgammon", category: "board" },
  { id: "minesweeper", title: "Minesweeper", category: "arcade" },
  { id: "snake", title: "Snake", category: "arcade" },
  { id: "breakout", title: "Breakout", category: "arcade" },
  { id: "tetris", title: "Tetris", category: "arcade" },
];

/**
 * Build a deeplink to a game's play page, optionally seeded.
 *
 * Used by the per-row share button. If the score row carries a seed (rows
 * may carry an optional `seed` field beyond the validated schema), we
 * preserve it so the recipient plays the exact same deal; otherwise we
 * generate a fresh random seed so the link is still playable.
 */
function buildShareUrl(gameId: string, seed: number | undefined | null): string {
  const s = seed != null && Number.isFinite(seed)
    ? Math.trunc(seed)
    : Math.floor(Math.random() * 0x7fffffff);
  const origin = typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "https://cards.waterburp.com";
  // Production canonical host is cards.waterburp.com — but during local dev
  // the origin will differ. Honor the runtime origin so dev links stay
  // clickable; the prod build naturally produces the canonical host.
  const base = origin.includes("localhost") ? "https://cards.waterburp.com" : origin;
  return `${base}/play/${gameId}?seed=${s}`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  return false;
}

function timeRangeCutoff(range: TimeRange): number {
  if (range === "all") return 0;
  const now = Date.now();
  if (range === "today") return now - DAY_MS;
  if (range === "week") return now - 7 * DAY_MS;
  return now - 30 * DAY_MS;
}

function formatTimestamp(ms: number): string {
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return String(ms);
  }
}

export default function LeaderboardPage(): JSX.Element {
  const [tab, setTab] = useState<Tab>("per-game");
  return (
    <div className="leaderboard-layout">
      <PageHead
        title="Leaderboard"
        description="See top scores across Cards and Such — global rankings, per-game leaderboards, and who's playing online right now."
        canonical="https://cards.waterburp.com/leaderboard"
      />
      <section className="leaderboard-main">
        <h1 tabIndex={-1}>Leaderboard</h1>
        <nav className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "per-game"} onClick={() => setTab("per-game")}>Per-game</button>
          <button role="tab" aria-selected={tab === "global"} onClick={() => setTab("global")}>Global</button>
          <button role="tab" aria-selected={tab === "my-ladder"} onClick={() => setTab("my-ladder")}>My Ladder</button>
          <button role="tab" aria-selected={tab === "online"} onClick={() => setTab("online")}>Online now</button>
        </nav>
        {tab === "per-game" && <PerGamePanel />}
        {tab === "global" && <GlobalPanel />}
        {tab === "my-ladder" && <MyLadderPanel />}
        {tab === "online" && <div className="online-standalone"><OnlineNowPanel /></div>}
      </section>
      {tab !== "online" && <OnlineNowPanel />}
    </div>
  );
}

function PerGamePanel(): JSX.Element {
  const me = useAuth((s) => s.username);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [sortMode, setSortMode] = useState<SortMode>("score");
  const [friendFilter, setFriendFilter] = useState<FriendFilter>("all");

  const visibleCategories = category === "all" ? CATEGORY_ORDER : [category];

  return (
    <div className="lb-pergame">
      <div className="lb-controls">
        <label className="lb-control">
          <span>Category</span>
          <select
            aria-label="category filter"
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryFilter)}
          >
            {(["all", ...CATEGORY_ORDER] as CategoryFilter[]).map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </label>
        <label className="lb-control">
          <span>Time range</span>
          <select
            aria-label="time range filter"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          >
            {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((t) => (
              <option key={t} value={t}>{TIME_RANGE_LABELS[t]}</option>
            ))}
          </select>
        </label>
        <label className="lb-control">
          <span>Sort by</span>
          <select
            aria-label="sort order"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
          >
            {(Object.keys(SORT_LABELS) as SortMode[]).map((s) => (
              <option key={s} value={s}>{SORT_LABELS[s]}</option>
            ))}
          </select>
        </label>
        <label className="lb-control">
          <span>Friends</span>
          <select
            aria-label="friend filter"
            value={friendFilter}
            onChange={(e) => setFriendFilter(e.target.value as FriendFilter)}
          >
            <option value="all">Everyone</option>
            <option value="friends">Friends only</option>
          </select>
        </label>
        <label className="lb-control lb-search">
          <span>Search</span>
          <input
            type="search"
            placeholder="Filter by username…"
            aria-label="search username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {visibleCategories.map((cat) => {
        const games = FEATURED_GAMES.filter((g) => g.category === cat);
        if (games.length === 0) return null;
        return (
          <section key={cat} className="lb-category">
            <h2 className="lb-category-title">{CATEGORY_LABELS[cat]}</h2>
            <div className="lb-game-grid">
              {games.map((g) => (
                <GameLeaderboardCard
                  key={g.id}
                  game={g}
                  search={search}
                  me={me}
                  timeRange={timeRange}
                  sortMode={sortMode}
                  friendFilter={friendFilter}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// Allow rows to optionally carry a seed (the API may include it; the strict
// schema validates only the canonical fields, so we widen the type here).
type LeaderboardRowExt = LeaderboardRow & { seed?: number };

function GameLeaderboardCard({
  game,
  search,
  me,
  timeRange,
  sortMode,
  friendFilter,
}: {
  game: { id: string; title: string; category: GameCategory };
  search: string;
  me: string | null;
  timeRange: TimeRange;
  sortMode: SortMode;
  friendFilter: FriendFilter;
}): JSX.Element {
  const [rows, setRows] = useState<LeaderboardRowExt[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/leaderboard/game/${game.id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`http_${r.status}`);
        const j = await r.json();
        // Validate canonical fields, but preserve the optional `seed` if
        // the server included it on each row.
        const parsed = z.array(LeaderboardRowSchema).parse(j);
        const merged: LeaderboardRowExt[] = parsed.map((row, i) => {
          const raw = Array.isArray(j) ? j[i] : undefined;
          const seed = raw && typeof raw === "object" && typeof (raw as { seed?: unknown }).seed === "number"
            ? ((raw as { seed: number }).seed)
            : undefined;
          return seed != null ? { ...row, seed } : row;
        });
        if (!cancelled) setRows(merged);
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setRows([]);
          // Quietly tolerate per-card failures; surface only the canonical
          // klondike error so the toast doesn't spam.
          if (game.id === "klondike") useToast.getState().push("error", e.message);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [game.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cutoff = timeRangeCutoff(timeRange);

    let out = rows.slice();
    if (q) out = out.filter((r) => r.username.toLowerCase().includes(q));
    if (cutoff > 0) out = out.filter((r) => r.playedAt >= cutoff);

    if (friendFilter === "friends") {
      // Friends feature is stubbed. With no friend list yet, surface only
      // the current user; if there's no logged-in user, fall back to
      // showing all so the panel isn't surprisingly empty.
      if (me) {
        const myName = me.toLowerCase();
        out = out.filter((r) => r.username.toLowerCase() === myName);
      }
    }

    if (sortMode === "score") {
      out.sort((a, b) => b.score - a.score || a.rank - b.rank);
    } else if (sortMode === "recent") {
      out.sort((a, b) => b.playedAt - a.playedAt);
    } else {
      out.sort((a, b) => a.username.toLowerCase().localeCompare(b.username.toLowerCase()));
    }
    return out;
  }, [rows, search, timeRange, sortMode, friendFilter, me]);

  return (
    <article className="lb-card">
      <header className="lb-card-head">
        <Link to={`/play/${game.id}`} className="lb-game-link">
          {game.title}
        </Link>
        <span className="lb-card-count">{rows.length} {rows.length === 1 ? "score" : "scores"}</span>
      </header>
      <div className="lb-table-wrap">
        <table className="lb-table">
          <thead>
            <tr>
              <th scope="col" className="lb-rank">#</th>
              <th scope="col">Player</th>
              <th scope="col" className="lb-score">Score</th>
              <th scope="col" className="lb-share-col" aria-label="share" />
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonRows rows={5} cols={4} testId="lb-skeleton-row" />}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={4} className="lb-empty">{search ? "No matches" : "No scores yet"}</td></tr>
            )}
            {!loading && filtered.map((r) => {
              const medal = MEDALS[r.rank];
              const isMe = me && r.username.toLowerCase() === me.toLowerCase();
              const rowKey = `${r.rank}-${r.username}-${r.playedAt}`;
              const expanded = expandedKey === rowKey;
              return (
                <RowWithDetails
                  key={rowKey}
                  row={r}
                  gameId={game.id}
                  medal={medal}
                  isMe={!!isMe}
                  expanded={expanded}
                  onToggle={() => setExpandedKey(expanded ? null : rowKey)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function RowWithDetails({
  row,
  gameId,
  medal,
  isMe,
  expanded,
  onToggle,
}: {
  row: LeaderboardRowExt;
  gameId: string;
  medal: string | undefined;
  isMe: boolean;
  expanded: boolean;
  onToggle: () => void;
}): JSX.Element {
  const [shareState, setShareState] = useState<"idle" | "copied" | "failed">("idle");

  const handleShare = async (e: React.MouseEvent): Promise<void> => {
    // Don't trigger row expansion when clicking the share button.
    e.stopPropagation();
    const url = buildShareUrl(gameId, row.seed);
    const ok = await copyToClipboard(url);
    setShareState(ok ? "copied" : "failed");
    if (ok) {
      useToast.getState().push("success", "Link copied!");
    } else {
      useToast.getState().push("error", "Couldn't copy link");
    }
    setTimeout(() => setShareState("idle"), 1500);
  };

  const onKey = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <>
      <tr
        className={[
          medal ? `lb-medal lb-medal-${row.rank}` : "",
          isMe ? "lb-me" : "",
          expanded ? "lb-row-expanded" : "",
        ].filter(Boolean).join(" ")}
        onClick={onToggle}
        onKeyDown={onKey}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        data-testid="lb-row"
      >
        <td className="lb-rank">
          {medal ? <span className="lb-medal-icon" aria-label={`rank ${row.rank}`}>{medal}</span> : row.rank}
        </td>
        <td className="lb-user">
          <span>{row.username}</span>
          {isMe && <span className="lb-you-badge">you</span>}
        </td>
        <td className="lb-score">{row.score.toLocaleString()}</td>
        <td className="lb-share-col">
          <button
            type="button"
            className="lb-share-btn"
            aria-label={`Share ${row.username}'s ${gameId} score`}
            title={shareState === "copied" ? "Copied!" : shareState === "failed" ? "Couldn't copy" : "Share link"}
            onClick={handleShare}
          >
            {shareState === "copied" ? "✓" : "🔗"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="lb-row-details" data-testid="lb-row-details">
          <td colSpan={4}>
            <dl className="lb-details">
              <div>
                <dt>Played</dt>
                <dd>{formatTimestamp(row.playedAt)}</dd>
              </div>
              <div>
                <dt>Seed</dt>
                <dd>{row.seed != null ? `#${row.seed}` : "—"}</dd>
              </div>
              <div>
                <dt>Score</dt>
                <dd>{row.score.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Rank</dt>
                <dd>#{row.rank}</dd>
              </div>
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}

function GlobalPanel(): JSX.Element {
  const me = useAuth((s) => s.username);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<GlobalLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("score");
  const [friendFilter, setFriendFilter] = useState<FriendFilter>("all");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leaderboard/global")
      .then(async (r) => {
        if (!r.ok) throw new Error(`http_${r.status}`);
        const j = await r.json();
        const parsed = z.array(GlobalLeaderboardRowSchema).parse(j);
        if (!cancelled) setRows(parsed);
      })
      .catch((e: Error) => useToast.getState().push("error", e.message))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = rows.slice();
    if (q) out = out.filter((r) => r.username.toLowerCase().includes(q));

    if (friendFilter === "friends" && me) {
      const myName = me.toLowerCase();
      out = out.filter((r) => r.username.toLowerCase() === myName);
    }

    if (sortMode === "score") {
      out.sort((a, b) => b.gamesPlayed - a.gamesPlayed || a.rank - b.rank);
    } else if (sortMode === "alpha") {
      out.sort((a, b) => a.username.toLowerCase().localeCompare(b.username.toLowerCase()));
    }
    // "recent" has no playedAt on the global schema; fall back to default order.
    return out;
  }, [rows, search, sortMode, friendFilter, me]);

  return (
    <div className="lb-global">
      <div className="lb-controls">
        <label className="lb-control">
          <span>Sort by</span>
          <select
            aria-label="sort order global"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
          >
            <option value="score">Most games</option>
            <option value="alpha">Username (A–Z)</option>
          </select>
        </label>
        <label className="lb-control">
          <span>Friends</span>
          <select
            aria-label="friend filter global"
            value={friendFilter}
            onChange={(e) => setFriendFilter(e.target.value as FriendFilter)}
          >
            <option value="all">Everyone</option>
            <option value="friends">Friends only</option>
          </select>
        </label>
        <label className="lb-control lb-search">
          <span>Search</span>
          <input
            type="search"
            placeholder="Filter by username…"
            aria-label="search username global"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="lb-table-wrap lb-global-wrap">
        <table className="lb-table">
          <thead>
            <tr>
              <th scope="col" className="lb-rank">#</th>
              <th scope="col">Player</th>
              <th scope="col" className="lb-score">Games</th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonRows rows={8} cols={3} testId="lb-global-skeleton-row" />}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={3} className="lb-empty">{search ? "No matches" : "No players yet"}</td></tr>
            )}
            {!loading && filtered.map((r) => {
              const medal = MEDALS[r.rank];
              const isMe = me && r.username.toLowerCase() === me.toLowerCase();
              return (
                <tr
                  key={r.username}
                  className={[
                    medal ? `lb-medal lb-medal-${r.rank}` : "",
                    isMe ? "lb-me" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <td className="lb-rank">
                    {medal ? <span className="lb-medal-icon" aria-label={`rank ${r.rank}`}>{medal}</span> : r.rank}
                  </td>
                  <td className="lb-user">
                    <span>{r.username}</span>
                    {isMe && <span className="lb-you-badge">you</span>}
                  </td>
                  <td className="lb-score">{r.gamesPlayed.toLocaleString()} games</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Skeleton placeholder rows used while a leaderboard fetch is pending.
 *
 * Renders a fixed number of `<tr>` elements so the table doesn't collapse
 * to a single "Loading…" line; each row contains skeleton placeholders
 * sized to roughly match a real rank/username/score row, keeping the
 * column widths stable when the real data arrives.
 */
function SkeletonRows({
  rows,
  cols,
  testId,
}: {
  rows: number;
  cols: number;
  testId: string;
}): JSX.Element {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={`skel-${i}`} className="lb-skeleton-row" data-testid={`${testId}-${i}`}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={`skel-${i}-${c}`} className={c === 0 ? "lb-rank" : c === cols - 1 ? "lb-score" : "lb-user"}>
              <Skeleton
                variant="text-line"
                width={c === 0 ? 22 : c === cols - 1 ? 56 : "70%"}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ============================================================
 * My Ladder — client-only personal ranking from localStorage.
 * Pulls best scores/times from `cards-and-such:stats:v1` and
 * `cards-best-times`, last-played from `cards-last-played`,
 * and star ratings from `cards-ratings`. Renders a rich row
 * list and offers a downloadable SVG of the current view.
 * ============================================================ */

interface LadderRow {
  id: string;
  title: string;
  best: number;          // raw best score from stats
  bestTimeSec: number;   // optional best time in seconds (0 = none)
  played: number;        // total plays
  wins: number;
  lastPlayed: number;    // ms epoch (0 = unknown)
  rating: number;        // 0..5
}

function readBestTimes(): Record<string, number> {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem("cards-best-times");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, number>;
  } catch { return {}; }
}

function formatRelative(ms: number): string {
  if (!ms) return "—";
  const diff = Date.now() - ms;
  if (diff < 0) return "just now";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(d / 365);
  return `${y}y ago`;
}

function formatBestTime(sec: number): string {
  if (!sec || !Number.isFinite(sec) || sec <= 0) return "";
  const mm = Math.floor(sec / 60);
  const ss = String(Math.floor(sec % 60)).padStart(2, "0");
  return `${mm}:${ss}`;
}

type LadderSortMode = "score" | "rating" | "recent" | "alpha";

const LADDER_SORT_LABELS: Record<LadderSortMode, string> = {
  score: "Best score",
  rating: "Star rating",
  recent: "Most recent",
  alpha: "Title (A–Z)",
};

function MyLadderPanel(): JSX.Element {
  const me = useAuth((s) => s.username);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [sortMode, setSortMode] = useState<LadderSortMode>("score");
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  // Lazy-load the registry only when this tab mounts. The registry is huge
  // (8000+ lines pulling in every game module), so we keep it out of the
  // initial bundle and accept a single async tick when the user opens
  // "My Ladder" for the first time.
  useEffect(() => {
    let cancelled = false;
    void import("../games/registry.js").then((mod) => {
      if (cancelled) return;
      const map: Record<string, string> = {};
      for (const g of mod.GAMES) map[g.id] = g.title;
      setTitles(map);
    }).catch(() => { /* registry unavailable — fall back to ids */ });
    return () => { cancelled = true; };
  }, []);

  // Snapshot localStorage on every render. This is fine — these reads are
  // tiny synchronous JSON parses, and we want the page to reflect the
  // latest data right after a play session ends.
  const ladder: LadderRow[] = useMemo(() => {
    const stats = loadStats();
    const bestTimes = readBestTimes();
    const lastPlayed = getLastPlayed();
    const ratings = readRatings();

    const ids = new Set<string>([
      ...Object.keys(stats.perGame),
      ...Object.keys(bestTimes),
      ...Object.keys(ratings),
      ...Object.keys(lastPlayed),
    ]);

    const rows: LadderRow[] = [];
    for (const id of ids) {
      const s = stats.perGame[id];
      const played = s?.played ?? 0;
      const wins = s?.wins ?? 0;
      const best = s?.best ?? 0;
      const rating = ratings[id] ?? 0;
      // Skip ids that have no signal at all (would just be noise).
      if (played === 0 && best === 0 && rating === 0 && !bestTimes[id]) continue;
      rows.push({
        id,
        title: titles[id] ?? id,
        best,
        bestTimeSec: bestTimes[id] ?? 0,
        played,
        wins,
        lastPlayed: lastPlayed[id] ?? 0,
        rating,
      });
    }

    if (sortMode === "score") {
      rows.sort((a, b) => b.best - a.best || b.played - a.played);
    } else if (sortMode === "rating") {
      rows.sort((a, b) => b.rating - a.rating || b.best - a.best);
    } else if (sortMode === "recent") {
      rows.sort((a, b) => b.lastPlayed - a.lastPlayed);
    } else {
      rows.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
    }
    return rows;
  }, [titles, sortMode]);

  // Hall of Fame: top 5 by combined (rating × plays) — a simple "love score"
  // that surfaces games the user keeps coming back to. Falls back to plays
  // alone for unrated titles so a brand-new ladder still has a top 5.
  const hallOfFame = useMemo(() => {
    const scored = ladder
      .map((r) => ({ row: r, score: (r.rating || 1) * Math.max(1, r.played) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.row);
    return scored;
  }, [ladder]);

  const handleShare = (): void => {
    const svg = buildLadderSvg(ladder, me);
    downloadSvg(svg, "cards-ladder.svg");
    try { useToast.getState().push("success", "Ladder exported as SVG"); } catch { /* toast unavailable */ }
  };

  const empty = ladder.length === 0;

  return (
    <div className="lb-myladder">
      <div className="lb-ladder-head">
        <h2
          ref={headingRef}
          className="lb-ladder-title"
          tabIndex={0}
          aria-label={me ? `${me}'s personal ladder` : "Your personal ladder"}
        >
          {me ? `${me}'s ladder` : "Your ladder"}
        </h2>
        <div className="lb-ladder-actions">
          {!empty && (
            <label className="lb-control lb-control-inline">
              <span>Sort</span>
              <select
                aria-label="ladder sort"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as LadderSortMode)}
              >
                {(Object.keys(LADDER_SORT_LABELS) as LadderSortMode[]).map((s) => (
                  <option key={s} value={s}>{LADDER_SORT_LABELS[s]}</option>
                ))}
              </select>
            </label>
          )}
          <button
            type="button"
            className="lb-share-ladder-btn"
            data-testid="lb-share-btn"
            aria-label="Share my ladder as an SVG download"
            onClick={handleShare}
            disabled={empty}
            title={empty ? "Play a game first to share your ladder" : "Download ladder as SVG"}
          >
            <span aria-hidden="true">⬇</span> Share my ladder
          </button>
        </div>
      </div>

      {empty ? (
        <div className="lb-ladder-empty" data-testid="lb-empty" role="status" aria-live="polite">
          <svg
            className="lb-empty-art"
            viewBox="0 0 200 140"
            width="160"
            height="112"
            aria-hidden="true"
            focusable="false"
          >
            <rect x="20" y="84" width="40" height="48" rx="6" fill="rgba(129,140,248,0.18)" stroke="rgba(129,140,248,0.4)"/>
            <rect x="80" y="60" width="40" height="72" rx="6" fill="rgba(129,140,248,0.28)" stroke="rgba(129,140,248,0.55)"/>
            <rect x="140" y="38" width="40" height="94" rx="6" fill="rgba(129,140,248,0.42)" stroke="rgba(129,140,248,0.7)"/>
            <text x="40" y="116" fill="#e0e3ff" fontFamily="Inter, system-ui, sans-serif" fontSize="14" textAnchor="middle">3</text>
            <text x="100" y="104" fill="#e0e3ff" fontFamily="Inter, system-ui, sans-serif" fontSize="14" textAnchor="middle">2</text>
            <text x="160" y="86" fill="#fde68a" fontFamily="Inter, system-ui, sans-serif" fontSize="16" fontWeight="700" textAnchor="middle">1</text>
            <text x="160" y="32" fontSize="20" textAnchor="middle">★</text>
          </svg>
          <p className="lb-empty-title">Your ladder is empty</p>
          <p className="lb-empty-sub">
            <Link to="/">Play a game</Link> to see your ladder appear here.
          </p>
        </div>
      ) : (
        <>
          {hallOfFame.length > 0 && (
            <section className="lb-hof" aria-labelledby="lb-hof-heading">
              <h3 id="lb-hof-heading" tabIndex={0} className="lb-hof-heading">Hall of Fame</h3>
              <div className="lb-hof-carousel" role="list">
                {hallOfFame.map((r, i) => (
                  <Link
                    key={r.id}
                    to={`/play/${r.id}`}
                    role="listitem"
                    className={`lb-hof-card lb-hof-card-${i + 1}`}
                    aria-label={`Hall of Fame #${i + 1}: ${r.title}, ${r.played} plays, ${r.rating || 0} stars`}
                  >
                    <span className="lb-hof-rank">#{i + 1}</span>
                    <span className="lb-hof-title">{r.title}</span>
                    <span className="lb-hof-meta">
                      {"★".repeat(Math.max(0, Math.min(5, Math.round(r.rating))))}
                      <span className="lb-hof-stars-empty">
                        {"★".repeat(5 - Math.max(0, Math.min(5, Math.round(r.rating))))}
                      </span>
                    </span>
                    <span className="lb-hof-plays">{r.played} plays</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="lb-ladder-list" aria-labelledby="lb-ladder-rows-heading">
            <h3 id="lb-ladder-rows-heading" tabIndex={0} className="lb-ladder-rows-heading">
              All games · {ladder.length}
            </h3>
            <ul className="lb-ladder-rows">
              {ladder.map((r, i) => {
                const medal = MEDALS[i + 1];
                const bestTime = formatBestTime(r.bestTimeSec);
                const winRate = r.played > 0 ? Math.round((r.wins / r.played) * 100) : 0;
                const ratingRounded = Math.max(0, Math.min(5, Math.round(r.rating)));
                return (
                  <li
                    key={r.id}
                    className="lb-ladder-row"
                    data-testid={`lb-row-${r.id}`}
                    aria-label={`Rank ${i + 1}: ${r.title}, best score ${r.best}, played ${r.played} times, last played ${formatRelative(r.lastPlayed)}, rated ${ratingRounded} of 5 stars`}
                  >
                    <span className="lb-ladder-rank" aria-hidden="true">
                      {medal ? <span className="lb-medal-icon">{medal}</span> : <span>#{i + 1}</span>}
                    </span>
                    <Link to={`/play/${r.id}`} className="lb-ladder-game">
                      <span className="lb-ladder-game-title">{r.title}</span>
                      <span className="lb-ladder-game-meta">
                        {bestTime && <span className="lb-pill lb-pill-time">⏱ {bestTime}</span>}
                        <span className="lb-pill">▶ {r.played}</span>
                        {winRate > 0 && <span className="lb-pill">✓ {winRate}%</span>}
                      </span>
                    </Link>
                    <span
                      className="lb-ladder-rating"
                      aria-hidden="true"
                      title={ratingRounded > 0 ? `${ratingRounded}/5` : "Not rated"}
                    >
                      <span className="lb-rating-filled">{"★".repeat(ratingRounded)}</span>
                      <span className="lb-rating-empty">{"★".repeat(5 - ratingRounded)}</span>
                    </span>
                    <span className="lb-ladder-score" aria-hidden="true">
                      {r.best.toLocaleString()}
                    </span>
                    <span className="lb-ladder-when" aria-hidden="true">
                      {formatRelative(r.lastPlayed)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

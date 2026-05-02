import { useEffect, useMemo, useState } from "react";
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
import "./LeaderboardPage.css";

type Tab = "per-game" | "global" | "online";
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
        <h1>Leaderboard</h1>
        <nav className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "per-game"} onClick={() => setTab("per-game")}>Per-game</button>
          <button role="tab" aria-selected={tab === "global"} onClick={() => setTab("global")}>Global</button>
          <button role="tab" aria-selected={tab === "online"} onClick={() => setTab("online")}>Online now</button>
        </nav>
        {tab === "per-game" && <PerGamePanel />}
        {tab === "global" && <GlobalPanel />}
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

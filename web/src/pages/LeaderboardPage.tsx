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
import { OnlineNowPanel } from "./leaderboard/OnlineNowPanel.js";
import "./LeaderboardPage.css";

type Tab = "per-game" | "global" | "online";
type GameCategory = "solitaire" | "cards" | "dice" | "board" | "arcade";
type CategoryFilter = "all" | GameCategory;

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "All",
  solitaire: "Solitaire",
  cards: "Cards",
  dice: "Dice",
  board: "Board",
  arcade: "Arcade",
};

const CATEGORY_ORDER: GameCategory[] = ["solitaire", "cards", "dice", "board", "arcade"];

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

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

export default function LeaderboardPage(): JSX.Element {
  const [tab, setTab] = useState<Tab>("per-game");
  return (
    <div className="leaderboard-layout">
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
                <GameLeaderboardCard key={g.id} game={g} search={search} me={me} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function GameLeaderboardCard({
  game,
  search,
  me,
}: {
  game: { id: string; title: string; category: GameCategory };
  search: string;
  me: string | null;
}): JSX.Element {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/leaderboard/game/${game.id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`http_${r.status}`);
        const j = await r.json();
        const parsed = z.array(LeaderboardRowSchema).parse(j);
        if (!cancelled) setRows(parsed);
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
    if (!q) return rows;
    return rows.filter((r) => r.username.toLowerCase().includes(q));
  }, [rows, search]);

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
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={3} className="lb-empty">Loading…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={3} className="lb-empty">{search ? "No matches" : "No scores yet"}</td></tr>
            )}
            {!loading && filtered.map((r) => {
              const medal = MEDALS[r.rank];
              const isMe = me && r.username.toLowerCase() === me.toLowerCase();
              return (
                <tr
                  key={`${r.rank}-${r.username}`}
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
                  <td className="lb-score">{r.score.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function GlobalPanel(): JSX.Element {
  const me = useAuth((s) => s.username);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<GlobalLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (!q) return rows;
    return rows.filter((r) => r.username.toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <div className="lb-global">
      <div className="lb-controls">
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
            {loading && <tr><td colSpan={3} className="lb-empty">Loading…</td></tr>}
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

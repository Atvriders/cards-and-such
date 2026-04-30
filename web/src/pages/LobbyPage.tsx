import { useDeferredValue, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GAMES } from "../games/registry.js";
import type { GameCategory } from "../platform/game-plugin/types.js";
import "./LobbyPage.css";

type Filter = "all" | GameCategory;

const CATEGORY_ORDER: GameCategory[] = ["solitaire", "cards", "dice", "board", "arcade"];
const CATEGORY_LABELS: Record<GameCategory, string> = {
  solitaire: "Solitaire",
  cards: "Cards",
  dice: "Dice",
  board: "Board",
  arcade: "Arcade",
};

// Compact monochrome glyphs that sit cleanly inside the chip pills.
const CATEGORY_GLYPHS: Record<GameCategory, string> = {
  solitaire: "♤",
  cards: "♣",
  dice: "⚂",
  board: "▦",
  arcade: "✦",
};

const FEATURED_IDS = [
  "klondike",
  "freecell",
  "spider",
  "holdem",
  "game-of-life",
  "wordle-mini",
] as const;

const PAGE_SIZE = 80;

export default function LobbyPage(): JSX.Element {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(query);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Per-category counts (computed once over the full registry).
  const categoryCounts = useMemo(() => {
    const counts: Record<GameCategory, number> = {
      solitaire: 0, cards: 0, dice: 0, board: 0, arcade: 0,
    };
    for (const g of GAMES) counts[g.category]++;
    return counts;
  }, []);

  // Featured strip — pluck out a few well-known titles, fall back gracefully.
  const featured = useMemo(() => {
    const byId = new Map(GAMES.map((g) => [g.id, g] as const));
    return FEATURED_IDS.map((id) => byId.get(id)).filter((g): g is typeof GAMES[number] => Boolean(g));
  }, []);

  // Filtered + searched list. useMemo so 4500-game scans only re-run on input change.
  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const list = filter === "all" ? GAMES : GAMES.filter((g) => g.category === filter);
    if (!q) return list;
    return list.filter((g) =>
      g.title.toLowerCase().includes(q)
      || g.category.toLowerCase().includes(q)
      || g.description.toLowerCase().includes(q),
    );
  }, [filter, deferredQuery]);

  // Reset window when filter or query changes.
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filter, deferredQuery]);

  // Infinite-scroll sentinel: when it crosses the viewport, page in more cards.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (visibleCount >= filtered.length) return;
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
        }
      }
    }, { rootMargin: "400px 0px" });
    io.observe(node);
    return () => io.disconnect();
  }, [filtered.length, visibleCount]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  // "Surprise me" — jump to a random game in the current filtered set.
  const surpriseMe = useCallback(() => {
    const pool = filtered.length > 0 ? filtered : GAMES;
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)]!;
    navigate(`/play/${pick.id}`);
  }, [filtered, navigate]);

  if (GAMES.length === 0) {
    return (
      <div className="lobby-empty" data-testid="lobby-empty">
        <h1>Cards and Such</h1>
        <p>No games installed yet.</p>
      </div>
    );
  }

  return (
    <div className="lobby-page">
      <header className="lobby-hero">
        <div className="lobby-hero-orb lobby-hero-orb--a" aria-hidden="true" />
        <div className="lobby-hero-orb lobby-hero-orb--b" aria-hidden="true" />
        <div className="lobby-hero-eyebrow">
          <span className="lobby-hero-pulse" aria-hidden="true" />
          <span>Live Catalog</span>
        </div>
        <h1>
          <span className="lobby-hero-title">Cards and Such</span>
        </h1>
        <p className="lobby-sub" data-testid="lobby-total-count">
          <strong>{GAMES.length.toLocaleString()}</strong> games and growing — search, browse, deal yourself in.
        </p>
        <div className="lobby-hero-stats" aria-label="Catalog breakdown">
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={`stat-${cat}`}
              type="button"
              className={`lobby-stat lobby-stat--${cat}${filter === cat ? " is-active" : ""}`}
              onClick={() => setFilter(cat)}
              aria-label={`Filter by ${CATEGORY_LABELS[cat]} (${categoryCounts[cat]} games)`}
            >
              <span className="lobby-stat-glyph" aria-hidden="true">{CATEGORY_GLYPHS[cat]}</span>
              <span className="lobby-stat-count">{categoryCounts[cat].toLocaleString()}</span>
              <span className="lobby-stat-label">{CATEGORY_LABELS[cat]}</span>
            </button>
          ))}
          <button
            type="button"
            className="lobby-stat lobby-stat--lucky"
            onClick={surpriseMe}
            aria-label="Open a random game"
            data-testid="lobby-surprise"
          >
            <span className="lobby-stat-glyph" aria-hidden="true">🎲</span>
            <span className="lobby-stat-count">Lucky</span>
            <span className="lobby-stat-label">Surprise me</span>
          </button>
        </div>
      </header>

      <div className="lobby-controls">
        <div className="lobby-search">
          <span className="lobby-search-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            type="search"
            className="lobby-search-input"
            placeholder="Search 4,500+ games…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="lobby-search"
            aria-label="Search games"
          />
          {query && (
            <button
              type="button"
              className="lobby-search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >×</button>
          )}
        </div>

        <div className="lobby-chips" role="tablist" aria-label="Filter by category">
          <Chip active={filter === "all"} onClick={() => setFilter("all")} count={GAMES.length} testId="chip-all">All</Chip>
          {CATEGORY_ORDER.map((cat) => (
            <Chip
              key={cat}
              active={filter === cat}
              onClick={() => setFilter(cat)}
              count={categoryCounts[cat]}
              testId={`chip-${cat}`}
              glyph={CATEGORY_GLYPHS[cat]}
            >{CATEGORY_LABELS[cat]}</Chip>
          ))}
        </div>
      </div>

      {!query && filter === "all" && featured.length > 0 && (
        <section className="lobby-featured" aria-label="Featured games">
          <h2>
            <span className="lobby-featured-spark" aria-hidden="true">✦</span>
            Featured
          </h2>
          <div className="lobby-grid lobby-grid--featured">
            {featured.map((g) => <GameCard key={`feat-${g.id}`} game={g} featured />)}
          </div>
        </section>
      )}

      <section aria-label="All games">
        <div className="lobby-section-head">
          <h2>
            {filter === "all" ? "All games" : CATEGORY_LABELS[filter]}
            {query && <span className="lobby-section-count"> · {filtered.length.toLocaleString()} match{filtered.length === 1 ? "" : "es"}</span>}
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="lobby-no-results" data-testid="lobby-no-results">
            <p>No games match <strong>{query}</strong>.</p>
            <button type="button" className="btn btn-ghost" onClick={() => { setQuery(""); setFilter("all"); }}>Clear filters</button>
          </div>
        ) : (
          <>
            <div className="lobby-grid">
              {visible.map((g) => <GameCard key={g.id} game={g} />)}
            </div>
            {hasMore && (
              <div className="lobby-loadmore" ref={sentinelRef}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length))}
                  data-testid="lobby-load-more"
                >
                  Load more · {(filtered.length - visibleCount).toLocaleString()} remaining
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <footer className="lobby-footer" aria-label="Site footer">
        <div className="lobby-footer-row">
          <span className="lobby-footer-brand">Cards and Such</span>
          <span className="lobby-footer-dot" aria-hidden="true">·</span>
          <span>{GAMES.length.toLocaleString()} games in the catalog</span>
        </div>
        <div className="lobby-footer-links">
          <Link to="/leaderboard">Leaderboard</Link>
        </div>
      </footer>
    </div>
  );
}

interface ChipProps {
  active: boolean;
  count: number;
  testId: string;
  onClick: () => void;
  glyph?: string;
  children: React.ReactNode;
}
function Chip({ active, count, testId, onClick, glyph, children }: ChipProps): JSX.Element {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`lobby-chip${active ? " is-active" : ""}`}
      onClick={onClick}
      data-testid={testId}
    >
      {glyph && <span className="lobby-chip-glyph" aria-hidden="true">{glyph}</span>}
      <span>{children}</span>
      <span className="lobby-chip-count">{count.toLocaleString()}</span>
    </button>
  );
}

function GameCard({ game: g, featured }: { game: typeof GAMES[number]; featured?: boolean }): JSX.Element {
  // Featured strip and the main "All games" grid both render some of the same
  // games. To keep `getByTestId("tile-<id>")` uniquely matching the catalog
  // entry (the original test contract), the featured strip uses a distinct
  // prefix for its testids.
  const testId = featured ? `feat-tile-${g.id}` : `tile-${g.id}`;
  return (
    <Link
      to={`/play/${g.id}`}
      className={`tile tile--cat-${g.category}${featured ? " tile--featured" : ""}`}
      data-testid={testId}
    >
      <span className="tile-stripe" aria-hidden="true" />
      <span className="tile-sheen" aria-hidden="true" />
      <div className="tile-meta">
        <span className={`tile-cat tile-cat-${g.category}`}>
          <span className="tile-cat-glyph" aria-hidden="true">{CATEGORY_GLYPHS[g.category]}</span>
          {CATEGORY_LABELS[g.category]}
        </span>
        {g.players.multiplayer && (
          <span
            className="tile-mp-badge"
            data-testid={featured ? `feat-mp-badge-${g.id}` : `mp-badge-${g.id}`}
          >
            <span className="tile-mp-dot" aria-hidden="true" />
            online
          </span>
        )}
      </div>
      <div className="tile-title">{g.title}</div>
      <div className="tile-desc">{g.description}</div>
      <div className="tile-foot">
        <span className="tile-players">
          {g.players.min === g.players.max ? `${g.players.min} player${g.players.min === 1 ? "" : "s"}` : `${g.players.min}–${g.players.max} players`}
        </span>
        <span className="tile-cta" aria-hidden="true">
          Play
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </span>
      </div>
    </Link>
  );
}

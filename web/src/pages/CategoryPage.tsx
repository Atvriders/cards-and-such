import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { GAMES } from "../games/registry.js";
import { FAMILIES, compareTitles, expandFamily, type GameFamily } from "../games/families.js";
import type { GameCategory, GamePlugin } from "../platform/game-plugin/types.js";
import { PageHead } from "../platform/PageHead.js";
import { StarRating, readRatings } from "../platform/StarRating.js";
import { loadStats } from "../platform/stats.js";
import { t } from "../platform/i18n.js";
import "./LobbyPage.css";
import "./CategoryPage.css";

/**
 * Per-category landing page (the `/category/:cat` route).
 *
 * Layout (top → bottom):
 *   1. Breadcrumb (Lobby › Category)
 *   2. Hero header — glyph, title, blurb, count badge.
 *   3. Featured strip — top 6 most-played in this category from
 *      `loadStats()`, falling back to registry order when no plays.
 *   4. Family group tiles — every family whose dominant category is
 *      the current one is rendered as a single tile that links into
 *      the lobby's family picker (anchored on the family id).
 *   5. Filter chips — All / Quick / Challenging / Top Rated.
 *   6. All-games grid, alphabetised, paginated at 80/page (matches
 *      `LobbyPage.PAGE_SIZE`).
 *
 * Test ids: `cat-header`, `cat-featured-<id>`, `cat-game-<id>`,
 * `cat-filter-<name>`, `cat-page-<n>`.
 *
 * QUICK_GAME_IDS / CHALLENGING_GAME_IDS are file-private to LobbyPage,
 * so a small in-file copy lives below — keep this set in lockstep with
 * LobbyPage's (the lists move infrequently and refactoring the lobby
 * just for this page would balloon the diff).
 */

const CATEGORIES: GameCategory[] = ["solitaire", "cards", "dice", "board", "arcade"];

const CATEGORY_LABELS: Record<GameCategory, string> = {
  solitaire: t("lobby.cat.solitaire"),
  cards: t("lobby.cat.cards"),
  dice: t("lobby.cat.dice"),
  board: t("lobby.cat.board"),
  arcade: t("lobby.cat.arcade"),
};

const CATEGORY_GLYPHS: Record<GameCategory, string> = {
  solitaire: "♤",
  cards: "♣",
  dice: "⚂",
  board: "▦",
  arcade: "✦",
};

const CATEGORY_TAG: Record<GameCategory, string> = {
  solitaire: "s",
  cards: "c",
  dice: "d",
  board: "b",
  arcade: "a",
};

const CATEGORY_BLURB: Record<GameCategory, string> = {
  solitaire: "Solitaire — single-player strategy with cards. Klondike, FreeCell, Spider, and hundreds more patiences.",
  cards: "Cards — trick-takers, shedding games, rummies, and modern card games for two or more.",
  dice: "Dice — Yahtzee-style rollers, push-your-luck, and dice-driven challenges.",
  board: "Board — chess, checkers, abstracts, and modern board game adaptations.",
  arcade: "Arcade — reflex, action, and casual puzzlers for a quick burst.",
};

// In-file copies of LobbyPage's curated difficulty sets (file-private there).
const QUICK_GAME_IDS = new Set<string>([
  "wordle-mini",
  "speed",
  "war",
  "snap",
  "high-low",
  "coin-flip",
  "yacht-mini",
  "pig-dice",
  "ship-captain-crew",
  "bar-dice-ship-captain",
  "tic-tac-toe-cards",
  "memory-pairs",
  "klondike-1",
]);

const CHALLENGING_GAME_IDS = new Set<string>([
  "spider",
  "freecell",
  "holdem",
  "stud-7",
  "omaha",
  "bridge",
  "go",
  "chess",
  "shogi",
  "mahjong",
  "skat",
  "pinochle",
  "canasta",
  "hanabi",
  "the-crew",
]);

const TOP_RATED_THRESHOLD = 4;
const PAGE_SIZE = 80;
const FEATURED_LIMIT = 6;

type Filter = "all" | "quick" | "challenging" | "top-rated";

function playersLine(p: { min: number; max: number }): string {
  return p.min === p.max
    ? `${p.min} player${p.min === 1 ? "" : "s"}`
    : `${p.min}–${p.max} players`;
}

interface FamilyTile {
  family: GameFamily;
  members: GamePlugin[];
}

export default function CategoryPage(): JSX.Element {
  const { cat } = useParams<{ cat: string }>();
  const category = (cat ?? "") as GameCategory;
  const isValid = CATEGORIES.includes(category);

  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [ratings] = useState<Record<string, number>>(() => readRatings());
  const [playCounts] = useState<Record<string, number>>(() => {
    try {
      const s = loadStats();
      const out: Record<string, number> = {};
      for (const [id, pg] of Object.entries(s.perGame ?? {})) {
        out[id] = pg?.played ?? 0;
      }
      return out;
    } catch {
      return {};
    }
  });

  // Reset paging whenever the filter or category changes.
  useEffect(() => { setPage(1); }, [filter, category]);

  // Every game in this category, alphabetised.
  const catGames = useMemo(() => {
    if (!isValid) return [];
    return GAMES.filter((g): g is GamePlugin => g != null && g.category === category)
      .slice()
      .sort((a, b) => compareTitles(a.title, b.title));
  }, [category, isValid]);

  // Map game id -> family id.
  const gameToFamily = useMemo(() => {
    const allIds = catGames.map((g) => g.id);
    const map = new Map<string, string>();
    for (const fam of FAMILIES) {
      const set = expandFamily(fam, allIds);
      for (const id of set) {
        if (!map.has(id)) map.set(id, fam.id);
      }
    }
    return map;
  }, [catGames]);

  // Family tiles whose dominant category is this one.
  const familyTiles = useMemo<FamilyTile[]>(() => {
    if (!isValid) return [];
    const byId = new Map(catGames.map((g) => [g.id, g] as const));
    const tiles: FamilyTile[] = [];
    for (const fam of FAMILIES) {
      const memberIds = expandFamily(fam, catGames.map((g) => g.id));
      const members: GamePlugin[] = [];
      for (const id of memberIds) {
        const g = byId.get(id);
        if (g) members.push(g);
      }
      if (members.length === 0) continue;
      members.sort((a, b) => compareTitles(a.title, b.title));
      tiles.push({ family: fam, members });
    }
    tiles.sort((a, b) => b.members.length - a.members.length || compareTitles(a.family.label, b.family.label));
    return tiles;
  }, [catGames, isValid]);

  // Featured strip — top FEATURED_LIMIT most-played, fall back to
  // registry order when no plays exist (or pad-out a partial list).
  const featured = useMemo(() => {
    const scored = catGames
      .map((g) => ({ g, n: playCounts[g.id] ?? 0 }))
      .sort((a, b) => b.n - a.n || compareTitles(a.g.title, b.g.title));
    const withPlays = scored.filter((x) => x.n > 0).map((x) => x.g);
    if (withPlays.length >= FEATURED_LIMIT) return withPlays.slice(0, FEATURED_LIMIT);
    // Pad: keep the played ones, then fill from registry order excluding dupes.
    const seen = new Set(withPlays.map((g) => g.id));
    const padded: GamePlugin[] = [...withPlays];
    for (const g of catGames) {
      if (padded.length >= FEATURED_LIMIT) break;
      if (seen.has(g.id)) continue;
      padded.push(g);
      seen.add(g.id);
    }
    return padded;
  }, [catGames, playCounts]);

  // Filtered + sorted games for the main grid.
  const filtered = useMemo(() => {
    if (filter === "all") return catGames;
    if (filter === "quick") return catGames.filter((g) => QUICK_GAME_IDS.has(g.id));
    if (filter === "challenging") return catGames.filter((g) => CHALLENGING_GAME_IDS.has(g.id));
    return catGames.filter((g) => (ratings[g.id] ?? 0) >= TOP_RATED_THRESHOLD);
  }, [catGames, filter, ratings]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  // Counts per filter chip — displayed inside the pill.
  const filterCounts = useMemo(() => {
    let quick = 0, challenging = 0, topRated = 0;
    for (const g of catGames) {
      if (QUICK_GAME_IDS.has(g.id)) quick++;
      if (CHALLENGING_GAME_IDS.has(g.id)) challenging++;
      if ((ratings[g.id] ?? 0) >= TOP_RATED_THRESHOLD) topRated++;
    }
    return { all: catGames.length, quick, challenging, topRated };
  }, [catGames, ratings]);

  if (!isValid) {
    return (
      <div className="lobby-page" data-testid="cat-unknown">
        <PageHead title="Category not found — Cards and Such" />
        <nav className="cat-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Lobby</Link>
          <span className="cat-breadcrumb-sep" aria-hidden="true">›</span>
          <span aria-current="page">Unknown</span>
        </nav>
        <div className="lobby-no-results">
          <p>No games found in this category.</p>
          <Link to="/" className="btn btn-ghost">Back to lobby</Link>
        </div>
      </div>
    );
  }

  const tag = CATEGORY_TAG[category];
  const label = CATEGORY_LABELS[category];
  const glyph = CATEGORY_GLYPHS[category];
  const blurb = CATEGORY_BLURB[category];

  return (
    <div className="lobby-page" data-testid={`category-page-${category}`}>
      <PageHead
        title={`${label} games — Cards and Such`}
        description={`Browse every ${label.toLowerCase()} game in the Cards and Such catalog. ${blurb}`}
      />

      <nav className="cat-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" data-testid="cat-crumb-lobby">Lobby</Link>
        <span className="cat-breadcrumb-sep" aria-hidden="true">›</span>
        <span aria-current="page">{label}</span>
      </nav>

      <header className="lobby-hero cat-hero" data-testid="cat-header">
        <div className="lobby-hero-eyebrow">
          <span className="lobby-hero-pulse" aria-hidden="true" />
          <span>Category · {label}</span>
        </div>
        <h1 className="cat-hero-title">
          <span className={`cat-hero-glyph cat-hero-glyph--${tag}`} aria-hidden="true">{glyph}</span>
          <span className="lobby-hero-title">{label}</span>
          <span className="cat-count-badge" data-testid="cat-count-badge">
            {catGames.length.toLocaleString()} game{catGames.length === 1 ? "" : "s"}
          </span>
        </h1>
        <p className="lobby-sub cat-sub">{blurb}</p>
      </header>

      {featured.length > 0 && (
        <section className="lobby-featured cat-featured" aria-label={`Featured ${label} games`}>
          <h2>
            <span className="lobby-featured-spark" aria-hidden="true">✦</span>
            Featured {label}
          </h2>
          <div className="lobby-grid lobby-grid--featured" data-testid="cat-featured-grid">
            {featured.map((g) => (
              <Link
                key={`feat-${g.id}`}
                to={`/play/${g.id}`}
                className={`tile tile--cat-${CATEGORY_TAG[g.category]} tile--featured`}
                data-testid={`cat-featured-${g.id}`}
              >
                <span className="tile-stripe" aria-hidden="true" />
                <span className="tile-sheen" aria-hidden="true" />
                <div className="tile-meta">
                  <span className={`tile-cat tile-cat-${CATEGORY_TAG[g.category]}`}>
                    <span className="tile-cat-glyph" aria-hidden="true">{CATEGORY_GLYPHS[g.category]}</span>
                    {CATEGORY_LABELS[g.category]}
                  </span>
                  {(playCounts[g.id] ?? 0) > 0 && (
                    <span className="cat-played-badge" aria-label={`Played ${playCounts[g.id]} times`}>
                      ▶ {playCounts[g.id]?.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="tile-title">{g.title}</div>
                <div className="tile-desc">{g.description}</div>
                <div className="tile-foot">
                  <span className="tile-players">{playersLine(g.players)}</span>
                  <span className="tile-cta" aria-hidden="true">Play</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {familyTiles.length > 0 && (
        <section className="cat-family-section" aria-label={`${label} families`}>
          <div className="lobby-section-head">
            <h2>
              {label} families
              <span className="lobby-section-count">
                {" · "}
                {familyTiles.length.toLocaleString()} group{familyTiles.length === 1 ? "" : "s"}
              </span>
            </h2>
          </div>
          <div className="lobby-grid">
            {familyTiles.map(({ family, members }) => (
              <Link
                key={`fam-${family.id}`}
                to={`/?family=${family.id}`}
                className={`tile tile--cat-${tag} tile--family`}
                data-testid={`cat-family-${family.id}`}
                aria-label={`${family.label} family — ${members.length} variants`}
              >
                <span className="tile-stripe" aria-hidden="true" />
                <span className="tile-sheen" aria-hidden="true" />
                <div className="tile-meta">
                  <span className={`tile-cat tile-cat-${tag}`}>
                    <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
                    {label}
                  </span>
                  <span className="tile-family-badge">
                    <span className="tile-family-stack" aria-hidden="true">≡</span>
                    {members.length} variant{members.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="tile-title">{family.label}</div>
                <div className="tile-desc">{family.description}</div>
                <div className="tile-foot">
                  <span className="tile-players">Multiple variants</span>
                  <span className="tile-cta" aria-hidden="true">Pick</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="lobby-controls">
        <div
          className="lobby-chips"
          role="tablist"
          aria-label="Filter games"
          data-testid="cat-filter-chips"
        >
          {([
            ["all", "All", filterCounts.all, undefined],
            ["quick", "Quick", filterCounts.quick, "⚡"],
            ["challenging", "Challenging", filterCounts.challenging, "♛"],
            ["top-rated", "Top rated", filterCounts.topRated, "★"],
          ] as const).map(([key, lab, n, gly]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={`lobby-chip${filter === key ? " is-active" : ""}`}
              onClick={() => setFilter(key)}
              data-testid={`cat-filter-${key}`}
            >
              {gly && <span className="lobby-chip-glyph" aria-hidden="true">{gly}</span>}
              <span>{lab}</span>
              <span className="lobby-chip-count">{n.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      <section aria-label={`All ${label} games`}>
        <div className="lobby-section-head">
          <h2>
            All {label}
            <span className="lobby-section-count">
              {" · "}
              {filtered.length.toLocaleString()} game{filtered.length === 1 ? "" : "s"}
              {totalPages > 1 && ` · page ${safePage} of ${totalPages}`}
            </span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="lobby-no-results" data-testid="cat-no-results">
            <p>No games found in this category.</p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setFilter("all")}
            >
              {t("lobby.clear_filters")}
            </button>
          </div>
        ) : (
          <>
            <div className="lobby-grid" data-testid="cat-grid">
              {visible.map((g) => {
                const userRating = ratings[g.id] ?? 0;
                return (
                  <Link
                    key={`cat-${g.id}`}
                    to={`/play/${g.id}`}
                    className={`tile tile--cat-${tag}`}
                    data-testid={`cat-game-${g.id}`}
                  >
                    <span className="tile-stripe" aria-hidden="true" />
                    <span className="tile-sheen" aria-hidden="true" />
                    <div className="tile-meta">
                      <span className={`tile-cat tile-cat-${tag}`}>
                        <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
                        {label}
                      </span>
                      {g.players.multiplayer && (
                        <span className="tile-mp-badge">
                          <span className="tile-mp-dot" aria-hidden="true" />
                          online
                        </span>
                      )}
                    </div>
                    <div className="tile-title">{g.title}</div>
                    <div className="tile-desc">{g.description}</div>
                    <div className="tile-foot">
                      <span className="tile-players">{playersLine(g.players)}</span>
                      {userRating > 0 && (
                        <span
                          className="tile-rating"
                          aria-label={`Your rating: ${userRating} of 5 stars`}
                        >
                          <StarRating value={userRating} readOnly size="sm" ariaLabel="Your rating" />
                        </span>
                      )}
                      <span className="tile-cta" aria-hidden="true">Play</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <nav
                className="cat-pagination"
                role="navigation"
                aria-label="Game list pages"
                data-testid="cat-pagination"
              >
                <button
                  type="button"
                  className="cat-page-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  data-testid="cat-page-prev"
                  aria-label="Previous page"
                >‹ Prev</button>
                <ol className="cat-page-list">
                  {pageNumbers(safePage, totalPages).map((n, i) => (
                    <li key={`pg-${i}-${n}`}>
                      {n === "…" ? (
                        <span className="cat-page-gap" aria-hidden="true">…</span>
                      ) : (
                        <button
                          type="button"
                          className={`cat-page-btn${n === safePage ? " is-active" : ""}`}
                          onClick={() => setPage(n)}
                          aria-current={n === safePage ? "page" : undefined}
                          data-testid={`cat-page-${n}`}
                        >{n}</button>
                      )}
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  className="cat-page-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  data-testid="cat-page-next"
                  aria-label="Next page"
                >Next ›</button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}

/**
 * Compact pagination shape: always show first + last, the current page,
 * one neighbour either side, and ellipses for the gaps. Returns a
 * mixed list of page numbers and "…" sentinels — caller renders accordingly.
 */
function pageNumbers(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: Array<number | "…"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

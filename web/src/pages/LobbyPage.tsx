import { useDeferredValue, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GAMES } from "../games/registry.js";
import { FAMILIES, compareTitles, expandFamily, type GameFamily } from "../games/families.js";
import type { GameCategory, GamePlugin } from "../platform/game-plugin/types.js";
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

/**
 * A lobby entry is either a single un-grouped game or a family of
 * games. Both render as a tile in the same grid; family tiles open a
 * picker on click instead of navigating directly.
 */
type FamilyEntry = {
  kind: "family";
  family: GameFamily;
  /** All resolved members from the registry (already filtered to known ids). */
  members: GamePlugin[];
  /** Sort key — the family label, lower-cased. */
  sortKey: string;
  category: GameCategory;
};
type GameEntry = {
  kind: "game";
  game: GamePlugin;
  sortKey: string;
  category: GameCategory;
};
type LobbyEntry = FamilyEntry | GameEntry;

export default function LobbyPage(): JSX.Element {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [openFamilyId, setOpenFamilyId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Per-category counts (computed once over the full registry — these
  // count individual GAMES, not families: the chip count tells the user
  // how many *games* live in each category, even if visually they're
  // collapsed into family tiles.)
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
    return FEATURED_IDS.map((id) => byId.get(id)).filter((g): g is GamePlugin => Boolean(g));
  }, []);

  /**
   * Compute the canonical lobby list ONCE per registry: every game gets
   * either folded into a family or appears as a standalone entry.
   * Sorting happens later — this just decides who-belongs-where.
   *
   * `gameIdToFamilyId` is also exposed so the search logic can detect
   * "this game's title matches the query — surface its family tile."
   */
  const { entries: allEntries, gameIdToFamilyId, familyById } = useMemo(() => {
    const allIds = GAMES.map((g) => g.id);
    const gameById = new Map(GAMES.map((g) => [g.id, g] as const));

    // Precompute member sets for each family + a flat lookup table.
    const familyMembers = new Map<string, Set<string>>();
    const idToFamily = new Map<string, string>();
    const familyMap = new Map<string, GameFamily>();
    for (const fam of FAMILIES) {
      const set = expandFamily(fam, allIds);
      familyMembers.set(fam.id, set);
      familyMap.set(fam.id, fam);
      for (const id of set) {
        // First-match-wins: don't overwrite an earlier family assignment.
        if (!idToFamily.has(id)) idToFamily.set(id, fam.id);
      }
    }

    const entries: LobbyEntry[] = [];

    // Family entries — one per family that has at least one resolved member.
    for (const fam of FAMILIES) {
      const ids = familyMembers.get(fam.id);
      if (!ids || ids.size === 0) continue;
      const members: GamePlugin[] = [];
      for (const id of ids) {
        const g = gameById.get(id);
        if (g) members.push(g);
      }
      if (members.length === 0) continue;
      // A family inherits its category from its first member (alphabetised
      // first by title — this keeps category filtering deterministic).
      members.sort((a, b) => compareTitles(a.title, b.title));
      const category = members[0]!.category;
      entries.push({
        kind: "family",
        family: fam,
        members,
        sortKey: fam.label.toLowerCase(),
        category,
      });
    }

    // Standalone entries — games not absorbed by any family.
    for (const g of GAMES) {
      if (idToFamily.has(g.id)) continue;
      entries.push({
        kind: "game",
        game: g,
        sortKey: g.title.toLowerCase(),
        category: g.category,
      });
    }

    // Final alphabetical sort across families + standalone games.
    entries.sort((a, b) => compareTitles(a.sortKey, b.sortKey));

    return { entries, gameIdToFamilyId: idToFamily, familyById: familyMap };
  }, []);

  // Filtered + searched list. We filter the `entries` (family-level)
  // rather than raw GAMES so a family stays as one tile.
  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    let list = filter === "all" ? allEntries : allEntries.filter((e) => e.category === filter);
    if (!q) return list;
    list = list.filter((e) => {
      if (e.kind === "game") {
        const g = e.game;
        return (
          g.title.toLowerCase().includes(q)
          || g.category.toLowerCase().includes(q)
          || g.description.toLowerCase().includes(q)
        );
      }
      // Family matches if its label / description matches OR if any
      // member's title / description matches — that way searching for
      // "Vegas" still surfaces the Klondike family that contains it.
      const fam = e.family;
      if (
        fam.label.toLowerCase().includes(q)
        || fam.description.toLowerCase().includes(q)
      ) return true;
      return e.members.some((m) =>
        m.title.toLowerCase().includes(q)
        || m.description.toLowerCase().includes(q),
      );
    });
    return list;
  }, [allEntries, filter, deferredQuery]);

  // Reset window + close any open picker when filter or query changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setOpenFamilyId(null);
  }, [filter, deferredQuery]);

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

  // Close the picker on Escape — keyboard accessibility.
  useEffect(() => {
    if (!openFamilyId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenFamilyId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openFamilyId]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  // "Surprise me" — jump to a random game in the current filtered set.
  // Uses raw GAMES (filtered by category) so a random pick can land on
  // any variant, not just family heads.
  const surpriseMe = useCallback(() => {
    const pool = filter === "all" ? GAMES : GAMES.filter((g) => g.category === filter);
    const final = pool.length > 0 ? pool : GAMES;
    if (final.length === 0) return;
    const pick = final[Math.floor(Math.random() * final.length)]!;
    navigate(`/play/${pick.id}`);
  }, [filter, navigate]);

  // Family ids that already appear in the featured strip — when a
  // family is featured, its main-grid tile uses a different testid
  // (`grid-tile-<id>`) so the canonical `tile-<id>` is unambiguously
  // bound to the featured tile (which is what existing tests target).
  const featuredFamilyIds = useMemo(() => {
    const set = new Set<string>();
    for (const g of featured) {
      const famId = gameIdToFamilyId.get(g.id);
      if (famId) set.add(famId);
    }
    return set;
  }, [featured, gameIdToFamilyId]);

  // The currently-open family (memoised pull-from-map for the modal).
  const openFamily = useMemo(() => {
    if (!openFamilyId) return null;
    const entry = filtered.find(
      (e): e is FamilyEntry => e.kind === "family" && e.family.id === openFamilyId,
    );
    if (entry) return entry;
    // Fall back to the global list — keeps the modal usable even if
    // search filters the family out from under us.
    const fam = familyById.get(openFamilyId);
    if (!fam) return null;
    const fallback = allEntries.find(
      (e): e is FamilyEntry => e.kind === "family" && e.family.id === openFamilyId,
    );
    return fallback ?? null;
  }, [openFamilyId, filtered, familyById, allEntries]);

  // Match-count caption for the section header — shows total games
  // covered (so "12 matches" makes sense even if some are hidden behind
  // a family tile).
  const matchedGameCount = useMemo(() => {
    let n = 0;
    for (const e of filtered) {
      n += e.kind === "game" ? 1 : e.members.length;
    }
    return n;
  }, [filtered]);

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
            {featured.map((g) => (
              <FeaturedTile
                key={`feat-${g.id}`}
                game={g}
                familyId={gameIdToFamilyId.get(g.id)}
                onOpenFamily={(famId) => setOpenFamilyId(famId)}
              />
            ))}
          </div>
        </section>
      )}

      <section aria-label="All games">
        <div className="lobby-section-head">
          <h2>
            {filter === "all" ? "All games" : CATEGORY_LABELS[filter]}
            {query && (
              <span className="lobby-section-count">
                {" · "}
                {filtered.length.toLocaleString()} match{filtered.length === 1 ? "" : "es"}
                {matchedGameCount !== filtered.length && ` (${matchedGameCount.toLocaleString()} games)`}
              </span>
            )}
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
              {visible.map((entry) =>
                entry.kind === "game" ? (
                  <GameCard key={`game-${entry.game.id}`} game={entry.game} />
                ) : (
                  <FamilyCard
                    key={`fam-${entry.family.id}`}
                    family={entry.family}
                    category={entry.category}
                    memberCount={entry.members.length}
                    onClick={() => setOpenFamilyId(entry.family.id)}
                    /* Featured families already carry the canonical
                       `tile-<id>` testid; demote duplicates to a grid-
                       prefixed id so DOM querying stays unambiguous. */
                    testIdOverride={
                      featuredFamilyIds.has(entry.family.id)
                        ? `grid-tile-${entry.family.id}`
                        : undefined
                    }
                  />
                ),
              )}
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

      {openFamily && (
        <FamilyPicker
          family={openFamily.family}
          members={openFamily.members}
          onClose={() => setOpenFamilyId(null)}
        />
      )}
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

function GameCard({ game: g }: { game: GamePlugin }): JSX.Element {
  return (
    <Link
      to={`/play/${g.id}`}
      className={`tile tile--cat-${g.category}`}
      data-testid={`tile-${g.id}`}
    >
      <span className="tile-stripe" aria-hidden="true" />
      <span className="tile-sheen" aria-hidden="true" />
      <div className="tile-meta">
        <span className={`tile-cat tile-cat-${g.category}`}>
          <span className="tile-cat-glyph" aria-hidden="true">{CATEGORY_GLYPHS[g.category]}</span>
          {CATEGORY_LABELS[g.category]}
        </span>
        {g.players.multiplayer && (
          <span className="tile-mp-badge" data-testid={`mp-badge-${g.id}`}>
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

/**
 * Family-card variant — looks like a regular tile but is a button (not
 * a link) and surfaces a "N variants" pill instead of a player range.
 * Click opens the FamilyPicker modal.
 */
function FamilyCard({
  family,
  category,
  memberCount,
  onClick,
  testIdOverride,
}: {
  family: GameFamily;
  category: GameCategory;
  memberCount: number;
  onClick: () => void;
  testIdOverride?: string;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tile tile--cat-${category} tile--family`}
      data-testid={testIdOverride ?? `tile-${family.id}`}
      aria-haspopup="dialog"
      aria-label={`${family.label} — ${memberCount} variants`}
    >
      <span className="tile-stripe" aria-hidden="true" />
      <span className="tile-sheen" aria-hidden="true" />
      <div className="tile-meta">
        <span className={`tile-cat tile-cat-${category}`}>
          <span className="tile-cat-glyph" aria-hidden="true">{CATEGORY_GLYPHS[category]}</span>
          {CATEGORY_LABELS[category]}
        </span>
        <span className="tile-family-badge" data-testid={`fam-count-${family.id}`}>
          <span className="tile-family-stack" aria-hidden="true">≡</span>
          {memberCount} variant{memberCount === 1 ? "" : "s"}
        </span>
      </div>
      <div className="tile-title">{family.label}</div>
      <div className="tile-desc">{family.description}</div>
      <div className="tile-foot">
        <span className="tile-players">Multiple variants</span>
        <span className="tile-cta" aria-hidden="true">
          Pick
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>
    </button>
  );
}

/**
 * Featured-strip tile — the strip is hand-curated by id, so a featured
 * id may either be a standalone game (render a regular GameCard with a
 * `tile--featured` class) or the *anchor* of a family (e.g. "klondike"
 * — open the picker instead of navigating). This wrapper picks the
 * right behaviour.
 */
function FeaturedTile({
  game: g,
  familyId,
  onOpenFamily,
}: {
  game: GamePlugin;
  familyId: string | undefined;
  onOpenFamily: (familyId: string) => void;
}): JSX.Element {
  if (familyId) {
    // The featured id belongs to a family — open the picker rather than
    // routing to the single variant. The canonical lobby testid is
    // `tile-<familyId>` (e.g. `tile-klondike`) — the featured tile
    // owns it, and the duplicate in the main grid is demoted to
    // `grid-tile-<familyId>` to keep DOM queries unambiguous.
    return (
      <button
        type="button"
        onClick={() => onOpenFamily(familyId)}
        className={`tile tile--cat-${g.category} tile--featured tile--family`}
        data-testid={`tile-${familyId}`}
        aria-haspopup="dialog"
      >
        <span className="tile-stripe" aria-hidden="true" />
        <span className="tile-sheen" aria-hidden="true" />
        <div className="tile-meta">
          <span className={`tile-cat tile-cat-${g.category}`}>
            <span className="tile-cat-glyph" aria-hidden="true">{CATEGORY_GLYPHS[g.category]}</span>
            {CATEGORY_LABELS[g.category]}
          </span>
        </div>
        <div className="tile-title">{g.title}</div>
        <div className="tile-desc">{g.description}</div>
        <div className="tile-foot">
          <span className="tile-players">Multiple variants</span>
          <span className="tile-cta" aria-hidden="true">Pick</span>
        </div>
      </button>
    );
  }
  return (
    <Link
      to={`/play/${g.id}`}
      className={`tile tile--cat-${g.category} tile--featured`}
      data-testid={`feat-tile-${g.id}`}
    >
      <span className="tile-stripe" aria-hidden="true" />
      <span className="tile-sheen" aria-hidden="true" />
      <div className="tile-meta">
        <span className={`tile-cat tile-cat-${g.category}`}>
          <span className="tile-cat-glyph" aria-hidden="true">{CATEGORY_GLYPHS[g.category]}</span>
          {CATEGORY_LABELS[g.category]}
        </span>
        {g.players.multiplayer && (
          <span className="tile-mp-badge" data-testid={`feat-mp-badge-${g.id}`}>
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
        <span className="tile-cta" aria-hidden="true">Play</span>
      </div>
    </Link>
  );
}

/**
 * Modal-style picker that lists every variant inside a family. Members
 * are pre-sorted alphabetically by the parent. Backdrop click + Escape
 * close the picker; arrow keys are intentionally not bound to keep the
 * implementation small — `<Link>` items get native focus handling.
 */
function FamilyPicker({
  family,
  members,
  onClose,
}: {
  family: GameFamily;
  members: GamePlugin[];
  onClose: () => void;
}): JSX.Element {
  return (
    <div
      className="lobby-picker-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${family.label} variants`}
      data-testid={`fam-picker-${family.id}`}
      onClick={onClose}
    >
      <div className="lobby-picker" onClick={(e) => e.stopPropagation()}>
        <header className="lobby-picker-head">
          <div>
            <h2 className="lobby-picker-title">{family.label}</h2>
            <p className="lobby-picker-sub">
              {members.length} variant{members.length === 1 ? "" : "s"} · {family.description}
            </p>
          </div>
          <button
            type="button"
            className="lobby-picker-close"
            onClick={onClose}
            aria-label="Close variant picker"
          >×</button>
        </header>
        <ul className="lobby-picker-list">
          {members.map((m) => (
            <li key={m.id}>
              <Link
                to={`/play/${m.id}`}
                className="lobby-picker-item"
                data-testid={`pick-${m.id}`}
                onClick={onClose}
              >
                <div className="lobby-picker-item-title">{m.title}</div>
                <div className="lobby-picker-item-desc">{m.description}</div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

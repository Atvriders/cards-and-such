import { useDeferredValue, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GAMES } from "../games/registry.js";
import { FAMILIES, compareTitles, expandFamily, type GameFamily } from "../games/families.js";
import type { GameCategory, GamePlugin } from "../platform/game-plugin/types.js";
import { PageHead } from "../platform/PageHead.js";
import { Skeleton } from "../platform/Skeleton.js";
import { StarRating, readRatings } from "../platform/StarRating.js";
import "./LobbyPage.css";

/**
 * Tooltip data shared between GameCard / FamilyCard / FeaturedTile and
 * the hover hook. Positioning is "right of tile if room, otherwise left"
 * — computed once on show, never re-flowed during the mouseover.
 */
interface TileTooltipData {
  title: string;
  description: string;
  players: string;
  multiplayer: boolean;
  howToPlay?: string;
}

/**
 * First-sentence excerpt of a howToPlay blob. Empty / undefined input
 * returns undefined so the tooltip can omit the section entirely.
 * Caps at ~180 chars to avoid pathological one-sentence walls of text.
 */
function howToPlayExcerpt(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const trimmed = text.replace(/^\s+/, "");
  if (!trimmed) return undefined;
  const match = trimmed.match(/^[^.!?\n]+[.!?]?/);
  let s = match ? match[0] : trimmed;
  if (s.length > 180) s = s.slice(0, 177).trimEnd() + "…";
  return s.trim();
}

function playersLine(p: { min: number; max: number }): string {
  return p.min === p.max
    ? `${p.min} player${p.min === 1 ? "" : "s"}`
    : `${p.min}–${p.max} players`;
}

/**
 * Hook wired into a tile element. Encapsulates:
 *   - 500ms hover-intent delay before showing.
 *   - Long-press (500ms) on touch to show; tap-elsewhere to hide.
 *   - Skip showing while the tile is being dragged or a modal is open.
 *   - Smart placement: prefer right-of-tile, fall back to left if the
 *     viewport doesn't have at least 280px clear on the right.
 *
 * Returns event-handler props that the tile spreads onto its root, and
 * a `tooltip` value (the floating element to render) — null when hidden.
 */
function useTileTooltip(data: TileTooltipData, tileId: string): {
  handlers: {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => void;
    onTouchEnd: () => void;
    onDragStart: () => void;
    onFocus: (e: React.FocusEvent<HTMLElement>) => void;
    onBlur: () => void;
    "aria-describedby"?: string;
  };
  tooltip: JSX.Element | null;
} {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; side: "right" | "left" } | null>(null);
  const showTimer = useRef<number | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const clearTimer = useCallback(() => {
    if (showTimer.current !== null) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
  }, []);

  const modalOpen = useCallback((): boolean => {
    if (typeof document === "undefined") return false;
    return document.querySelector('[role="dialog"][aria-modal="true"]') !== null;
  }, []);

  const placeNear = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const TIP_W = 280;
    const GUTTER = 12;
    const fitsRight = rect.right + GUTTER + TIP_W <= window.innerWidth;
    const side: "right" | "left" = fitsRight ? "right" : "left";
    const left = side === "right" ? rect.right + GUTTER : Math.max(GUTTER, rect.left - TIP_W - GUTTER);
    const top = Math.min(
      Math.max(GUTTER, rect.top),
      window.innerHeight - 40 - GUTTER,
    );
    setCoords({ top, left, side });
  }, []);

  const show = useCallback((el: HTMLElement) => {
    if (modalOpen()) return;
    placeNear(el);
    setVisible(true);
  }, [modalOpen, placeNear]);

  const hide = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, [clearTimer]);

  // Tap-elsewhere on touch devices closes the tooltip; any scroll hides.
  useEffect(() => {
    if (!visible) return;
    const onDocPointer = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      const t = targetRef.current;
      if (t && e.target instanceof Node && t.contains(e.target)) return;
      setVisible(false);
    };
    const onScroll = () => setVisible(false);
    document.addEventListener("pointerdown", onDocPointer, true);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onDocPointer, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [visible]);

  // Escape closes any open tooltip — feels right when a keyboard user
  // tabs onto a tile, sees the tooltip, but wants to keep focus there.
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const tooltipDomId = `tile-tooltip-${tileId}`;

  const handlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget;
      targetRef.current = el;
      clearTimer();
      showTimer.current = window.setTimeout(() => show(el), 500);
    },
    onMouseLeave: () => hide(),
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => {
      const el = e.currentTarget;
      targetRef.current = el;
      clearTimer();
      showTimer.current = window.setTimeout(() => show(el), 500);
    },
    onTouchEnd: () => clearTimer(),
    onDragStart: () => hide(),
    // Keyboard parity: tab-focus shows immediately (no 500ms hover-intent
    // delay — keyboard users have already committed to the element),
    // and blur hides like a mouseleave.
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      const el = e.currentTarget;
      targetRef.current = el;
      clearTimer();
      show(el);
    },
    onBlur: () => hide(),
    "aria-describedby": visible ? tooltipDomId : undefined,
  };

  const tooltip = visible && coords ? (
    <div
      id={tooltipDomId}
      className={`lobby-tooltip lobby-tooltip--${coords.side}`}
      role="tooltip"
      data-testid={`tile-tooltip-${tileId}`}
      style={{ top: coords.top, left: coords.left }}
    >
      <div className="lobby-tooltip-title">{data.title}</div>
      <div className="lobby-tooltip-desc">{data.description}</div>
      <div className="lobby-tooltip-meta">
        <span>{data.players}</span>
        {data.multiplayer && <span className="lobby-tooltip-mp">Multiplayer</span>}
      </div>
      {data.howToPlay && (
        <div className="lobby-tooltip-howto">
          <span className="lobby-tooltip-howto-label">How to play</span>
          <span>{data.howToPlay}</span>
        </div>
      )}
    </div>
  ) : null;

  return { handlers, tooltip };
}

type Filter = "all" | "top-rated" | GameCategory;
const TOP_RATED_THRESHOLD = 4;

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

// Short suffixes used in className modifiers — chosen to NOT collide with
// engine attribute selectors that match `[class$="-cards"]`, `[class$="-board"]`,
// etc. Pure cosmetic; semantics still come from g.category.
const CATEGORY_TAG: Record<GameCategory, string> = {
  solitaire: "s",
  cards: "c",
  dice: "d",
  board: "b",
  arcade: "a",
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
  const [ratings, setRatings] = useState<Record<string, number>>(() => readRatings());
  const deferredQuery = useDeferredValue(query);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Add a one-shot `is-mounted` class to the lobby root after the first
  // paint so entrance animations only run on the initial mount of each
  // section — subsequent re-renders (filter changes, search, infinite
  // scroll appends) reuse the same class without re-triggering them.
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    // Defer to the next frame so the initial render paints in its
    // pre-animation state, then the class flip cues the staggered
    // entrance — avoids the "already-finished" flash from CSS that
    // applies on the same frame as mount.
    const raf = requestAnimationFrame(() => {
      node.classList.add("is-mounted");
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Refresh ratings from localStorage when the tab regains focus or a
  // cross-tab "storage" event fires — keeps the lobby in sync after a
  // user submits a rating in PlayPage and navigates back.
  useEffect(() => {
    const refresh = () => setRatings(readRatings());
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === "cards-ratings") refresh();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Per-category counts (computed once over the full registry — these
  // count individual GAMES, not families: the chip count tells the user
  // how many *games* live in each category, even if visually they're
  // collapsed into family tiles.)
  const categoryCounts = useMemo(() => {
    const counts: Record<GameCategory, number> = {
      solitaire: 0, cards: 0, dice: 0, board: 0, arcade: 0,
    };
    for (const g of GAMES) {
      if (g == null) continue;
      counts[g.category]++;
    }
    return counts;
  }, []);

  // Featured strip — pluck out a few well-known titles, fall back gracefully.
  const featured = useMemo(() => {
    const byId = new Map(GAMES.filter((g) => g != null).map((g) => [g.id, g] as const));
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
    const safeGames = GAMES.filter((g): g is GamePlugin => g != null);
    const allIds = safeGames.map((g) => g.id);
    const gameById = new Map(safeGames.map((g) => [g.id, g] as const));

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
    for (const g of safeGames) {
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

  // For each lobby entry, compute the best rating among its games — a
  // family inherits the highest rating any of its variants received so
  // the Top Rated tab promotes the family if any member is top-rated.
  const entryRating = useCallback(
    (e: LobbyEntry): number => {
      if (e.kind === "game") return ratings[e.game.id] ?? 0;
      let best = 0;
      for (const m of e.members) {
        const v = ratings[m.id] ?? 0;
        if (v > best) best = v;
      }
      return best;
    },
    [ratings],
  );

  // Filtered + searched list. We filter the `entries` (family-level)
  // rather than raw GAMES so a family stays as one tile.
  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    let list: LobbyEntry[];
    if (filter === "all") list = allEntries;
    else if (filter === "top-rated") {
      list = allEntries.filter((e) => entryRating(e) >= TOP_RATED_THRESHOLD);
    } else {
      list = allEntries.filter((e) => e.category === filter);
    }
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
  }, [allEntries, filter, deferredQuery, entryRating]);

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

  // While the deferred-search recomputation is in-flight on a meaningfully
  // large query, the filtered grid would briefly stutter or flash empty.
  // Detect "useDeferredValue is still trailing the live input" and surface
  // a skeleton grid in that window so the UI feels responsive.
  const filterPending = query !== deferredQuery && query.trim().length >= 3;

  // "Surprise me" — jump to a random game in the current filtered set.
  // Uses raw GAMES (filtered by category) so a random pick can land on
  // any variant, not just family heads.
  const surpriseMe = useCallback(() => {
    let pool: GamePlugin[];
    const allGames = GAMES.filter((g): g is GamePlugin => g != null);
    if (filter === "all") pool = allGames;
    else if (filter === "top-rated") {
      pool = allGames.filter((g) => (ratings[g.id] ?? 0) >= TOP_RATED_THRESHOLD);
    } else {
      pool = allGames.filter((g) => g.category === filter);
    }
    const final = pool.length > 0 ? pool : allGames;
    if (final.length === 0) return;
    const pick = final[Math.floor(Math.random() * final.length)]!;
    navigate(`/play/${pick.id}`);
  }, [filter, navigate, ratings]);

  // Count of distinct top-rated games (>= 4 stars) — drives the chip count.
  const topRatedCount = useMemo(() => {
    let n = 0;
    for (const g of GAMES) {
      if (g == null) continue;
      if ((ratings[g.id] ?? 0) >= TOP_RATED_THRESHOLD) n++;
    }
    return n;
  }, [ratings]);

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
        <PageHead title="Cards and Such" exact />
        <h1>Cards and Such</h1>
        <p>No games installed yet.</p>
      </div>
    );
  }

  return (
    <div className="lobby-page" ref={rootRef}>
      <PageHead
        title="Cards and Such — 4500+ classic and modern games"
        exact
        description="Browse 4,500+ free solitaire, card, dice, board, and arcade games. Play Klondike, FreeCell, Spider, Hearts, Spades, Yahtzee, Chess, and more — instantly in your browser."
        canonical="https://cards.waterburp.com/"
      />
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
          <Chip
            active={filter === "top-rated"}
            onClick={() => setFilter("top-rated")}
            count={topRatedCount}
            testId="chip-top-rated"
            glyph="★"
          >Top Rated</Chip>
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
            {filter === "all"
              ? "All games"
              : filter === "top-rated"
                ? "Top Rated"
                : CATEGORY_LABELS[filter]}
            {query && (
              <span className="lobby-section-count">
                {" · "}
                {filtered.length.toLocaleString()} match{filtered.length === 1 ? "" : "es"}
                {matchedGameCount !== filtered.length && ` (${matchedGameCount.toLocaleString()} games)`}
              </span>
            )}
          </h2>
        </div>

        {filterPending ? (
          <div className="lobby-grid" data-testid="lobby-skeleton-grid" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonTile key={`sk-${i}`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="lobby-no-results" data-testid="lobby-no-results">
            {filter === "top-rated" && !query ? (
              <p data-testid="lobby-top-rated-empty">
                You haven't rated any games {TOP_RATED_THRESHOLD} stars or higher yet. Play a game and tap the stars at the end to fill this list.
              </p>
            ) : (
              <p>No games match <strong>{query}</strong>.</p>
            )}
            <button type="button" className="btn btn-ghost" onClick={() => { setQuery(""); setFilter("all"); }}>Clear filters</button>
          </div>
        ) : (
          <>
            <div className="lobby-grid">
              {visible.map((entry) =>
                entry.kind === "game" ? (
                  <GameCard
                    key={`game-${entry.game.id}`}
                    game={entry.game}
                    userRating={ratings[entry.game.id] ?? 0}
                  />
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
                    userRating={entryRating(entry)}
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

      {openFamily && (
        <FamilyPicker
          family={openFamily.family}
          members={openFamily.members}
          ratings={ratings}
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

function GameCard({ game: g, userRating = 0 }: { game: GamePlugin; userRating?: number }): JSX.Element {
  const { handlers, tooltip } = useTileTooltip(
    {
      title: g.title,
      description: g.description,
      players: playersLine(g.players),
      multiplayer: g.players.multiplayer,
      howToPlay: howToPlayExcerpt(g.howToPlay),
    },
    g.id,
  );
  return (
    <>
    <Link
      to={`/play/${g.id}`}
      className={`tile tile--cat-${CATEGORY_TAG[g.category]}`}
      data-testid={`tile-${g.id}`}
      {...handlers}
    >
      <span className="tile-stripe" aria-hidden="true" />
      <span className="tile-sheen" aria-hidden="true" />
      <div className="tile-meta">
        <span className={`tile-cat tile-cat-${CATEGORY_TAG[g.category]}`}>
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
        {userRating > 0 && (
          <span
            className="tile-rating"
            data-testid={`tile-rating-${g.id}`}
            aria-label={`Your rating: ${userRating} of 5 stars`}
          >
            <StarRating value={userRating} readOnly size="sm" ariaLabel="Your rating" />
          </span>
        )}
        <span className="tile-cta" aria-hidden="true">
          Play
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </span>
      </div>
    </Link>
    {tooltip}
    </>
  );
}

/**
 * A single placeholder tile shown while the deferred lobby-filter is still
 * recomputing on a large search query. Mirrors the rough silhouette of a
 * real GameCard (header chip, title line, two desc lines, footer) so the
 * grid layout doesn't jump when the real tiles arrive.
 */
function SkeletonTile(): JSX.Element {
  return (
    <div className="tile tile--skeleton" aria-hidden="true" data-testid="lobby-skeleton-tile">
      <div className="tile-meta">
        <Skeleton variant="rect" width={72} height={20} />
      </div>
      <div className="tile-title"><Skeleton variant="text-line" width="70%" /></div>
      <div className="tile-desc">
        <Skeleton variant="text-line" width="100%" />
        <Skeleton variant="text-line" width="55%" />
      </div>
      <div className="tile-foot">
        <Skeleton variant="text-line" width={80} />
        <Skeleton variant="text-line" width={42} />
      </div>
    </div>
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
  userRating = 0,
}: {
  family: GameFamily;
  category: GameCategory;
  memberCount: number;
  onClick: () => void;
  testIdOverride?: string;
  userRating?: number;
}): JSX.Element {
  // Family tiles surface the family-level description in lieu of a per-
  // game howToPlay (the variants each have their own; the family card
  // doesn't pick a winner).
  const { handlers, tooltip } = useTileTooltip(
    {
      title: family.label,
      description: family.description,
      players: `${memberCount} variant${memberCount === 1 ? "" : "s"}`,
      multiplayer: false,
      howToPlay: undefined,
    },
    family.id,
  );
  return (
    <>
    <button
      type="button"
      onClick={onClick}
      className={`tile tile--cat-${CATEGORY_TAG[category]} tile--family`}
      data-testid={testIdOverride ?? `tile-${family.id}`}
      aria-haspopup="dialog"
      aria-label={`${family.label} — ${memberCount} variants`}
      {...handlers}
    >
      <span className="tile-stripe" aria-hidden="true" />
      <span className="tile-sheen" aria-hidden="true" />
      <div className="tile-meta">
        <span className={`tile-cat tile-cat-${CATEGORY_TAG[category]}`}>
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
        {userRating > 0 && (
          <span
            className="tile-rating"
            data-testid={`tile-rating-${family.id}`}
            aria-label={`Best variant rating: ${userRating} of 5 stars`}
          >
            <StarRating value={userRating} readOnly size="sm" ariaLabel="Best variant rating" />
          </span>
        )}
        <span className="tile-cta" aria-hidden="true">
          Pick
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>
    </button>
    {tooltip}
    </>
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
  // Featured tiles get the same hover-tooltip treatment regardless of
  // whether they end up rendering as a link or a button.
  const tooltipData: TileTooltipData = familyId
    ? {
        title: g.title,
        description: g.description,
        players: "Multiple variants",
        multiplayer: false,
        howToPlay: howToPlayExcerpt(g.howToPlay),
      }
    : {
        title: g.title,
        description: g.description,
        players: playersLine(g.players),
        multiplayer: g.players.multiplayer,
        howToPlay: howToPlayExcerpt(g.howToPlay),
      };
  const tooltipId = familyId ? familyId : `feat-${g.id}`;
  const { handlers, tooltip } = useTileTooltip(tooltipData, tooltipId);

  if (familyId) {
    return (
      <>
      <button
        type="button"
        onClick={() => onOpenFamily(familyId)}
        className={`tile tile--cat-${CATEGORY_TAG[g.category]} tile--featured tile--family`}
        data-testid={`tile-${familyId}`}
        aria-haspopup="dialog"
        {...handlers}
      >
        <span className="tile-stripe" aria-hidden="true" />
        <span className="tile-sheen" aria-hidden="true" />
        <div className="tile-meta">
          <span className={`tile-cat tile-cat-${CATEGORY_TAG[g.category]}`}>
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
      {tooltip}
      </>
    );
  }
  return (
    <>
    <Link
      to={`/play/${g.id}`}
      className={`tile tile--cat-${CATEGORY_TAG[g.category]} tile--featured`}
      data-testid={`feat-tile-${g.id}`}
      {...handlers}
    >
      <span className="tile-stripe" aria-hidden="true" />
      <span className="tile-sheen" aria-hidden="true" />
      <div className="tile-meta">
        <span className={`tile-cat tile-cat-${CATEGORY_TAG[g.category]}`}>
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
    {tooltip}
    </>
  );
}

/**
 * Sort modes for the family picker. Persisted in component state only —
 * we don't bother caching per-family in localStorage since sessions
 * tend to be short and the default ("alpha") is the safest baseline.
 */
type PickerSort = "alpha" | "score" | "recent";

/**
 * Read the (optional) per-game last-play timestamp map from localStorage.
 * The map isn't currently written by the play flow, so absent keys are
 * treated as "never played" (timestamp 0) and the "recent" sort
 * gracefully degrades to insertion order via a stable fallback.
 */
function readLastPlayed(): Record<string, number> {
  try {
    const raw = localStorage.getItem("cards-last-played");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") return parsed as Record<string, number>;
  } catch {
    /* Non-JSON or storage unavailable — fall through to empty. */
  }
  return {};
}

/**
 * Modal-style picker that lists every variant inside a family. Members
 * arrive alphabetically pre-sorted by the parent; this component layers
 * a live search filter and a 3-way sort selector on top. Backdrop click
 * + Escape close the picker; the search input never auto-focuses on
 * mobile (would summon the keyboard) but does on desktop where space is
 * cheap.
 */
function FamilyPicker({
  family,
  members,
  ratings,
  onClose,
}: {
  family: GameFamily;
  members: GamePlugin[];
  ratings: Record<string, number>;
  onClose: () => void;
}): JSX.Element {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<PickerSort>("alpha");
  const lastPlayed = useMemo(() => readLastPlayed(), []);

  // Filter + sort the variant list. Members come in alphabetical order
  // already; the "alpha" branch is a no-op clone, the others sort a
  // copy with stable tie-breaking on title to avoid jitter when scores
  // or play timestamps are tied (or all zero).
  const view = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? members.filter((m) => m.title.toLowerCase().includes(q))
      : members.slice();
    if (sort === "alpha") return filtered;
    if (sort === "score") {
      return filtered.sort((a, b) => {
        const ra = ratings[a.id] ?? 0;
        const rb = ratings[b.id] ?? 0;
        if (rb !== ra) return rb - ra;
        return compareTitles(a.title, b.title);
      });
    }
    // "recent" — newest play first, never-played fall to the bottom in
    // alphabetical order so the row stays predictable.
    return filtered.sort((a, b) => {
      const ta = lastPlayed[a.id] ?? 0;
      const tb = lastPlayed[b.id] ?? 0;
      if (tb !== ta) return tb - ta;
      return compareTitles(a.title, b.title);
    });
  }, [members, query, sort, ratings, lastPlayed]);

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
          <div className="lobby-picker-head-row">
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
          </div>
          <div className="lobby-picker-search">
            <span className="lobby-picker-search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              className="lobby-picker-search-input"
              placeholder={`Search ${family.label} variants…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={`Search ${family.label} variants`}
              data-testid={`fam-picker-search-${family.id}`}
            />
            {query && (
              <button
                type="button"
                className="lobby-picker-search-clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >×</button>
            )}
          </div>
          <div className="lobby-picker-sort" role="group" aria-label="Sort variants">
            <span className="lobby-picker-sort-label">Sort</span>
            {([
              ["alpha", "A–Z"],
              ["score", "By score"],
              ["recent", "Recent"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`lobby-picker-sort-btn${sort === key ? " is-active" : ""}`}
                aria-pressed={sort === key}
                onClick={() => setSort(key)}
                data-testid={`fam-picker-sort-${key}`}
              >{label}</button>
            ))}
            <span className="lobby-picker-count" aria-live="polite">
              {view.length} of {members.length}
            </span>
          </div>
        </header>
        {view.length === 0 ? (
          <div className="lobby-picker-empty">
            No variants match “{query}”.
          </div>
        ) : (
          <ul className="lobby-picker-list">
            {view.map((m) => (
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
        )}
      </div>
    </div>
  );
}

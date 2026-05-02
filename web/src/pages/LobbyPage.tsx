import { useDeferredValue, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GAMES } from "../games/registry.js";
import { FAMILIES, compareTitles, expandFamily, type GameFamily } from "../games/families.js";
import { getEta, getDifficulty, difficultyDots } from "../games/etaTable.js";
import type { GameCategory, GamePlugin } from "../platform/game-plugin/types.js";
import { PageHead } from "../platform/PageHead.js";
import { Skeleton } from "../platform/Skeleton.js";
import { StarRating, readRatings } from "../platform/StarRating.js";
import { useFocusTrap } from "../platform/useFocusTrap.js";
import { t } from "../platform/i18n.js";
import { Badge, type BadgeKind } from "../platform/Badge.js";
import {
  CHALLENGING_GAME_IDS,
  QUICK_GAME_IDS,
  pickBadgeKind,
} from "../platform/gameTags.js";
import { readFavorites, toggleFavorite as toggleFavoritePersist, getLastPlayed } from "../platform/userdata.js";
import { highlightMatch } from "../platform/highlight.js";
import {
  getCoachmarkState,
  setCoachmarkDone,
} from "../platform/tutorials.js";
import { loadStats } from "../platform/stats.js";
import { getRecommendations } from "../games/recommend.js";
import { track } from "../platform/analytics.js";
import { useToast } from "../platform/ui/Toast.js";
import { LobbyTileMenu } from "./LobbyTileMenu.js";
import "./LobbyPage.css";

/**
 * Minimum query length that triggers `<mark>` highlighting on tile
 * titles. Single-character queries match too aggressively (every "a"
 * lights up) so we wait for at least two chars before annotating.
 */
const TITLE_HIGHLIGHT_MIN_LEN = 2;

/** localStorage key persisting the active lobby filter chip across reloads. */
const FILTER_STORAGE_KEY = "cards-lobby-filter";
/** localStorage key persisting the lobby list pagination mode. */
const LIST_MODE_STORAGE_KEY = "cards-lobby-list-mode";
/** localStorage key persisting the desktop left-drawer collapsed state. */
const DRAWER_COLLAPSED_KEY = "cards-lobby-drawer-collapsed";

/**
 * Two ways to walk the long lobby list:
 *  - "pagination" (default): explicit Prev/Next over fixed PAGE_SIZE pages.
 *  - "infinite":   IntersectionObserver-driven progressive append.
 */
type ListMode = "pagination" | "infinite";

function readPersistedListMode(): ListMode {
  try {
    if (typeof localStorage === "undefined") return "pagination";
    const raw = localStorage.getItem(LIST_MODE_STORAGE_KEY);
    if (raw === "pagination" || raw === "infinite") return raw;
  } catch { /* ignore */ }
  return "pagination";
}

function writePersistedListMode(mode: ListMode): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(LIST_MODE_STORAGE_KEY, mode);
  } catch { /* ignore */ }
}

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
  howToPlay?: string | undefined;
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
 * Tile-tooltip handler shape. The same set of props is spread onto the
 * tile root regardless of whether the tooltip engine has hydrated yet —
 * pre-hydration the methods are stubs that flip activation, so the very
 * first hover/touch/focus seamlessly hands off to the heavy engine.
 */
type TileTooltipHandlers = {
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent<HTMLElement>) => void;
  onTouchEnd: () => void;
  onDragStart: () => void;
  onFocus: (e: React.FocusEvent<HTMLElement>) => void;
  onBlur: () => void;
  "aria-describedby"?: string | undefined;
};

/**
 * Imperative API the engine publishes back to the outer hook so the
 * tile's spread-handlers (which were created before activation) can
 * route subsequent events into the engine's stateful machinery.
 */
type TileTooltipEngineApi = {
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent<HTMLElement>) => void;
  onTouchEnd: () => void;
  onDragStart: () => void;
  onFocus: (e: React.FocusEvent<HTMLElement>) => void;
  onBlur: () => void;
};

/**
 * Reason for the very first activation — the engine reads this on mount
 * to mimic the original behaviour for the activating event:
 *  - "hover" / "touch": schedule the 500ms hover-intent timer.
 *  - "focus": show immediately (keyboard parity, no delay).
 */
type TileTooltipKickoff = {
  kind: "hover" | "touch" | "focus";
  el: HTMLElement;
};

/**
 * Hook wired into a tile element. Encapsulates:
 *   - 500ms hover-intent delay before showing.
 *   - Long-press (500ms) on touch to show; tap-elsewhere to hide.
 *   - Skip showing while the tile is being dragged or a modal is open.
 *   - Smart placement: prefer right-of-tile, fall back to left if the
 *     viewport doesn't have at least 280px clear on the right.
 *
 * Lazy hydration: at 80 tiles per page, the per-tile cost of always
 * allocating 2 useState + 2 useRef + 3 useEffect + several useCallback
 * adds up. The hook now keeps only a single `activated` flag plus a
 * stable handler object until the user actually hovers / touches /
 * focuses a tile, at which point a sibling `<TileTooltipEngine>`
 * mounts and owns all the stateful machinery for *that* tile.
 *
 * Returns event-handler props that the tile spreads onto its root, and
 * a `tooltip` value (the floating element to render, plus the engine
 * itself when hydrated) — null when nothing has activated yet.
 */
function useTileTooltip(data: TileTooltipData, tileId: string): {
  handlers: TileTooltipHandlers;
  tooltip: JSX.Element | null;
} {
  const [activated, setActivated] = useState(false);
  // Engine publishes its imperative API here once mounted; the
  // handlers below route to it when present.
  const engineApiRef = useRef<TileTooltipEngineApi | null>(null);
  // First-activation kickoff stashed for the engine to read on mount.
  const kickoffRef = useRef<TileTooltipKickoff | null>(null);

  const baseHandlers = useMemo(() => ({
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      const api = engineApiRef.current;
      if (api) { api.onMouseEnter(e); return; }
      kickoffRef.current = { kind: "hover", el: e.currentTarget };
      setActivated(true);
    },
    onMouseLeave: () => engineApiRef.current?.onMouseLeave(),
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => {
      const api = engineApiRef.current;
      if (api) { api.onTouchStart(e); return; }
      kickoffRef.current = { kind: "touch", el: e.currentTarget };
      setActivated(true);
    },
    onTouchEnd: () => engineApiRef.current?.onTouchEnd(),
    onDragStart: () => engineApiRef.current?.onDragStart(),
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      const api = engineApiRef.current;
      if (api) { api.onFocus(e); return; }
      kickoffRef.current = { kind: "focus", el: e.currentTarget };
      setActivated(true);
    },
    onBlur: () => engineApiRef.current?.onBlur(),
  }), []);
  // Pre-hydration: no tooltip in the DOM, omit aria-describedby. Once
  // hydrated we point at the deterministic tooltip id; when the
  // engine isn't currently rendering the tooltip the id simply
  // resolves to nothing — screen readers ignore unresolved idrefs,
  // matching the previous "undefined when hidden" behaviour from the
  // user's standpoint.
  const handlers: TileTooltipHandlers = activated
    ? { ...baseHandlers, "aria-describedby": `tile-tooltip-${tileId}` }
    : { ...baseHandlers, "aria-describedby": undefined };

  const tooltip = activated ? (
    <TileTooltipEngine
      data={data}
      tileId={tileId}
      apiRef={engineApiRef}
      initialKickoff={kickoffRef}
    />
  ) : null;

  return { handlers, tooltip };
}

/**
 * Heavy half of the lobby tooltip — owns visibility/coords state, the
 * 500ms show timer, and the document/window listeners. Mounted only
 * after the first hover/touch/focus on its tile.
 */
function TileTooltipEngine({
  data,
  tileId,
  apiRef,
  initialKickoff,
}: {
  data: TileTooltipData;
  tileId: string;
  apiRef: React.MutableRefObject<TileTooltipEngineApi | null>;
  initialKickoff: React.MutableRefObject<TileTooltipKickoff | null>;
}): JSX.Element | null {
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

  // Publish the imperative API on every render so the parent's stable
  // handler object can route subsequent events here.
  apiRef.current = {
    onMouseEnter: (e) => {
      const el = e.currentTarget;
      targetRef.current = el;
      clearTimer();
      showTimer.current = window.setTimeout(() => show(el), 500);
    },
    onMouseLeave: () => hide(),
    onTouchStart: (e) => {
      const el = e.currentTarget;
      targetRef.current = el;
      clearTimer();
      showTimer.current = window.setTimeout(() => show(el), 500);
    },
    onTouchEnd: () => clearTimer(),
    onDragStart: () => hide(),
    onFocus: (e) => {
      const el = e.currentTarget;
      targetRef.current = el;
      clearTimer();
      show(el);
    },
    onBlur: () => hide(),
  };

  // Replay the activating event. The light handlers swallowed the
  // first hover/touch/focus to flip activation; on first mount we
  // honour what the user actually did.
  useEffect(() => {
    const ko = initialKickoff.current;
    initialKickoff.current = null;
    if (!ko) return;
    targetRef.current = ko.el;
    if (ko.kind === "focus") {
      show(ko.el);
    } else {
      // hover / touch: 500ms hover-intent delay, same as live events.
      clearTimer();
      showTimer.current = window.setTimeout(() => show(ko.el), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear the published API when this engine unmounts (currently only
  // happens when the parent tile unmounts — engines are sticky once
  // hydrated, since the cost was already paid).
  useEffect(() => {
    return () => {
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (!visible || !coords) return null;
  return (
    <div
      id={`tile-tooltip-${tileId}`}
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
  );
}

type Filter = "all" | "top-rated" | "favorites" | "recently-played" | GameCategory;
const TOP_RATED_THRESHOLD = 4;

/**
 * Read the persisted lobby filter (if any) and validate it against the
 * known set of filter values — guards against stale / hand-edited
 * localStorage entries from older builds.
 */
function readPersistedFilter(): Filter {
  try {
    if (typeof localStorage === "undefined") return "all";
    const raw = localStorage.getItem(FILTER_STORAGE_KEY);
    if (!raw) return "all";
    if (
      raw === "all"
      || raw === "top-rated"
      || raw === "favorites"
      || raw === "recently-played"
      || raw === "solitaire"
      || raw === "cards"
      || raw === "dice"
      || raw === "board"
      || raw === "arcade"
    ) {
      return raw;
    }
  } catch { /* ignore */ }
  return "all";
}

function writePersistedFilter(filter: Filter): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(FILTER_STORAGE_KEY, filter);
  } catch { /* ignore */ }
}

const CATEGORY_ORDER: GameCategory[] = ["solitaire", "cards", "dice", "board", "arcade"];
const CATEGORY_LABELS: Record<GameCategory, string> = {
  solitaire: t("lobby.cat.solitaire"),
  cards: t("lobby.cat.cards"),
  dice: t("lobby.cat.dice"),
  board: t("lobby.cat.board"),
  arcade: t("lobby.cat.arcade"),
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

// How many trailing entries in the registry are treated as "recently added"
// for the NEW badge. Registry order is the proxy since plugins lack timestamps.
const NEW_GAME_WINDOW = 60;

// Curated QUICK / CHALLENGING id sets and `pickBadgeKind` live in
// `platform/gameTags.ts` so CategoryPage can share the same data without
// drift. The editor's-pick list and rating threshold remain lobby-local
// and are threaded through `pickBadgeKind`'s options bag below.

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
  /**
   * Precomputed lowercase haystack — all searchable strings for this
   * entry concatenated, so per-keystroke filtering does an `indexOf`
   * instead of re-lowercasing every field on every render.
   */
  haystack: string;
};
type GameEntry = {
  kind: "game";
  game: GamePlugin;
  sortKey: string;
  category: GameCategory;
  haystack: string;
};
type LobbyEntry = FamilyEntry | GameEntry;

export default function LobbyPage(): JSX.Element {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>(() => readPersistedFilter());
  const [listMode, setListMode] = useState<ListMode>(() => readPersistedListMode());
  // Infinite-scroll high-water mark (number of entries appended so far);
  // pagination mode ignores this and slices by `page` instead.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // 1-based page index used in pagination mode.
  const [page, setPage] = useState(1);
  const [openFamilyId, setOpenFamilyId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>(() => readRatings());
  const [favSet, setFavSet] = useState<Set<string>>(() => readFavorites());
  const [lastPlayed, setLastPlayed] = useState<Record<string, number>>(() => {
    try { return getLastPlayed(); } catch { return {}; }
  });
  const [drawerCollapsed, setDrawerCollapsed] = useState<boolean>(() => {
    try {
      if (typeof localStorage === "undefined") return false;
      return localStorage.getItem(DRAWER_COLLAPSED_KEY) === "1";
    } catch { return false; }
  });
  const deferredQuery = useDeferredValue(query);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const featuredRef = useRef<HTMLElement | null>(null);
  // Roving-tabindex region: only ONE tile inside `.lobby-grid` ever has
  // `tabindex="0"`; the rest are `-1`. Arrow keys walk the 2D layout and
  // move focus (which migrates the `0` along with it).
  const gridRef = useRef<HTMLDivElement | null>(null);
  // Onboarding coachmark — only render when the welcome tutorial just
  // dismissed AND the user has zero plays. The state is hydrated lazily
  // because we don't want SSR / unit-test localStorage probes to crash.
  const [coachmarkVisible, setCoachmarkVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      if (getCoachmarkState() !== "pending") return false;
      // Returning users (any plays recorded) skip the coachmark — they
      // already know how the lobby works.
      const stats = loadStats();
      if ((stats.totalPlayed ?? 0) > 0) return false;
      return true;
    } catch {
      return false;
    }
  });
  const [coachmarkPos, setCoachmarkPos] = useState<{ top: number; left: number } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  // Track which family id (if any) was opened via a `?family=<id>` deep
  // link so we can stamp a marker on the picker for tests, and so that
  // closing it can clear the URL via `navigate("/", { replace: true })`
  // without re-opening the picker on subsequent renders.
  const [autoFamilyId, setAutoFamilyId] = useState<string | null>(null);

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

  // Mirror — keep favorites synced across tabs and on focus regain so the
  // lobby reflects toggles made in another window or in the play page.
  useEffect(() => {
    const refresh = () => setFavSet(readFavorites());
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === "cards-favorites") refresh();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Mirror — keep the recently-played map fresh when refocusing the
  // lobby so the drawer's "Recently played" filter reflects the most
  // recent session even after navigating back from PlayPage.
  useEffect(() => {
    const refresh = () => {
      try { setLastPlayed(getLastPlayed()); } catch { /* ignore */ }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === "cards-last-played") refresh();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Persist drawer-collapsed flag — best-effort, ignored on private mode.
  useEffect(() => {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(DRAWER_COLLAPSED_KEY, drawerCollapsed ? "1" : "0");
    } catch { /* ignore */ }
  }, [drawerCollapsed]);

  // Persist filter changes; the value rehydrates on the next mount.
  useEffect(() => {
    writePersistedFilter(filter);
  }, [filter]);

  // Persist list-mode changes; rehydrates on next mount.
  useEffect(() => {
    writePersistedListMode(listMode);
  }, [listMode]);

  // Flip favorite status for a single game id and write through to the
  // shared persistence helper, then update the in-memory set so all
  // tiles re-render with the new state without an extra read pass.
  const onToggleFavorite = useCallback((id: string) => {
    if (!id) return;
    toggleFavoritePersist(id);
    setFavSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  // Set of "recently added" game ids — the last NEW_GAME_WINDOW entries
  // in registry order. We treat registry order as a proxy for added-at
  // since the plugin shape doesn't carry a timestamp; the test suite
  // also relies on this ordering being deterministic.
  const newGameIds = useMemo(() => {
    const safe = GAMES.filter((g): g is GamePlugin => g != null);
    const tail = safe.slice(Math.max(0, safe.length - NEW_GAME_WINDOW));
    return new Set(tail.map((g) => g.id));
  }, []);

  // Featured strip — pluck out a few well-known titles, fall back gracefully.
  const featured = useMemo(() => {
    const byId = new Map(GAMES.filter((g) => g != null).map((g) => [g.id, g] as const));
    return FEATURED_IDS.map((id) => byId.get(id)).filter((g): g is GamePlugin => Boolean(g));
  }, []);

  // Personalized recommendations — surfaced below the Featured strip
  // once the user has a non-trivial play history (>=3 plays). The
  // recommender is pure; we feed it the same stats / favorites / ratings
  // signals already loaded for the rest of the lobby.
  const stats = useMemo(() => {
    try { return loadStats(); } catch {
      return { totalPlayed: 0, perGame: {}, perCategory: {} } as ReturnType<typeof loadStats>;
    }
  }, [favSet, ratings, lastPlayed]);
  const totalPlays = stats.totalPlayed ?? 0;
  const recommendations = useMemo(() => {
    if (totalPlays < 3) return [] as GamePlugin[];
    const all = GAMES.filter((g): g is GamePlugin => g != null);
    return getRecommendations(stats, favSet, ratings, all, { lastPlayed });
  }, [stats, favSet, ratings, lastPlayed, totalPlays]);

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
      // Build the search haystack once: family label + description plus
      // each member's title + description, all lower-cased and joined
      // with `\n` so substrings can't bleed across boundaries.
      const memberStrings: string[] = [];
      for (const m of members) {
        memberStrings.push(m.title.toLowerCase(), m.description.toLowerCase());
      }
      const haystack = [
        fam.label.toLowerCase(),
        fam.description.toLowerCase(),
        ...memberStrings,
      ].join("\n");
      entries.push({
        kind: "family",
        family: fam,
        members,
        sortKey: fam.label.toLowerCase(),
        category,
        haystack,
      });
    }

    // Standalone entries — games not absorbed by any family.
    for (const g of safeGames) {
      if (idToFamily.has(g.id)) continue;
      const haystack = [
        g.title.toLowerCase(),
        g.category.toLowerCase(),
        g.description.toLowerCase(),
      ].join("\n");
      entries.push({
        kind: "game",
        game: g,
        sortKey: g.title.toLowerCase(),
        category: g.category,
        haystack,
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
    } else if (filter === "favorites") {
      list = allEntries.filter((e) =>
        e.kind === "game"
          ? favSet.has(e.game.id)
          : e.members.some((m) => favSet.has(m.id)),
      );
    } else if (filter === "recently-played") {
      // Keep only entries that have at least one member with a non-zero
      // last-played stamp; sort by most-recent stamp descending so the
      // top of the list is what the user just touched.
      const stampOf = (e: LobbyEntry): number => {
        if (e.kind === "game") return lastPlayed[e.game.id] ?? 0;
        let best = 0;
        for (const m of e.members) {
          const v = lastPlayed[m.id] ?? 0;
          if (v > best) best = v;
        }
        return best;
      };
      list = allEntries
        .filter((e) => stampOf(e) > 0)
        .slice()
        .sort((a, b) => stampOf(b) - stampOf(a));
    } else {
      list = allEntries.filter((e) => e.category === filter);
    }
    if (!q) return list;
    // Each entry carries a precomputed lowercase `haystack` covering the
    // family label / description / member titles / member descriptions,
    // so the per-keystroke filter is a single `indexOf` per entry rather
    // than re-lowercasing every field. Same matching semantics as before
    // (family surfaces if any member matches; standalone matches title /
    // category / description).
    list = list.filter((e) => e.haystack.includes(q));
    return list;
  }, [allEntries, filter, deferredQuery, entryRating, favSet, lastPlayed]);

  // Reset window + page + close any open picker when filter or query changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setPage(1);
    setOpenFamilyId(null);
  }, [filter, deferredQuery]);

  // Mode flip: reset to a clean first-page state. We don't auto-scroll
  // even if the user prefers motion — toggle is a UI mode switch, not
  // navigation. (Reduced-motion users get the exact same behaviour.)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setPage(1);
  }, [listMode]);

  // Infinite-scroll sentinel: when it crosses the viewport, append one
  // more page worth of cards. Disabled in pagination mode (the sentinel
  // node won't render, so the early-return on missing node trips first).
  useEffect(() => {
    if (listMode !== "infinite") return;
    const node = sentinelRef.current;
    if (!node) return;
    // Already showing everything — nothing to observe, and we should NOT
    // mount an observer that could keep firing as the user scrolls past
    // the bottom.
    if (visibleCount >= filtered.length) return;
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setVisibleCount((c) => {
            if (c >= filtered.length) return c;
            return Math.min(c + PAGE_SIZE, filtered.length);
          });
        }
      }
    }, { rootMargin: "400px 0px" });
    io.observe(node);
    return () => io.disconnect();
  }, [filtered.length, visibleCount, listMode]);

  // Close the picker on Escape — keyboard accessibility.
  useEffect(() => {
    if (!openFamilyId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenFamilyId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openFamilyId]);

  // Roving tabindex bookkeeping: after every render that changes the set
  // of tiles inside `.lobby-grid`, ensure exactly one tile is in the tab
  // sequence. We default to the first tile; if focus is currently inside
  // the grid we keep it on whichever tile owns focus (so re-renders from
  // search keystrokes don't snatch focus back to the start).
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const tiles = grid.querySelectorAll<HTMLElement>(".tile");
    if (tiles.length === 0) return;
    const active = document.activeElement;
    let activeIndex = -1;
    tiles.forEach((tile, i) => {
      if (tile === active) activeIndex = i;
    });
    const target = activeIndex >= 0 ? activeIndex : 0;
    tiles.forEach((tile, i) => {
      tile.tabIndex = i === target ? 0 : -1;
    });
  });

  /**
   * Single 2D arrow-key handler for the lobby grid. Uses
   * `getBoundingClientRect()` to derive the column count from the first
   * row — robust against responsive breakpoints since we always re-read
   * the layout when a key is pressed.
   */
  const onGridKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const grid = gridRef.current;
    if (!grid) return;
    const tiles = Array.from(grid.querySelectorAll<HTMLElement>(".tile"));
    if (tiles.length === 0) return;
    const current = tiles.findIndex((t) => t === document.activeElement);
    if (current < 0) return; // focus isn't on a grid tile — leave the event alone
    // Compute columns by counting tiles whose top matches the first tile's top.
    const firstTop = tiles[0].getBoundingClientRect().top;
    let cols = 0;
    for (const t of tiles) {
      // 1px tolerance for sub-pixel rounding.
      if (Math.abs(t.getBoundingClientRect().top - firstTop) < 1) cols++;
      else break;
    }
    if (cols < 1) cols = 1;
    let next = -1;
    switch (e.key) {
      case "ArrowRight":
        next = Math.min(tiles.length - 1, current + 1);
        break;
      case "ArrowLeft":
        next = Math.max(0, current - 1);
        break;
      case "ArrowDown":
        next = Math.min(tiles.length - 1, current + cols);
        break;
      case "ArrowUp":
        next = Math.max(0, current - cols);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = tiles.length - 1;
        break;
      case "PageDown":
        next = Math.min(tiles.length - 1, current + cols * 5);
        break;
      case "PageUp":
        next = Math.max(0, current - cols * 5);
        break;
      default:
        return;
    }
    if (next === current || next < 0) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    tiles[current].tabIndex = -1;
    tiles[next].tabIndex = 0;
    tiles[next].focus();
  }, []);

  // -----------------------------------------------------------------
  // Onboarding coachmark — dismissal + positioning side-effects.
  // The actual tooltip JSX lives at the bottom of the lobby render so
  // it floats above the strip without being clipped by parent stacking
  // contexts. Dismissal sources:
  //   - any tile click inside `.lobby-grid` (capture-phase listener)
  //   - any navigation away from the lobby (router `location` change)
  //   - the Esc key
  //   - the explicit X on the coachmark itself
  // Once dismissed, `cards-onboard-coachmark` flips to "done" so the
  // hint never re-shows on its own.
  // -----------------------------------------------------------------
  const dismissCoachmark = useCallback(() => {
    setCoachmarkVisible(false);
    setCoachmarkDone();
    track("coachmark.dismiss");
  }, []);

  useEffect(() => {
    if (!coachmarkVisible) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismissCoachmark();
      }
    };
    const onTileClick = (e: MouseEvent): void => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      // Any click inside any lobby tile (.tile) or the featured strip
      // counts — the user is engaging with the catalog, the hint has
      // done its job.
      if (target.closest(".tile") || target.closest(".lobby-tile-wrap")) {
        dismissCoachmark();
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onTileClick, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onTileClick, true);
    };
  }, [coachmarkVisible, dismissCoachmark]);

  // Navigation away from the lobby also dismisses the coachmark — this
  // covers header links, search-popover navigations, and the "Surprise"
  // jump. Driven off `location.pathname` so SPAs are caught.
  const initialPathRef = useRef<string>(location.pathname);
  useEffect(() => {
    if (!coachmarkVisible) return;
    if (location.pathname !== initialPathRef.current) {
      dismissCoachmark();
    }
  }, [location.pathname, coachmarkVisible, dismissCoachmark]);

  // Recompute coachmark position whenever it's visible — anchored to
  // the Featured section so the arrow points at the strip header.
  useEffect(() => {
    if (!coachmarkVisible) return;
    const place = (): void => {
      const node = featuredRef.current;
      if (!node) {
        setCoachmarkPos(null);
        return;
      }
      const r = node.getBoundingClientRect();
      const TIP_W = 260;
      const GAP = 10;
      // Sit just below the section header, nudged inwards from the
      // left edge so the arrow aligns near the section title.
      const left = Math.min(
        Math.max(12, r.left + 24),
        window.innerWidth - TIP_W - 12,
      );
      const top = r.top + 8 + window.scrollY * 0; // rect already viewport-relative
      setCoachmarkPos({ top: top + 28, left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [coachmarkVisible]);

  // Honour `/?family=<id>` deep-links from CategoryPage (and elsewhere).
  // On mount and whenever the URL changes, look up the family by id and
  // auto-open the picker. Unknown / missing ids are silently ignored so
  // a stale link just lands on the regular lobby.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const famId = params.get("family");
    if (!famId) {
      // URL no longer carries the param — drop the auto marker so a
      // post-close navigate("/", { replace: true }) doesn't keep
      // re-opening the picker.
      if (autoFamilyId !== null) setAutoFamilyId(null);
      return;
    }
    if (!familyById.has(famId)) return;
    setOpenFamilyId(famId);
    setAutoFamilyId(famId);
  }, [location.search, familyById, autoFamilyId]);

  // Total page count for the Prev/Next pager — 1 even when the list is
  // empty so the controls don't render `Page 1 of 0`.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp page if the list shrank under us (e.g. filter changed).
  const safePage = Math.min(page, totalPages);
  const visible = useMemo(() => {
    if (listMode === "infinite") return filtered.slice(0, visibleCount);
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, visibleCount, listMode, safePage]);
  // "More to load" is only meaningful in infinite-scroll mode — the
  // pagination footer never short-circuits the Prev/Next controls.
  const hasMore = listMode === "infinite" && visibleCount < filtered.length;
  const loadedCount = listMode === "infinite"
    ? Math.min(visibleCount, filtered.length)
    : Math.min(safePage * PAGE_SIZE, filtered.length);

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
    } else if (filter === "favorites") {
      pool = allGames.filter((g) => favSet.has(g.id));
    } else if (filter === "recently-played") {
      pool = allGames.filter((g) => (lastPlayed[g.id] ?? 0) > 0);
    } else {
      pool = allGames.filter((g) => g.category === filter);
    }
    const final = pool.length > 0 ? pool : allGames;
    if (final.length === 0) return;
    const pick = final[Math.floor(Math.random() * final.length)]!;
    navigate(`/play/${pick.id}`);
  }, [filter, navigate, ratings, favSet, lastPlayed]);

  // Count of distinct top-rated games (>= 4 stars) — drives the chip count.
  const topRatedCount = useMemo(() => {
    let n = 0;
    for (const g of GAMES) {
      if (g == null) continue;
      if ((ratings[g.id] ?? 0) >= TOP_RATED_THRESHOLD) n++;
    }
    return n;
  }, [ratings]);

  // Count of distinct games with a non-zero last-played stamp — drives
  // the drawer's "Recently played" entry count badge.
  const recentlyPlayedCount = useMemo(() => {
    let n = 0;
    for (const g of GAMES) {
      if (g == null) continue;
      if ((lastPlayed[g.id] ?? 0) > 0) n++;
    }
    return n;
  }, [lastPlayed]);

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
        <p>{t("lobby.empty.no_games")}</p>
      </div>
    );
  }

  return (
    <div
      className={`lobby-page${drawerCollapsed ? " lobby-page--drawer-collapsed" : ""}`}
      ref={rootRef}
    >
      <PageHead
        title="Cards and Such — 4500+ classic and modern games"
        exact
        description="Browse 4,500+ free solitaire, card, dice, board, and arcade games. Play Klondike, FreeCell, Spider, Hearts, Spades, Yahtzee, Chess, and more — instantly in your browser."
        canonical="https://cards.waterburp.com/"
      />
      <aside
        className="lobby-drawer"
        data-testid="lobby-drawer"
        aria-label="Lobby categories"
        data-collapsed={drawerCollapsed ? "true" : "false"}
      >
        <button
          type="button"
          className="lobby-drawer-toggle"
          data-testid="lobby-drawer-toggle"
          onClick={() => setDrawerCollapsed((c) => !c)}
          aria-expanded={!drawerCollapsed}
          aria-label={drawerCollapsed ? "Expand category drawer" : "Collapse category drawer"}
          title={drawerCollapsed ? "Expand" : "Collapse"}
        >
          <span aria-hidden="true">{drawerCollapsed ? "›" : "‹"}</span>
        </button>
        <nav className="lobby-drawer-nav" role="tablist" aria-label="Filter by category (drawer)">
          <DrawerLink
            id="all"
            active={filter === "all"}
            onClick={() => setFilter("all")}
            glyph="◎"
            label={t("lobby.all_games")}
            count={GAMES.length}
            collapsed={drawerCollapsed}
          />
          {CATEGORY_ORDER.map((cat) => (
            <DrawerLink
              key={cat}
              id={cat}
              active={filter === cat}
              onClick={() => setFilter(cat)}
              glyph={CATEGORY_GLYPHS[cat]}
              label={CATEGORY_LABELS[cat]}
              count={categoryCounts[cat]}
              collapsed={drawerCollapsed}
            />
          ))}
          <div className="lobby-drawer-sep" aria-hidden="true" />
          <DrawerLink
            id="favorites"
            active={filter === "favorites"}
            onClick={() => setFilter("favorites")}
            glyph="♥"
            label={t("lobby.chip.favorites")}
            count={favSet.size}
            collapsed={drawerCollapsed}
          />
          <DrawerLink
            id="top-rated"
            active={filter === "top-rated"}
            onClick={() => setFilter("top-rated")}
            glyph="★"
            label={t("lobby.chip.top_rated")}
            count={topRatedCount}
            collapsed={drawerCollapsed}
          />
          <DrawerLink
            id="recently-played"
            active={filter === "recently-played"}
            onClick={() => setFilter("recently-played")}
            glyph="↺"
            label={t("lobby.chip.recently_played")}
            count={recentlyPlayedCount}
            collapsed={drawerCollapsed}
          />
        </nav>
      </aside>
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
          <strong>{GAMES.length.toLocaleString()}</strong> games and counting — pick one and deal yourself in.
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
            placeholder={t("lobby.search.placeholder")}
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
          <Chip active={filter === "all"} onClick={() => setFilter("all")} count={GAMES.length} testId="chip-all">{t("lobby.chip.all")}</Chip>
          <Chip
            active={filter === "top-rated"}
            onClick={() => setFilter("top-rated")}
            count={topRatedCount}
            testId="chip-top-rated"
            glyph="★"
          >{t("lobby.chip.top_rated")}</Chip>
          <Chip
            active={filter === "favorites"}
            onClick={() => setFilter("favorites")}
            count={favSet.size}
            testId="chip-favorites"
            glyph="♥"
          >{t("lobby.chip.favorites")}</Chip>
          <Chip
            active={filter === "recently-played"}
            onClick={() => setFilter("recently-played")}
            count={recentlyPlayedCount}
            testId="chip-recently-played"
            glyph="↺"
          >{t("lobby.chip.recently_played")}</Chip>
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
        <section
          className="lobby-featured"
          aria-label="Featured games"
          ref={featuredRef}
        >
          <h2>
            <span className="lobby-featured-spark" aria-hidden="true">✦</span>
            Featured
          </h2>
          <div className="lobby-grid lobby-grid--featured">
            {featured.map((g) => {
              const famId = gameIdToFamilyId.get(g.id);
              const isFav = famId
                ? false /* family featured tile — toggle is per-game; we
                           visualise active state from the picker, which
                           tracks individual member ids. */
                : favSet.has(g.id);
              return (
                <FeaturedTile
                  key={`feat-${g.id}`}
                  game={g}
                  familyId={famId}
                  onOpenFamily={(id) => setOpenFamilyId(id)}
                  isNew={newGameIds.has(g.id)}
                  userRating={ratings[g.id] ?? 0}
                  isFavorite={isFav}
                  onToggleFavorite={onToggleFavorite}
                  highlightQuery={deferredQuery}
                />
              );
            })}
          </div>
        </section>
      )}

      {!query && filter === "all" && recommendations.length > 0 && (
        <section
          className="lobby-recommended"
          aria-label="Recommended for you"
          data-testid="lobby-recommended"
        >
          <h2>
            <span className="lobby-featured-spark" aria-hidden="true">★</span>
            Recommended for you
          </h2>
          <div className="lobby-grid lobby-grid--featured">
            {recommendations.map((g) => (
              <Link
                key={`rec-${g.id}`}
                to={`/play/${g.id}`}
                className={`tile tile--cat-${CATEGORY_TAG[g.category]} tile--featured`}
                data-testid={`rec-tile-${g.id}`}
              >
                <span className="tile-stripe" aria-hidden="true" />
                <span className="tile-sheen" aria-hidden="true" />
                <div className="tile-meta">
                  <span className={`tile-cat tile-cat-${CATEGORY_TAG[g.category]}`}>
                    <span className="tile-cat-glyph" aria-hidden="true">{CATEGORY_GLYPHS[g.category]}</span>
                    {CATEGORY_LABELS[g.category]}
                  </span>
                </div>
                <div className="tile-title lobby-tile-title">{g.title}</div>
                <div className="tile-desc">{g.description}</div>
                <div className="tile-foot">
                  <span className="tile-players">
                    {g.players.min === g.players.max
                      ? `${g.players.min} player${g.players.min === 1 ? "" : "s"}`
                      : `${g.players.min}–${g.players.max} players`}
                  </span>
                  <span className="tile-cta" aria-hidden="true">Play</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section aria-label="All games">
        <div className="lobby-section-head">
          <h2>
            {filter === "all"
              ? t("lobby.all_games")
              : filter === "top-rated"
                ? t("lobby.chip.top_rated")
                : filter === "favorites"
                  ? t("lobby.chip.favorites")
                  : filter === "recently-played"
                    ? t("lobby.chip.recently_played")
                    : CATEGORY_LABELS[filter]}
            {query && (
              <span className="lobby-section-count">
                {" · "}
                {filtered.length.toLocaleString()} match{filtered.length === 1 ? "" : "es"}
                {matchedGameCount !== filtered.length && ` (${matchedGameCount.toLocaleString()} games)`}
              </span>
            )}
          </h2>
          {/* Two-state pill toggle for the list-walking strategy.
              Persisted in localStorage; default = pagination. */}
          <div
            className="lobby-mode-toggle"
            role="group"
            aria-label="List browsing mode"
            data-testid="lobby-mode-toggle"
          >
            <button
              type="button"
              className={`lobby-mode-toggle-btn${listMode === "pagination" ? " is-active" : ""}`}
              aria-pressed={listMode === "pagination"}
              onClick={() => setListMode("pagination")}
              data-testid="lobby-mode-pagination"
            >Pagination</button>
            <button
              type="button"
              className={`lobby-mode-toggle-btn${listMode === "infinite" ? " is-active" : ""}`}
              aria-pressed={listMode === "infinite"}
              onClick={() => setListMode("infinite")}
              data-testid="lobby-mode-infinite"
            >Infinite scroll</button>
          </div>
        </div>

        {filterPending ? (
          <div className="lobby-grid" data-testid="lobby-skeleton-grid" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonTile key={`sk-${i}`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          filter === "favorites" && !query ? (
            <div
              className="lobby-no-results"
              data-testid="lobby-favorites-empty"
            >
              <ConfusedCardSvg />
              <p>
                {t("lobby.empty.favorites")} Tap the <span aria-hidden="true">♥</span> heart on any tile to save it here.
              </p>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setQuery(""); setFilter("all"); }}
              >{t("lobby.browse_all")}</button>
            </div>
          ) : (
            <div className="lobby-no-results" data-testid="lobby-no-results">
              <ConfusedCardSvg />
              {filter === "top-rated" && !query ? (
                <p data-testid="lobby-top-rated-empty">
                  You haven't rated any games {TOP_RATED_THRESHOLD} stars or higher yet. Play a game and tap the stars at the end to fill this list.
                </p>
              ) : (
                <p>No games match <strong>{query}</strong>.</p>
              )}
              <button type="button" className="btn btn-ghost" onClick={() => { setQuery(""); setFilter("all"); }}>{t("lobby.clear_filters")}</button>
            </div>
          )
        ) : (
          <>
            <div className="lobby-grid" ref={gridRef} onKeyDown={onGridKeyDown}>
              {visible.map((entry) =>
                entry.kind === "game" ? (
                  <GameCard
                    key={`game-${entry.game.id}`}
                    game={entry.game}
                    userRating={ratings[entry.game.id] ?? 0}
                    isNew={newGameIds.has(entry.game.id)}
                    isFavorite={favSet.has(entry.game.id)}
                    onToggleFavorite={onToggleFavorite}
                    highlightQuery={deferredQuery}
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
                    isNew={entry.members.some((m) => newGameIds.has(m.id))}
                    members={entry.members}
                    isFavorite={entry.members.some((m) => favSet.has(m.id))}
                    onToggleFavorite={onToggleFavorite}
                    highlightQuery={deferredQuery}
                  />
                ),
              )}
            </div>
            {listMode === "infinite" ? (
              <>
                <div
                  className="lobby-loaded-count"
                  data-testid="lobby-loaded-count"
                  aria-live="polite"
                >
                  Loaded {loadedCount.toLocaleString()} of {filtered.length.toLocaleString()}
                </div>
                {hasMore && (
                  <div
                    className="lobby-loadmore"
                    ref={sentinelRef}
                    data-testid="lobby-sentinel"
                  >
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
            ) : (
              totalPages > 1 && (
                <div className="lobby-pager" data-testid="lobby-pager">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    data-testid="lobby-pager-prev"
                  >Prev</button>
                  <span className="lobby-pager-status" aria-live="polite">
                    Page {safePage.toLocaleString()} of {totalPages.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    data-testid="lobby-pager-next"
                  >Next</button>
                </div>
              )
            )}
          </>
        )}
      </section>

      {openFamily && (
        <FamilyPicker
          family={openFamily.family}
          members={openFamily.members}
          ratings={ratings}
          autoOpenedFamilyId={
            autoFamilyId === openFamily.family.id ? autoFamilyId : null
          }
          onClose={() => {
            setOpenFamilyId(null);
            // If this picker was opened via `?family=<id>`, scrub the
            // query string so a post-close refresh doesn't re-open it.
            // `replace` so the back button still works as expected.
            if (autoFamilyId === openFamily.family.id) {
              setAutoFamilyId(null);
              navigate("/", { replace: true });
            }
          }}
        />
      )}

      {coachmarkVisible && coachmarkPos && (
        <div
          className="lobby-coachmark"
          data-testid="coachmark"
          role="status"
          aria-live="polite"
          style={{ top: coachmarkPos.top, left: coachmarkPos.left }}
        >
          <span className="lobby-coachmark-arrow" aria-hidden="true" />
          <span className="lobby-coachmark-text">
            Try one of these to get started{" "}
            <span aria-hidden="true">✨</span>
          </span>
          <button
            type="button"
            className="lobby-coachmark-close"
            data-testid="coachmark-dismiss"
            aria-label="Dismiss tip"
            onClick={dismissCoachmark}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

interface DrawerLinkProps {
  id: string;
  active: boolean;
  onClick: () => void;
  glyph: string;
  label: string;
  count: number;
  collapsed: boolean;
}
/**
 * Single entry in the desktop left-drawer category nav. Renders the
 * glyph + label + count when expanded, glyph-only when collapsed (the
 * label still ships in `aria-label` and a native `title` so the icon
 * row remains usable). Clicking sets the same lobby `filter` state as
 * the chip strip — they stay in sync because they read/write the same
 * piece of state.
 */
function DrawerLink({ id, active, onClick, glyph, label, count, collapsed }: DrawerLinkProps): JSX.Element {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`lobby-drawer-link${active ? " is-active" : ""}`}
      onClick={onClick}
      data-testid={`lobby-drawer-cat-${id}`}
      title={collapsed ? `${label} (${count.toLocaleString()})` : undefined}
      aria-label={`${label} — ${count.toLocaleString()} games`}
    >
      <span className="lobby-drawer-link-glyph" aria-hidden="true">{glyph}</span>
      <span className="lobby-drawer-link-label">{label}</span>
      <span className="lobby-drawer-link-count">{count.toLocaleString()}</span>
    </button>
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

/**
 * Heart toggle that flips favorite status. Sits at top-right of every
 * tile, fades in only on hover/focus (always visible on coarse-pointer
 * devices), and animates the fill on each flip via a one-shot scale
 * 1.3 → 1.0 keyframe.
 *
 * Stops click propagation so tapping it never navigates the parent
 * Link, and surfaces the canonical `tile-fav-toggle-<id>` testid.
 */
function HeartToggle({
  id,
  active,
  onToggle,
}: {
  id: string;
  active: boolean;
  onToggle: (id: string) => void;
}): JSX.Element {
  const [flipKey, setFlipKey] = useState(0);
  const handle = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setFlipKey((n) => n + 1);
      onToggle(id);
    },
    [id, onToggle],
  );
  return (
    <button
      type="button"
      className={`tile-fav${active ? " is-active" : ""}`}
      data-testid={`tile-fav-toggle-${id}`}
      onClick={handle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handle(e);
      }}
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      title={active ? "Remove from favorites" : "Add to favorites"}
    >
      <span
        key={flipKey}
        className={`tile-fav-glyph${active ? " is-active" : ""}`}
        aria-hidden="true"
      >
        {active ? "♥" : "♡"}
      </span>
    </button>
  );
}

/**
 * Tiny "at-a-glance" chip pair (estimated playtime + difficulty
 * indicator) rendered just below the tile description. Difficulty
 * is shown as 1-3 dots so the chip stays compact next to the time
 * pill; on narrow viewports the dot chip collapses (CSS hides it)
 * leaving only the eta to keep the tile from wrapping awkwardly.
 */
function TileMetaChips({ gameId }: { gameId: string }): JSX.Element {
  const eta = getEta(gameId);
  const difficulty = getDifficulty(gameId);
  const dots = difficultyDots(difficulty);
  const compactLabel = `${eta.mins}m`;
  return (
    <div className="tile-chips" aria-hidden="false">
      <span
        className="tile-chip tile-chip-eta"
        data-testid={`tile-eta-${gameId}`}
        title={`Estimated playtime: ${eta.label}`}
      >
        <span aria-hidden="true">⏱</span>
        <span className="tile-chip-label">{compactLabel}</span>
      </span>
      <span
        className={`tile-chip tile-chip-diff tile-chip-diff-${difficulty}`}
        data-testid={`tile-difficulty-${gameId}`}
        aria-label={`Difficulty: ${difficulty}`}
        title={`Difficulty: ${difficulty}`}
      >
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`tile-chip-dot${i <= dots ? " tile-chip-dot--on" : ""}`}
            aria-hidden="true"
          />
        ))}
      </span>
    </div>
  );
}

function GameCard({
  game: g,
  userRating = 0,
  isNew = false,
  isFavorite = false,
  onToggleFavorite,
  highlightQuery,
}: {
  game: GamePlugin;
  userRating?: number;
  isNew?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  /**
   * If set (and at least TITLE_HIGHLIGHT_MIN_LEN chars), wrap the first
   * matching substring of the title in a `<mark>`. Mirrors SearchPage.
   */
  highlightQuery?: string;
}): JSX.Element {
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
  const badgeKind = pickBadgeKind(g.id, isNew, userRating, {
    featuredIds: FEATURED_IDS,
    topRatedThreshold: TOP_RATED_THRESHOLD,
  });
  // Micro-bump: on mousedown we briefly scale the tile to 0.98 so the
  // press registers visually before the click triggers navigation. The
  // class is dropped 80ms later (or on mouseup/leave) so the scale
  // never lingers when the user changes their mind. Pointer-down is the
  // earliest the browser dispatches, making this feel pre-emptive
  // rather than the usual click → blank-route gap. CSS honors
  // prefers-reduced-motion to skip the transform entirely.
  const [pressed, setPressed] = useState(false);
  const pressTimer = useRef<number | null>(null);
  const startPress = useCallback(() => {
    setPressed(true);
    if (pressTimer.current != null) window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => setPressed(false), 80);
  }, []);
  const endPress = useCallback(() => {
    if (pressTimer.current != null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    setPressed(false);
  }, []);
  useEffect(() => () => {
    if (pressTimer.current != null) window.clearTimeout(pressTimer.current);
  }, []);

  // Right-click / long-press context menu state. The menu is positioned
  // at the cursor (or touch point) in viewport coords so the popover can
  // anchor regardless of grid scroll. A long-press of ≥ 600 ms on touch
  // promotes a press into a menu open while suppressing the eventual
  // tap-navigation. The Link's onContextMenu intercepts right-clicks.
  const navigate = useNavigate();
  const pushToast = useToast((s) => s.push);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);
  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current != null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);
  const onTileContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  }, []);
  const onTileTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    const x = t.clientX;
    const y = t.clientY;
    longPressFired.current = false;
    cancelLongPress();
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      setMenuPos({ x, y });
    }, 600);
  }, [cancelLongPress]);
  const onTileTouchEnd = useCallback(() => {
    cancelLongPress();
  }, [cancelLongPress]);
  const onTileTouchMove = useCallback(() => {
    cancelLongPress();
  }, [cancelLongPress]);
  // If the long-press fired, the impending click on the <Link> would
  // still navigate — swallow it so opening the menu doesn't also
  // immediately route to /play/<id>.
  const onTileClick = useCallback((e: React.MouseEvent) => {
    if (longPressFired.current) {
      e.preventDefault();
      e.stopPropagation();
      longPressFired.current = false;
    }
  }, []);
  useEffect(() => () => cancelLongPress(), [cancelLongPress]);

  const closeMenu = useCallback(() => setMenuPos(null), []);
  const playUrl = `${
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : ""
  }/play/${g.id}`;
  const onMenuPlay = useCallback(() => {
    navigate(`/play/${g.id}`);
  }, [navigate, g.id]);
  const onMenuCopy = useCallback(async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(playUrl);
        pushToast("success", "Link copied");
      } else {
        pushToast("error", "Clipboard unavailable");
      }
    } catch {
      pushToast("error", "Copy failed");
    }
  }, [playUrl, pushToast]);
  const onMenuFav = useCallback(() => {
    onToggleFavorite?.(g.id);
  }, [onToggleFavorite, g.id]);
  const onMenuFriend = useCallback(async () => {
    const seed = Math.floor(Math.random() * 0x7fffffff);
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";
    const url = `${origin}/play/${g.id}?seed=${seed}&friend=1`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        pushToast("success", "Friend link copied");
      } else {
        pushToast("error", "Clipboard unavailable");
      }
    } catch {
      pushToast("error", "Copy failed");
    }
  }, [g.id, pushToast]);

  return (
    <div className="lobby-tile-wrap">
    <Link
      to={`/play/${g.id}`}
      className={`tile tile--cat-${CATEGORY_TAG[g.category]}${pressed ? " tile--pressed" : ""}`}
      data-testid={`tile-${g.id}`}
      aria-haspopup="menu"
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onContextMenu={onTileContextMenu}
      onTouchStart={onTileTouchStart}
      onTouchEnd={onTileTouchEnd}
      onTouchMove={onTileTouchMove}
      onTouchCancel={onTileTouchEnd}
      onClick={onTileClick}
      {...handlers}
    >
      <span className="tile-stripe" aria-hidden="true" />
      <span className="tile-sheen" aria-hidden="true" />
      {badgeKind && (
        <span className="tile-badge-slot">
          <Badge kind={badgeKind} testId={`tile-badge-${g.id}`} />
        </span>
      )}
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
      <div className="tile-title lobby-tile-title">
        {highlightQuery && highlightQuery.length >= TITLE_HIGHLIGHT_MIN_LEN
          ? highlightMatch(g.title, highlightQuery)
          : g.title}
      </div>
      <div className="tile-desc">{g.description}</div>
      <TileMetaChips gameId={g.id} />
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
    {onToggleFavorite && (
      <HeartToggle id={g.id} active={isFavorite} onToggle={onToggleFavorite} />
    )}
    {menuPos && (
      <LobbyTileMenu
        gameId={g.id}
        gameTitle={g.title}
        x={menuPos.x}
        y={menuPos.y}
        isFavorite={isFavorite}
        onClose={closeMenu}
        onPlay={onMenuPlay}
        onCopyLink={onMenuCopy}
        onToggleFavorite={onMenuFav}
        onShareWithFriend={onMenuFriend}
      />
    )}
    {tooltip}
    </div>
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
 * Inline empty-state illustration: a stylised playing card with a quizzical
 * face, surfaced when the search/filter combination matches no entries.
 * Decorative — exposed to assistive tech as a single label rather than
 * exposing every path / circle individually.
 */
function ConfusedCardSvg(): JSX.Element {
  return (
    <svg
      className="lobby-empty-svg"
      width="120"
      height="160"
      viewBox="0 0 120 160"
      role="img"
      aria-label="A confused playing card with a question mark"
      data-testid="lobby-empty-illustration"
    >
      {/* Card body */}
      <rect x="6" y="6" width="108" height="148" rx="12" ry="12"
        fill="var(--surface-2, #fafbff)" stroke="var(--border, #2a2f45)" strokeWidth="2" />
      {/* Corner pip top-left */}
      <text x="14" y="26" fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="14" fill="var(--text, #1a1d2c)">?</text>
      {/* Corner pip bottom-right (rotated) */}
      <g transform="rotate(180 106 134)">
        <text x="100" y="138" fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="14" fill="var(--text, #1a1d2c)">?</text>
      </g>
      {/* Eyes */}
      <circle cx="46" cy="68" r="5" fill="var(--text, #1a1d2c)" />
      <circle cx="74" cy="68" r="5" fill="var(--text, #1a1d2c)" />
      {/* Brow lines (puzzled) */}
      <path d="M38 56 L52 62" stroke="var(--text, #1a1d2c)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M82 56 L68 62" stroke="var(--text, #1a1d2c)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Mouth — wavy "hmm" */}
      <path d="M44 96 Q50 90 56 96 T68 96 T80 96"
        stroke="var(--text, #1a1d2c)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Floating question mark */}
      <text x="60" y="130" textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold"
        fontSize="28" fill="var(--accent, #5b6cff)">?</text>
    </svg>
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
  isNew = false,
  members,
  isFavorite = false,
  onToggleFavorite,
  highlightQuery,
}: {
  family: GameFamily;
  category: GameCategory;
  memberCount: number;
  onClick: () => void;
  testIdOverride?: string | undefined;
  userRating?: number | undefined;
  isNew?: boolean | undefined;
  members: GamePlugin[];
  isFavorite?: boolean | undefined;
  onToggleFavorite?: ((id: string) => void) | undefined;
  highlightQuery?: string | undefined;
}): JSX.Element {
  // Family badge: NEW wins outright, otherwise CHALLENGING/QUICK if any
  // member is curated, otherwise POPULAR by best-rating threshold.
  const memberIds = members.map((m) => m.id);
  const familyChallenging = memberIds.some((id) => CHALLENGING_GAME_IDS.has(id));
  const familyQuick = memberIds.some((id) => QUICK_GAME_IDS.has(id));
  let badgeKind: BadgeKind | null = null;
  if (isNew) badgeKind = "new";
  else if (familyChallenging) badgeKind = "challenging";
  else if (familyQuick) badgeKind = "quick";
  else if (userRating >= 4) badgeKind = "popular";
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
    <div className="lobby-tile-wrap">
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
      {badgeKind && (
        <span className="tile-badge-slot">
          <Badge kind={badgeKind} testId={`tile-badge-${family.id}`} />
        </span>
      )}
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
      <div className="tile-title lobby-tile-title">
        {highlightQuery && highlightQuery.length >= TITLE_HIGHLIGHT_MIN_LEN
          ? highlightMatch(family.label, highlightQuery)
          : family.label}
      </div>
      <div className="tile-desc">{family.description}</div>
      {/* Family chips reuse the first member's id as the meta basis —
         variants in a family typically share playtime / difficulty
         characteristics, so a single representative read is plenty.
         The trailing "+N variants" chip surfaces the family size
         inline (the upper-right badge stays for at-a-glance count). */}
      {members[0] && (
        <div className="tile-chips-row">
          <TileMetaChips gameId={members[0].id} />
          {memberCount > 1 && (
            <span className="tile-chip tile-chip-variants" aria-label={`${memberCount - 1} more variants`}>
              +{memberCount - 1} variant{memberCount - 1 === 1 ? "" : "s"}
            </span>
          )}
        </div>
      )}
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
    {onToggleFavorite && (
      /* Family-level heart toggles the first member; the chip
         treatment still lights when any member is hearted, so the
         picker remains the place to manage variants individually. */
      <HeartToggle
        id={family.id}
        active={isFavorite}
        onToggle={() => {
          const first = members[0];
          if (first) onToggleFavorite(first.id);
        }}
      />
    )}
    {tooltip}
    </div>
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
  isNew = false,
  userRating = 0,
  isFavorite = false,
  onToggleFavorite,
  highlightQuery,
}: {
  game: GamePlugin;
  familyId: string | undefined;
  onOpenFamily: (familyId: string) => void;
  isNew?: boolean;
  userRating?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  highlightQuery?: string;
}): JSX.Element {
  const featuredBadge = pickBadgeKind(g.id, isNew, userRating, {
    featuredIds: FEATURED_IDS,
    topRatedThreshold: TOP_RATED_THRESHOLD,
  });
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
      <div className="lobby-tile-wrap">
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
        {featuredBadge && (
          <span className="tile-badge-slot">
            <Badge kind={featuredBadge} testId={`tile-badge-${familyId}`} />
          </span>
        )}
        <div className="tile-meta">
          <span className={`tile-cat tile-cat-${CATEGORY_TAG[g.category]}`}>
            <span className="tile-cat-glyph" aria-hidden="true">{CATEGORY_GLYPHS[g.category]}</span>
            {CATEGORY_LABELS[g.category]}
          </span>
        </div>
        <div className="tile-title lobby-tile-title">
        {highlightQuery && highlightQuery.length >= TITLE_HIGHLIGHT_MIN_LEN
          ? highlightMatch(g.title, highlightQuery)
          : g.title}
      </div>
        <div className="tile-desc">{g.description}</div>
        {/* Family-anchor featured tile: the anchor game (`g`) is a
           representative member, so its eta/difficulty stand in for
           the family. Reuses TileMetaChips' existing test ids. */}
        <TileMetaChips gameId={g.id} />
        <div className="tile-foot">
          <span className="tile-players">Multiple variants</span>
          <span className="tile-cta" aria-hidden="true">Pick</span>
        </div>
      </button>
      {onToggleFavorite && (
        <HeartToggle
          id={familyId}
          active={isFavorite}
          onToggle={() => onToggleFavorite(g.id)}
        />
      )}
      {tooltip}
      </div>
    );
  }
  return (
    <div className="lobby-tile-wrap">
    <Link
      to={`/play/${g.id}`}
      className={`tile tile--cat-${CATEGORY_TAG[g.category]} tile--featured`}
      data-testid={`feat-tile-${g.id}`}
      {...handlers}
    >
      <span className="tile-stripe" aria-hidden="true" />
      <span className="tile-sheen" aria-hidden="true" />
      {featuredBadge && (
        <span className="tile-badge-slot">
          <Badge kind={featuredBadge} testId={`feat-tile-badge-${g.id}`} />
        </span>
      )}
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
      <div className="tile-title lobby-tile-title">
        {highlightQuery && highlightQuery.length >= TITLE_HIGHLIGHT_MIN_LEN
          ? highlightMatch(g.title, highlightQuery)
          : g.title}
      </div>
      <div className="tile-desc">{g.description}</div>
      <TileMetaChips gameId={g.id} />
      <div className="tile-foot">
        <span className="tile-players">
          {g.players.min === g.players.max ? `${g.players.min} player${g.players.min === 1 ? "" : "s"}` : `${g.players.min}–${g.players.max} players`}
        </span>
        <span className="tile-cta" aria-hidden="true">Play</span>
      </div>
    </Link>
    {onToggleFavorite && (
      <HeartToggle
        id={`feat-${g.id}`}
        active={isFavorite}
        onToggle={() => onToggleFavorite(g.id)}
      />
    )}
    {tooltip}
    </div>
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
  autoOpenedFamilyId = null,
}: {
  family: GameFamily;
  members: GamePlugin[];
  ratings: Record<string, number>;
  onClose: () => void;
  /**
   * When this picker was opened via the `/?family=<id>` deep-link, this
   * prop matches the family id; the dialog renders an extra
   * `data-testid="lobby-auto-family-<id>"` marker so tests can verify
   * the auto-open path. `null` for the normal click-to-open case.
   */
  autoOpenedFamilyId?: string | null;
}): JSX.Element {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<PickerSort>("alpha");
  const lastPlayed = useMemo(() => readLastPlayed(), []);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // Trap Tab/Shift-Tab inside the picker dialog and restore focus on close.
  useFocusTrap(pickerRef, true);

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
      data-auto-family={autoOpenedFamilyId === family.id ? family.id : undefined}
      onClick={onClose}
    >
      {autoOpenedFamilyId === family.id && (
        <span
          hidden
          aria-hidden="true"
          data-testid={`lobby-auto-family-${family.id}`}
        />
      )}
      <div className="lobby-picker" onClick={(e) => e.stopPropagation()} ref={pickerRef} tabIndex={-1}>
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

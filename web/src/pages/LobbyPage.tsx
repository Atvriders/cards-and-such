import { useDeferredValue, useEffect, useMemo, useRef, useState, useCallback, type KeyboardEvent as ReactKeyboardEvent } from "react";
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
import {
  readFavorites,
  toggleFavorite as toggleFavoritePersist,
  getLastPlayed,
  readHiddenGames,
  hideGame as hideGamePersist,
} from "../platform/userdata.js";
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
/** localStorage key persisting whether the new-user keyboard tip is dismissed. */
const KBD_TIP_DISMISSED_KEY = "cards-lobby-kbd-tip-dismissed";
/** localStorage key persisting the lobby list pagination mode. */
const LIST_MODE_STORAGE_KEY = "cards-lobby-list-mode";
/** localStorage key persisting the desktop left-drawer collapsed state. */
const DRAWER_COLLAPSED_KEY = "cards-lobby-drawer-collapsed";
/** localStorage key persisting the desktop left-drawer resize width (px). */
const DRAWER_WIDTH_KEY = "cards-lobby-drawer-width";
/** Default drawer width when no override is persisted (matches CSS rule). */
const DRAWER_WIDTH_DEFAULT = 220;
/** Minimum drag-resize width (px) — labels & counts must stay legible. */
const DRAWER_WIDTH_MIN = 200;
/** Maximum drag-resize width (px) — avoids overlapping the lobby grid. */
const DRAWER_WIDTH_MAX = 360;

function readPersistedDrawerWidth(): number {
  try {
    if (typeof localStorage === "undefined") return DRAWER_WIDTH_DEFAULT;
    const raw = localStorage.getItem(DRAWER_WIDTH_KEY);
    if (raw === null) return DRAWER_WIDTH_DEFAULT;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) return DRAWER_WIDTH_DEFAULT;
    return Math.min(DRAWER_WIDTH_MAX, Math.max(DRAWER_WIDTH_MIN, n));
  } catch { return DRAWER_WIDTH_DEFAULT; }
}

/** localStorage key persisting the lobby sort mode. */
const SORT_STORAGE_KEY = "cards-lobby-sort";

/**
 * Sort modes available in the lobby's sort dropdown. "alphabetical" is
 * the default and matches the canonical ordering of `allEntries`. The
 * other modes layer a stable secondary sort over the alphabetised
 * baseline so ties order predictably (e.g. two unplayed games for
 * "most-played" fall back to alphabetical).
 */
type SortMode = "alphabetical" | "most-played" | "newest" | "top-rated";

const SORT_LABELS: Record<SortMode, string> = {
  "alphabetical": "Alphabetical",
  "most-played": "Most played",
  "newest": "Newest",
  "top-rated": "Top rated",
};

const SORT_MODES: readonly SortMode[] = [
  "alphabetical",
  "most-played",
  "newest",
  "top-rated",
] as const;

function readPersistedSort(): SortMode {
  try {
    if (typeof localStorage === "undefined") return "alphabetical";
    const raw = localStorage.getItem(SORT_STORAGE_KEY);
    if (
      raw === "alphabetical"
      || raw === "most-played"
      || raw === "newest"
      || raw === "top-rated"
    ) {
      return raw;
    }
  } catch { /* ignore */ }
  return "alphabetical";
}

function writePersistedSort(mode: SortMode): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(SORT_STORAGE_KEY, mode);
  } catch { /* ignore */ }
}

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

/** localStorage key persisting the lobby grid density preference. */
const DENSITY_STORAGE_KEY = "cards-lobby-density";

/**
 * Three packing levels for the lobby grid:
 *  - "compact":     smaller tiles, tight gap — fit more on screen at once.
 *  - "comfortable" (default): the original lobby sizing.
 *  - "spacious":    larger tiles, generous gap — easier touch targets.
 *
 * The active mode is mirrored as a `data-density` attribute on the grid
 * container so all sizing is driven by CSS rather than inline styles.
 */
type DensityMode = "compact" | "comfortable" | "spacious";

const DENSITY_MODES: readonly DensityMode[] = [
  "compact",
  "comfortable",
  "spacious",
] as const;

const DENSITY_LABELS: Record<DensityMode, string> = {
  "compact": "Compact",
  "comfortable": "Comfortable",
  "spacious": "Spacious",
};

function readPersistedDensity(): DensityMode {
  try {
    if (typeof localStorage === "undefined") return "comfortable";
    const raw = localStorage.getItem(DENSITY_STORAGE_KEY);
    if (raw === "compact" || raw === "comfortable" || raw === "spacious") {
      return raw;
    }
  } catch { /* ignore */ }
  return "comfortable";
}

function writePersistedDensity(mode: DensityMode): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(DENSITY_STORAGE_KEY, mode);
  } catch { /* ignore */ }
}

/** localStorage key persisting the lobby grid/list view-mode preference. */
const VIEW_STORAGE_KEY = "cards-lobby-view";

/**
 * Two ways to render the lobby's main results list:
 *  - "grid" (default): the multi-column tile grid, sized by `data-density`.
 *  - "list":           single-column rows with a horizontal layout —
 *                      stripe (icon) + title + meta + favourite heart.
 *
 * The active mode is mirrored as a `data-view` attribute on the grid
 * container so all layout differences are CSS-driven (see LobbyPage.css).
 */
type ViewMode = "grid" | "list";

function readPersistedView(): ViewMode {
  try {
    if (typeof localStorage === "undefined") return "grid";
    const raw = localStorage.getItem(VIEW_STORAGE_KEY);
    if (raw === "grid" || raw === "list") return raw;
  } catch { /* ignore */ }
  return "grid";
}

function writePersistedView(mode: ViewMode): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
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

type Filter = "all" | "top-rated" | "favorites" | "recently-played" | "hidden" | GameCategory;
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
      || raw === "hidden"
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

/**
 * localStorage key persisting the user'''s manual drag-reorder of favorite
 * tiles. Stored as a JSON array of stable entry ids (game-<id> for an
 * un-grouped game, fam-<id> for a family tile). Entries not present in
 * the saved order keep their default insertion order, appended after the
 * ordered ones so newly favorited tiles surface predictably without
 * forcing the user to re-drag.
 */
const FAVORITES_ORDER_KEY = "cards-favorites-order";

function readFavoritesOrder(): string[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(FAVORITES_ORDER_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch { return []; }
}

function writeFavoritesOrder(order: string[]): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(FAVORITES_ORDER_KEY, JSON.stringify(order));
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

/**
 * Stable string id for a lobby entry. Used as the persistence key in
 * cards-favorites-order so the same tile reorders consistently across
 * reloads even though the in-memory LobbyEntry instance is recreated on
 * every mount. Family vs. game ids share separate namespaces so we
 * prefix accordingly.
 */
function entryDragId(e: LobbyEntry): string {
  return e.kind === "game" ? `game-${e.game.id}` : `fam-${e.family.id}`;
}

export default function LobbyPage(): JSX.Element {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>(() => readPersistedFilter());
  const [listMode, setListMode] = useState<ListMode>(() => readPersistedListMode());
  const [sortMode, setSortMode] = useState<SortMode>(() => readPersistedSort());
  const [density, setDensity] = useState<DensityMode>(() => readPersistedDensity());
  const [viewMode, setViewMode] = useState<ViewMode>(() => readPersistedView());
  // Whether the mobile-only ".lobby-overflow" popover is currently open.
  // The overflow button only renders below 700px (CSS media query) and
  // hosts the less-frequently-used density + view controls there to keep
  // the toolbar uncluttered on phones.
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement | null>(null);
  // Close the overflow popover when clicking outside of it or pressing
  // Escape. Mirrors the small-popover affordance used elsewhere.
  useEffect(() => {
    if (!overflowOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const root = overflowRef.current;
      if (root && !root.contains(e.target as Node)) setOverflowOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverflowOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [overflowOpen]);
  // Infinite-scroll high-water mark (number of entries appended so far);
  // pagination mode ignores this and slices by `page` instead.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // 1-based page index used in pagination mode.
  const [page, setPage] = useState(1);
  const [openFamilyId, setOpenFamilyId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>(() => readRatings());
  const [favSet, setFavSet] = useState<Set<string>>(() => readFavorites());
  // Manual drag-reorder of the favorites list. Only consulted when the
  // active filter is "favorites"; other filters keep their intrinsic
  // sort. Entries not present here keep their default (insertion)
  // position and are appended after the ordered ones.
  const [favOrder, setFavOrder] = useState<string[]>(() => readFavoritesOrder());
  // Drag-id of the tile currently being dragged. null outside of an
  // active drag.
  const [draggingFavId, setDraggingFavId] = useState<string | null>(null);
  const [hiddenSet, setHiddenSet] = useState<Set<string>>(() => readHiddenGames());
  const [lastPlayed, setLastPlayed] = useState<Record<string, number>>(() => {
    try { return getLastPlayed(); } catch { return {}; }
  });
  const [drawerCollapsed, setDrawerCollapsed] = useState<boolean>(() => {
    try {
      if (typeof localStorage === "undefined") return false;
      return localStorage.getItem(DRAWER_COLLAPSED_KEY) === "1";
    } catch { return false; }
  });
  // Roving-tabindex order for the left drawer's category rows. The
  // sequence mirrors the visual render order of `<DrawerLink>` calls
  // below and is used by ↑/↓/Home/End to walk siblings without breaking
  // the focus-trap or stealing Tab from the rest of the page.
  const drawerOrder = useMemo<string[]>(
    () => ["all", ...CATEGORY_ORDER, "favorites", "top-rated", "recently-played"],
    [],
  );
  // Tab-in to the drawer should land on the currently active filter so
  // the keyboard user starts where the visual highlight is. Subsequent
  // ↑/↓ moves are tracked by user focus, not the `filter` state.
  const [drawerFocusIdx, setDrawerFocusIdx] = useState<number>(0);
  // Keep the roving tab-stop aligned with the active filter when the
  // user changes it via chips/stat-buttons (i.e. without ever having
  // touched the drawer). Once the drawer itself owns focus, the keydown
  // handler reads `document.activeElement` and overrides this.
  useEffect(() => {
    const idx = drawerOrder.indexOf(filter);
    if (idx >= 0) setDrawerFocusIdx(idx);
  }, [filter, drawerOrder]);
  const onDrawerKeyDown = useCallback((e: ReactKeyboardEvent<HTMLElement>) => {
    const key = e.key;
    if (
      key !== "ArrowDown" && key !== "ArrowUp"
      && key !== "Home" && key !== "End"
      && key !== "Enter" && key !== " " && key !== "Spacebar"
    ) return;
    const nav = e.currentTarget;
    const rows = Array.from(
      nav.querySelectorAll<HTMLButtonElement>('[data-testid^="lobby-drawer-cat-"]'),
    );
    if (rows.length === 0) return;
    const activeEl = (typeof document !== "undefined" ? document.activeElement : null) as HTMLElement | null;
    let idx = rows.findIndex((r) => r === activeEl);
    if (idx < 0) idx = drawerFocusIdx;
    if (idx < 0 || idx >= rows.length) idx = 0;
    if (key === "Enter" || key === " " || key === "Spacebar") {
      // Activate the currently-focused row. Buttons fire `click` on
      // Enter natively, but we preventDefault on Space so the page
      // doesn't scroll while the drawer has focus, then synthesize the
      // click ourselves for parity with Enter.
      e.preventDefault();
      rows[idx]?.click();
      return;
    }
    let next = idx;
    if (key === "ArrowDown") next = (idx + 1) % rows.length;
    else if (key === "ArrowUp") next = (idx - 1 + rows.length) % rows.length;
    else if (key === "Home") next = 0;
    else if (key === "End") next = rows.length - 1;
    e.preventDefault();
    setDrawerFocusIdx(next);
    rows[next]?.focus();
  }, [drawerFocusIdx]);
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
  // Inline keyboard-shortcut tip — shown only to brand-new users (zero
  // games played) on the empty default view, and dismissible. The
  // dismissal flag is persisted under `cards-lobby-kbd-tip-dismissed`
  // so the tip stays gone across reloads even if the user hasn't yet
  // played a game.
  const [kbdTipDismissed, setKbdTipDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(KBD_TIP_DISMISSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const dismissKbdTip = useCallback(() => {
    setKbdTipDismissed(true);
    try {
      window.localStorage.setItem(KBD_TIP_DISMISSED_KEY, "1");
    } catch {
      /* localStorage unavailable — tip stays gone for this session. */
    }
  }, []);
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

  // Mirror — keep the hidden-games set fresh across tabs and on focus
  // regain so a wipe via Settings → Data → "Show hidden games" surfaces
  // the now-visible tiles immediately.
  useEffect(() => {
    const refresh = () => setHiddenSet(readHiddenGames());
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === "cards-hidden-games") refresh();
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

  // Persist grid-density changes; rehydrates on next mount.
  useEffect(() => {
    writePersistedDensity(density);
  }, [density]);

  // Persist view-mode (grid/list) changes; rehydrates on next mount.
  useEffect(() => {
    writePersistedView(viewMode);
  }, [viewMode]);

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

  // Hide a single id (game or family) from every lobby filter except
  // the dedicated "Hidden" chip. Persisted via {@link hideGamePersist}
  // and mirrored into in-memory state so visible tiles drop out without
  // a re-read pass.
  const onHideGame = useCallback((id: string) => {
    if (!id) return;
    hideGamePersist(id);
    setHiddenSet((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
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
  // Inline keyboard-tip visibility — gated to brand-new users on the
  // empty default view (no filter, no search). Once dismissed, stays
  // hidden via the persisted flag handled above.
  const showKbdTip =
    !kbdTipDismissed && !query && filter === "all" && totalPlays === 0;
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
  // Predicate: is this lobby entry currently hidden?
  // We treat a family as hidden if its family id is in the hidden set
  // (the menu hides the family as a unit; per-variant hiding lives in
  // the picker, not the lobby tile menu).
  const isEntryHidden = useCallback(
    (e: LobbyEntry): boolean =>
      e.kind === "game"
        ? hiddenSet.has(e.game.id)
        : hiddenSet.has(e.family.id),
    [hiddenSet],
  );

  // Registry-order index per game id — used as a proxy for "added at"
  // since plugins lack timestamps. Higher index = newer.
  const registryIndex = useMemo(() => {
    const m = new Map<string, number>();
    let i = 0;
    for (const g of GAMES) {
      if (g == null) continue;
      m.set(g.id, i++);
    }
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    let list: LobbyEntry[];
    let usesIntrinsicSort = false;
    if (filter === "hidden") {
      // Dedicated chip: surface ONLY the hidden tiles so the user can
      // review what they've stashed (and clear via Settings).
      list = allEntries.filter(isEntryHidden);
    } else if (filter === "all") list = allEntries.filter((e) => !isEntryHidden(e));
    else if (filter === "top-rated") {
      list = allEntries.filter((e) => !isEntryHidden(e) && entryRating(e) >= TOP_RATED_THRESHOLD);
    } else if (filter === "favorites") {
      list = allEntries.filter((e) =>
        !isEntryHidden(e) && (
          e.kind === "game"
            ? favSet.has(e.game.id)
            : e.members.some((m) => favSet.has(m.id))
        ),
      );
      // Apply the user'''s manual drag-reorder. Entries with a saved
      // index sort by that index ascending; everything else keeps its
      // default (alphabetical) position by sorting after ordered entries
      // with a stable secondary tie-breaker on sortKey.
      const orderIndex = new Map<string, number>();
      favOrder.forEach((id, i) => orderIndex.set(id, i));
      const HIGH = Number.MAX_SAFE_INTEGER;
      list = list.slice().sort((a, b) => {
        const ai = orderIndex.get(entryDragId(a)) ?? HIGH;
        const bi = orderIndex.get(entryDragId(b)) ?? HIGH;
        if (ai !== bi) return ai - bi;
        return compareTitles(a.sortKey, b.sortKey);
      });
      // Mark this branch as having an intrinsic sort so the generic
      // sort-mode block below doesn'''t override our drag order.
      usesIntrinsicSort = true;
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
        .filter((e) => !isEntryHidden(e) && stampOf(e) > 0)
        .slice()
        .sort((a, b) => stampOf(b) - stampOf(a));
      usesIntrinsicSort = true;
    } else {
      list = allEntries.filter((e) => !isEntryHidden(e) && e.category === filter);
    }
    if (q) {
      // Each entry carries a precomputed lowercase `haystack` covering the
      // family label / description / member titles / member descriptions,
      // so the per-keystroke filter is a single `indexOf` per entry rather
      // than re-lowercasing every field. Same matching semantics as before
      // (family surfaces if any member matches; standalone matches title /
      // category / description).
      list = list.filter((e) => e.haystack.includes(q));
    }
    // Apply user-selected sort. "alphabetical" is a no-op (allEntries is
    // already alphabetised). "recently-played" has its own intrinsic sort
    // by last-played timestamp, so we leave it alone. All other modes
    // sort a copy with a stable secondary alphabetical fallback so ties
    // (e.g. two unplayed games for "most-played") order predictably.
    if (!usesIntrinsicSort && sortMode !== "alphabetical") {
      const playsOf = (e: LobbyEntry): number => {
        const perGame = stats.perGame ?? {};
        if (e.kind === "game") return perGame[e.game.id]?.played ?? 0;
        let total = 0;
        for (const m of e.members) total += perGame[m.id]?.played ?? 0;
        return total;
      };
      const newnessOf = (e: LobbyEntry): number => {
        if (e.kind === "game") return registryIndex.get(e.game.id) ?? -1;
        let best = -1;
        for (const m of e.members) {
          const v = registryIndex.get(m.id) ?? -1;
          if (v > best) best = v;
        }
        return best;
      };
      const tie = (a: LobbyEntry, b: LobbyEntry): number =>
        compareTitles(a.sortKey, b.sortKey);
      list = list.slice().sort((a, b) => {
        if (sortMode === "most-played") {
          const d = playsOf(b) - playsOf(a);
          return d !== 0 ? d : tie(a, b);
        }
        if (sortMode === "newest") {
          const d = newnessOf(b) - newnessOf(a);
          return d !== 0 ? d : tie(a, b);
        }
        // top-rated
        const d = entryRating(b) - entryRating(a);
        return d !== 0 ? d : tie(a, b);
      });
    }
    return list;
  }, [allEntries, filter, deferredQuery, entryRating, favSet, favOrder, lastPlayed, isEntryHidden, sortMode, stats, registryIndex]);

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

  // Persist sort mode + reset pagination so a re-sort starts from page 1
  // rather than stranding the user on what is now a different page of
  // entries.
  useEffect(() => {
    writePersistedSort(sortMode);
    setVisibleCount(PAGE_SIZE);
    setPage(1);
  }, [sortMode]);

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
    const firstTile = tiles[0];
    if (!firstTile) return;
    const current = tiles.findIndex((t) => t === document.activeElement);
    if (current < 0) return; // focus isn't on a grid tile — leave the event alone
    // Compute columns by counting tiles whose top matches the first tile's top.
    const firstTop = firstTile.getBoundingClientRect().top;
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
    const currentTile = tiles[current];
    const nextTile = tiles[next];
    if (!currentTile || !nextTile) return;
    currentTile.tabIndex = -1;
    nextTile.tabIndex = 0;
    nextTile.focus();
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

  // -----------------------------------------------------------------
  // Drag-reorder of favorite tiles (only active in favorites filter).
  // Implemented as event delegation on the lobby grid:
  //   - dragstart records the source tile'''s stable drag-id
  //   - dragover preventDefault enables the drop target
  //   - drop reorders cards-favorites-order and writes through to
  //     localStorage. Click navigation is untouched — a real drag
  //     suppresses the synthetic click on every modern browser, and
  //     the underlying <Link>/<button> still fires onClick for clicks.
  // We stamp draggable=true and data-fav-drag-id on each visible tile
  // via DOM rather than threading new props through GameCard /
  // FamilyCard so other filters''' tiles stay completely unaffected.
  // -----------------------------------------------------------------
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const tiles = grid.querySelectorAll<HTMLElement>(".tile");
    const enable = filter === "favorites";
    tiles.forEach((tile, i) => {
      const entry = visible[i];
      if (enable && entry) {
        tile.setAttribute("draggable", "true");
        tile.setAttribute("data-fav-drag-id", entryDragId(entry));
      } else {
        tile.removeAttribute("draggable");
        tile.removeAttribute("data-fav-drag-id");
      }
    });
  }, [filter, visible]);

  const onFavDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (filter !== "favorites") return;
    const tile = (e.target as HTMLElement | null)?.closest<HTMLElement>(".tile");
    if (!tile) return;
    const id = tile.getAttribute("data-fav-drag-id");
    if (!id) return;
    setDraggingFavId(id);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", id); } catch { /* ignore */ }
    }
  }, [filter]);

  const onFavDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (filter !== "favorites" || draggingFavId == null) return;
    // Prevent default so the drop event fires.
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  }, [filter, draggingFavId]);

  const onFavDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (filter !== "favorites") return;
    const src = draggingFavId;
    setDraggingFavId(null);
    if (!src) return;
    const tile = (e.target as HTMLElement | null)?.closest<HTMLElement>(".tile");
    const dst = tile?.getAttribute("data-fav-drag-id") ?? null;
    if (!dst || dst === src) return;
    e.preventDefault();
    // Build the next order from the current visible favorites order so
    // entries the user has never touched still get persisted into
    // favOrder on first drag.
    const grid = gridRef.current;
    if (!grid) return;
    const currentIds = Array.from(grid.querySelectorAll<HTMLElement>(".tile"))
      .map((t) => t.getAttribute("data-fav-drag-id"))
      .filter((v): v is string => Boolean(v));
    const fromIdx = currentIds.indexOf(src);
    const toIdx = currentIds.indexOf(dst);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = currentIds.slice();
    const [moved] = next.splice(fromIdx, 1);
    if (moved !== undefined) next.splice(toIdx, 0, moved);
    setFavOrder(next);
    writeFavoritesOrder(next);
  }, [filter, draggingFavId]);

  const onFavDragEnd = useCallback(() => {
    setDraggingFavId(null);
  }, []);

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
    if (filter === "hidden") {
      pool = allGames.filter((g) => hiddenSet.has(g.id));
    } else if (filter === "all") {
      pool = allGames.filter((g) => !hiddenSet.has(g.id));
    } else if (filter === "top-rated") {
      pool = allGames.filter((g) => !hiddenSet.has(g.id) && (ratings[g.id] ?? 0) >= TOP_RATED_THRESHOLD);
    } else if (filter === "favorites") {
      pool = allGames.filter((g) => !hiddenSet.has(g.id) && favSet.has(g.id));
    } else if (filter === "recently-played") {
      pool = allGames.filter((g) => !hiddenSet.has(g.id) && (lastPlayed[g.id] ?? 0) > 0);
    } else {
      pool = allGames.filter((g) => !hiddenSet.has(g.id) && g.category === filter);
    }
    const final = pool.length > 0 ? pool : allGames;
    if (final.length === 0) return;
    const pick = final[Math.floor(Math.random() * final.length)]!;
    navigate(`/play/${pick.id}`);
  }, [filter, navigate, ratings, favSet, lastPlayed, hiddenSet]);

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

  // Count of currently-hidden ids — drives the "Hidden" chip badge.
  // Counts each id (game or family) at face value; mixed buckets are
  // fine since the chip is a discoverability hint, not a strict total.
  const hiddenCount = hiddenSet.size;

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
        <nav
          className="lobby-drawer-nav"
          role="tablist"
          aria-label="Filter by category (drawer)"
          onKeyDown={onDrawerKeyDown}
        >
          <DrawerLink
            id="all"
            active={filter === "all"}
            onClick={() => {
              setFilter("all");
              setDrawerFocusIdx(drawerOrder.indexOf("all"));
            }}
            glyph="◎"
            label={t("lobby.all_games")}
            count={GAMES.length}
            collapsed={drawerCollapsed}
            tabIndex={drawerFocusIdx === drawerOrder.indexOf("all") ? 0 : -1}
          />
          {CATEGORY_ORDER.map((cat) => (
            <DrawerLink
              key={cat}
              id={cat}
              active={filter === cat}
              onClick={() => {
                setFilter(cat);
                setDrawerFocusIdx(drawerOrder.indexOf(cat));
              }}
              glyph={CATEGORY_GLYPHS[cat]}
              label={CATEGORY_LABELS[cat]}
              count={categoryCounts[cat]}
              collapsed={drawerCollapsed}
              tabIndex={drawerFocusIdx === drawerOrder.indexOf(cat) ? 0 : -1}
            />
          ))}
          <div className="lobby-drawer-sep" aria-hidden="true" />
          <DrawerLink
            id="favorites"
            active={filter === "favorites"}
            onClick={() => {
              setFilter("favorites");
              setDrawerFocusIdx(drawerOrder.indexOf("favorites"));
            }}
            glyph="♥"
            label={t("lobby.chip.favorites")}
            count={favSet.size}
            collapsed={drawerCollapsed}
            tabIndex={drawerFocusIdx === drawerOrder.indexOf("favorites") ? 0 : -1}
          />
          <DrawerLink
            id="top-rated"
            active={filter === "top-rated"}
            onClick={() => {
              setFilter("top-rated");
              setDrawerFocusIdx(drawerOrder.indexOf("top-rated"));
            }}
            glyph="★"
            label={t("lobby.chip.top_rated")}
            count={topRatedCount}
            collapsed={drawerCollapsed}
            tabIndex={drawerFocusIdx === drawerOrder.indexOf("top-rated") ? 0 : -1}
          />
          <DrawerLink
            id="recently-played"
            active={filter === "recently-played"}
            onClick={() => {
              setFilter("recently-played");
              setDrawerFocusIdx(drawerOrder.indexOf("recently-played"));
            }}
            glyph="↺"
            label={t("lobby.chip.recently_played")}
            count={recentlyPlayedCount}
            collapsed={drawerCollapsed}
            tabIndex={drawerFocusIdx === drawerOrder.indexOf("recently-played") ? 0 : -1}
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

      {showKbdTip && (
        <div
          className="lobby-kbd-tip"
          data-testid="lobby-kbd-tip"
          role="note"
          aria-label="Keyboard shortcut tip"
        >
          <span className="lobby-kbd-tip-text">
            Press <kbd>G</kbd> <kbd>H</kbd> to come back here, <kbd>?</kbd> for shortcuts
          </span>
          <button
            type="button"
            className="lobby-kbd-tip-dismiss"
            data-testid="lobby-kbd-tip-dismiss"
            onClick={dismissKbdTip}
            aria-label="Dismiss keyboard shortcut tip"
          >×</button>
        </div>
      )}

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

        <ChipStrip activeFilter={filter}>
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
          <Chip
            active={filter === "hidden"}
            onClick={() => setFilter("hidden")}
            count={hiddenCount}
            testId="chip-hidden"
            glyph="◌"
          >Hidden</Chip>
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
        </ChipStrip>

        {/* Sort dropdown — applies on top of the active filter / search.
            Persisted to localStorage under `cards-lobby-sort` (default
            alphabetical). The "recently-played" filter has its own
            intrinsic ordering and ignores this control. */}
        <label className="lobby-sort">
          <span className="lobby-sort-label">Sort</span>
          <select
            className="lobby-sort-select"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            data-testid="lobby-sort"
            aria-label="Sort games"
          >
            {SORT_MODES.map((mode) => (
              <option
                key={mode}
                value={mode}
                data-testid={`lobby-sort-${mode}`}
              >{SORT_LABELS[mode]}</option>
            ))}
          </select>
        </label>
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
                aria-label={`${g.title}, recommended, ${CATEGORY_LABELS[g.category]}, ${
                  favSet.has(g.id) ? "favorited" : "not favorited"
                }`}
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
                    : filter === "hidden"
                      ? "Hidden"
                      : CATEGORY_LABELS[filter]}
            {query && (
              <span className="lobby-section-count">
                {" · "}
                {filtered.length.toLocaleString()} match{filtered.length === 1 ? "" : "es"}
                {matchedGameCount !== filtered.length && ` (${matchedGameCount.toLocaleString()} games)`}
              </span>
            )}
          </h2>
          {/* Toolbar row hosting the section-level controls. On wide
              viewports each toggle sits inline with consistent gap; on
              narrow viewports (<700px) the less-used density + view
              controls collapse behind ".lobby-overflow" popover. */}
          <div
            className="lobby-toolbar"
            role="group"
            aria-label="Lobby toolbar"
            data-testid="lobby-toolbar"
          >
            {/* Two-state icon toggle for grid vs list view. Persisted in
                localStorage under `cards-lobby-view`; mirrored as
                `data-view` on `.lobby-grid` so the layout switch is
                CSS-driven (see `.lobby-grid[data-view="list"]`). */}
            <div
              className="lobby-view-toggle lobby-toolbar-secondary"
              role="group"
              aria-label="Lobby view"
              data-testid="lobby-view-toggle"
            >
              <button
                type="button"
                className={`lobby-view-toggle-btn${viewMode === "grid" ? " is-active" : ""}`}
                aria-pressed={viewMode === "grid"}
                aria-label="Grid view"
                title="Grid view"
                onClick={() => setViewMode("grid")}
                data-testid="lobby-view-grid"
              >
                <svg
                  className="lobby-view-toggle-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button
                type="button"
                className={`lobby-view-toggle-btn${viewMode === "list" ? " is-active" : ""}`}
                aria-pressed={viewMode === "list"}
                aria-label="List view"
                title="List view"
                onClick={() => setViewMode("list")}
                data-testid="lobby-view-list"
              >
                <svg
                  className="lobby-view-toggle-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <circle cx="4" cy="6" r="1" />
                  <circle cx="4" cy="12" r="1" />
                  <circle cx="4" cy="18" r="1" />
                </svg>
              </button>
            </div>
            {/* Three-state pill toggle for grid density (compact/comfortable/
                spacious). Persisted in localStorage; mirrored as
                `data-density` on `.lobby-grid` so all sizing is CSS-driven. */}
            <div
              className="lobby-density-toggle lobby-toolbar-secondary"
              role="group"
              aria-label="Grid density"
              data-testid="lobby-density-toggle"
            >
              {DENSITY_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`lobby-density-toggle-btn${density === mode ? " is-active" : ""}`}
                  aria-pressed={density === mode}
                  onClick={() => setDensity(mode)}
                  data-testid={`lobby-density-${mode}`}
                >{DENSITY_LABELS[mode]}</button>
              ))}
            </div>
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
            {/* Mobile-only "•••" overflow trigger. Hidden via CSS on wide
                viewports; on narrow viewports (<700px) the secondary
                controls (density + view) are also hidden inline and re-
                surfaced inside this popover. */}
            <div
              className="lobby-overflow-wrap"
              ref={overflowRef}
            >
              <button
                type="button"
                className="lobby-overflow-btn"
                aria-label="More toolbar options"
                aria-haspopup="true"
                aria-expanded={overflowOpen}
                onClick={() => setOverflowOpen((v) => !v)}
                data-testid="lobby-overflow"
              >&#x2022;&#x2022;&#x2022;</button>
              {overflowOpen && (
                <div
                  className="lobby-overflow-pop"
                  role="dialog"
                  aria-label="More toolbar options"
                  data-testid="lobby-overflow-pop"
                >
                  <div className="lobby-overflow-row">
                    <span className="lobby-overflow-label">View</span>
                    <div
                      className="lobby-view-toggle"
                      role="group"
                      aria-label="Lobby view"
                    >
                      <button
                        type="button"
                        className={`lobby-view-toggle-btn${viewMode === "grid" ? " is-active" : ""}`}
                        aria-pressed={viewMode === "grid"}
                        aria-label="Grid view"
                        onClick={() => setViewMode("grid")}
                      >Grid</button>
                      <button
                        type="button"
                        className={`lobby-view-toggle-btn${viewMode === "list" ? " is-active" : ""}`}
                        aria-pressed={viewMode === "list"}
                        aria-label="List view"
                        onClick={() => setViewMode("list")}
                      >List</button>
                    </div>
                  </div>
                  <div className="lobby-overflow-row">
                    <span className="lobby-overflow-label">Density</span>
                    <div
                      className="lobby-density-toggle"
                      role="group"
                      aria-label="Grid density"
                    >
                      {DENSITY_MODES.map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          className={`lobby-density-toggle-btn${density === mode ? " is-active" : ""}`}
                          aria-pressed={density === mode}
                          onClick={() => setDensity(mode)}
                        >{DENSITY_LABELS[mode]}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {filterPending ? (
          <div className="lobby-grid" data-density={density} data-view={viewMode} data-testid="lobby-skeleton-grid" aria-busy="true">
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
            <div
              className="lobby-grid"
              data-density={density}
              data-view={viewMode}
              ref={gridRef}
              onKeyDown={onGridKeyDown}
              onDragStart={onFavDragStart}
              onDragOver={onFavDragOver}
              onDrop={onFavDrop}
              onDragEnd={onFavDragEnd}
            >
              {visible.map((entry) =>
                entry.kind === "game" ? (
                  <GameCard
                    key={`game-${entry.game.id}`}
                    game={entry.game}
                    userRating={ratings[entry.game.id] ?? 0}
                    isNew={newGameIds.has(entry.game.id)}
                    isFavorite={favSet.has(entry.game.id)}
                    onToggleFavorite={onToggleFavorite}
                    onHideGame={onHideGame}
                    highlightQuery={deferredQuery}
                    playCount={stats.perGame[entry.game.id]?.played ?? 0}
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
                    playCount={entry.members.reduce(
                      (sum, m) => sum + (stats.perGame[m.id]?.played ?? 0),
                      0,
                    )}
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
  /**
   * Roving-tabindex value. Only the currently-focused drawer row is `0`;
   * all other rows are `-1` so a single Tab lands on the drawer and ↑/↓
   * walks within it.
   */
  tabIndex: number;
}
/**
 * Single entry in the desktop left-drawer category nav. Renders the
 * glyph + label + count when expanded, glyph-only when collapsed (the
 * label still ships in `aria-label` and a native `title` so the icon
 * row remains usable). Clicking sets the same lobby `filter` state as
 * the chip strip — they stay in sync because they read/write the same
 * piece of state. Active row also carries `aria-current="true"` so
 * assistive tech announces the selected category and the CSS rule on
 * `[aria-current="true"]` paints a stronger visual highlight.
 */
function DrawerLink({ id, active, onClick, glyph, label, count, collapsed, tabIndex }: DrawerLinkProps): JSX.Element {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-current={active ? "true" : undefined}
      tabIndex={tabIndex}
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

/**
 * Horizontally scrollable wrapper for the lobby filter chips. On narrow
 * viewports the chip row would otherwise overflow / wrap awkwardly; this
 * keeps everything on a single line behind a scroll-snap track with
 * fade-mask edges (CSS) and optional desktop scroll arrows. The active
 * chip is also auto-scrolled into view whenever `activeFilter` changes
 * so a tap on a partially-clipped chip jumps it into the viewport.
 */
function ChipStrip({
  activeFilter,
  children,
}: {
  activeFilter: string;
  children: React.ReactNode;
}): JSX.Element {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // Recompute overflow state on scroll / resize. Tolerance of 1px guards
  // against fractional scroll positions on hi-DPI displays.
  const recompute = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 1);
    setCanRight(el.scrollLeft < max - 1);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    recompute();
    el.addEventListener("scroll", recompute, { passive: true });
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(recompute);
      ro.observe(el);
    } else if (typeof window !== "undefined") {
      window.addEventListener("resize", recompute);
    }
    return () => {
      el.removeEventListener("scroll", recompute);
      if (ro) ro.disconnect();
      else if (typeof window !== "undefined") window.removeEventListener("resize", recompute);
    };
  }, [recompute]);

  // When the active chip changes (programmatically or via tap), scroll
  // it into view so it's never clipped behind a fade-mask edge.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>(".lobby-chip.is-active");
    if (!active) return;
    const trackRect = el.getBoundingClientRect();
    const chipRect = active.getBoundingClientRect();
    const overflowsLeft = chipRect.left < trackRect.left + 24;
    const overflowsRight = chipRect.right > trackRect.right - 24;
    if (overflowsLeft || overflowsRight) {
      // `inline: "center"` centers the active chip in the viewport on
      // mobile; smooth scrolling is governed by the CSS `scroll-behavior`
      // declaration (which already respects prefers-reduced-motion).
      // jsdom (the test runtime) lacks scrollIntoView, so guard it.
      if (typeof active.scrollIntoView === "function") {
        active.scrollIntoView({ block: "nearest", inline: "center" });
      }
    }
  }, [activeFilter]);

  const nudge = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // Scroll by ~80% of viewport width — enough to advance, not so much
    // that the user loses their place between presses.
    const step = Math.max(120, el.clientWidth * 0.8);
    el.scrollBy({ left: dir * step });
  }, []);

  return (
    <div
      className={`lobby-chips-wrap${canLeft ? " has-overflow-left" : ""}${canRight ? " has-overflow-right" : ""}`}
    >
      <button
        type="button"
        className="lobby-chips-arrow lobby-chips-arrow--left"
        aria-label="Scroll filters left"
        tabIndex={-1}
        onClick={() => nudge(-1)}
        hidden={!canLeft}
      >‹</button>
      <div
        ref={trackRef}
        className="lobby-chips"
        role="tablist"
        aria-label="Filter by category"
      >
        {children}
      </div>
      <button
        type="button"
        className="lobby-chips-arrow lobby-chips-arrow--right"
        aria-label="Scroll filters right"
        tabIndex={-1}
        onClick={() => nudge(1)}
        hidden={!canRight}
      >›</button>
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
      aria-pressed={active}
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
  onHideGame,
  highlightQuery,
  playCount = 0,
}: {
  game: GamePlugin;
  userRating?: number;
  isNew?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onHideGame?: (id: string) => void;
  /**
   * If set (and at least TITLE_HIGHLIGHT_MIN_LEN chars), wrap the first
   * matching substring of the title in a `<mark>`. Mirrors SearchPage.
   */
  highlightQuery?: string;
  /**
   * Number of plays the user has logged for this game. When > 0 a small
   * "X plays" badge renders next to the tile title; 0 hides it.
   */
  playCount?: number;
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
  // Swipe-right-to-favorite: track touch origin and a "fired" flag so a
  // horizontal drag of >120 px on a primary touch toggles favorite once
  // and suppresses the trailing synthetic click. Pure touch handler — no
  // pointer/mouse paths are touched, so desktop click/hover is unaffected.
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swipeFired = useRef(false);
  const SWIPE_FAV_THRESHOLD = 120;
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
    swipeFired.current = false;
    swipeStart.current = { x, y };
    cancelLongPress();
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      setMenuPos({ x, y });
    }, 600);
  }, [cancelLongPress]);
  const onTileTouchEnd = useCallback(() => {
    cancelLongPress();
    swipeStart.current = null;
  }, [cancelLongPress]);
  const onTileTouchMove = useCallback((e: React.TouchEvent) => {
    const start = swipeStart.current;
    const t = e.touches[0];
    if (start && t && !swipeFired.current) {
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      // Once the gesture clearly goes horizontal, drop the long-press
      // timer so a swipe never doubles as a context-menu open.
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        cancelLongPress();
      }
      // Right-only, mostly-horizontal swipe past threshold flips favorite.
      if (dx > SWIPE_FAV_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
        swipeFired.current = true;
        cancelLongPress();
        if (onToggleFavorite) {
          onToggleFavorite(g.id);
          pushToast(
            "success",
            isFavorite ? "Removed from favorites" : "Added to favorites",
          );
        }
        return;
      }
    }
    cancelLongPress();
  }, [cancelLongPress, onToggleFavorite, g.id, isFavorite, pushToast]);
  // If the long-press or swipe-fav fired, the impending click on the
  // <Link> would still navigate — swallow it so the gesture doesn't also
  // immediately route to /play/<id>.
  const onTileClick = useCallback((e: React.MouseEvent) => {
    if (longPressFired.current || swipeFired.current) {
      e.preventDefault();
      e.stopPropagation();
      longPressFired.current = false;
      swipeFired.current = false;
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
  const onMenuHide = useCallback(() => {
    onHideGame?.(g.id);
    pushToast("success", "Hidden from lobby");
  }, [onHideGame, g.id, pushToast]);

  // Rich aria-label: title, category, plays, favorite-state.
  // Mirrors the visible chrome so screen-reader users get the same
  // at-a-glance summary sighted users get from the tile chrome.
  const playsLabel =
    playCount > 0
      ? `${playCount} ${playCount === 1 ? "play" : "plays"}`
      : "no plays yet";
  const favLabel = isFavorite ? "favorited" : "not favorited";
  const tileAriaLabel = `${g.title}, ${CATEGORY_LABELS[g.category]}, ${playsLabel}, ${favLabel}`;
  return (
    <div className="lobby-tile-wrap">
    <Link
      to={`/play/${g.id}`}
      className={`tile tile--cat-${CATEGORY_TAG[g.category]}${pressed ? " tile--pressed" : ""}`}
      data-testid={`tile-${g.id}`}
      aria-haspopup="menu"
      aria-expanded={menuPos !== null}
      aria-label={tileAriaLabel}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onContextMenu={onTileContextMenu}
      onTouchMove={onTileTouchMove}
      onTouchCancel={onTileTouchEnd}
      onClick={onTileClick}
      {...handlers}
    >
      <span className="tile-stripe" aria-hidden="true" />
      <span className="tile-sheen" aria-hidden="true" />
      <span
        className="tile-drag-handle"
        data-testid={`tile-drag-handle-${g.id}`}
        aria-hidden="true"
      >⋮⋮</span>
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
        {isFavorite && (
          <span
            className="tile-fav-marker"
            data-testid={`tile-fav-marker-${g.id}`}
            aria-hidden="true"
          >
            ♥
          </span>
        )}
        {highlightQuery && highlightQuery.length >= TITLE_HIGHLIGHT_MIN_LEN
          ? highlightMatch(g.title, highlightQuery)
          : g.title}
        {playCount > 0 && (
          <span
            className="tile-plays"
            data-testid={`tile-plays-${g.id}`}
            data-count={playCount}
            title={`You've played this ${playCount} ${playCount === 1 ? "time" : "times"}`}
            aria-label={`${playCount} ${playCount === 1 ? "play" : "plays"}`}
          >
            {playCount} {playCount === 1 ? "play" : "plays"}
          </span>
        )}
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
        onHide={onMenuHide}
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
  playCount = 0,
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
  /**
   * Aggregate plays across all variants in the family — surfaced in the
   * aria-label only (no visible badge on family tiles).
   */
  playCount?: number | undefined;
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
      aria-label={`${family.label}, ${CATEGORY_LABELS[category]}, ${memberCount} variant${memberCount === 1 ? "" : "s"}, ${
        playCount > 0
          ? `${playCount} ${playCount === 1 ? "play" : "plays"}`
          : "no plays yet"
      }, ${isFavorite ? "favorited" : "not favorited"}`}
      {...handlers}
    >
      <span className="tile-stripe" aria-hidden="true" />
      <span className="tile-sheen" aria-hidden="true" />
      <span
        className="tile-drag-handle"
        data-testid={`tile-drag-handle-${family.id}`}
        aria-hidden="true"
      >⋮⋮</span>
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
        {isFavorite && (
          <span
            className="tile-fav-marker"
            data-testid={`tile-fav-marker-${family.id}`}
            aria-hidden="true"
          >
            ♥
          </span>
        )}
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
        aria-label={`${g.title}, featured, ${CATEGORY_LABELS[g.category]}, multiple variants, ${
          isFavorite ? "favorited" : "not favorited"
        }`}
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
        {isFavorite && (
          <span
            className="tile-fav-marker"
            data-testid={`tile-fav-marker-${familyId}`}
            aria-hidden="true"
          >
            ♥
          </span>
        )}
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
      aria-label={`${g.title}, featured, ${CATEGORY_LABELS[g.category]}, ${
        isFavorite ? "favorited" : "not favorited"
      }`}
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
        {isFavorite && (
          <span
            className="tile-fav-marker"
            data-testid={`tile-fav-marker-feat-${g.id}`}
            aria-hidden="true"
          >
            ♥
          </span>
        )}
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

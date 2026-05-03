import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHead } from "../platform/PageHead.js";
import { searchAll, type SearchHit } from "../platform/search.js";
import { highlightMatch } from "../platform/highlight.js";
import { track } from "../platform/analytics.js";
import { GAMES } from "../games/registry.js";
import type { GameCategory, GamePlugin } from "../platform/game-plugin/types.js";
import "./SearchPage.css";

/**
 * Dedicated full-page search at `/search?q=...&cat=...&filter=...`. Goes
 * deeper than the AppShell's inline search box: scores against title,
 * description, howToPlay, family ids, and category names; groups results
 * into Top match / Games / Families / Categories; supports keyboard nav,
 * recent searches, inline highlighting via <mark>, and a row of result
 * filter chips that narrow the Games group post-scoring.
 *
 * The scoring/grouping itself lives in `../platform/search.ts` so the
 * AppShell's live-preview popover can share the exact same ranking.
 */

const RECENT_KEY = "cards-recent-searches";
const RECENT_MAX = 10;
const SUGGESTED: ReadonlyArray<string> = ["klondike", "poker", "wordle", "dice"];

/**
 * Result-filter chip definitions. The order here is the visual order in
 * the chip row directly above the result sections. Each chip narrows the
 * "Games" group of the result set; "all" is the no-op identity filter.
 *
 * "quick" / "challenging" use coarse heuristics derived from the plugin
 * registry — see `gamePassesFilter` below — because the GamePlugin type
 * does not (yet) carry an explicit difficulty/length tag.
 */
type FilterKey
  = "all"
  | GameCategory
  | "multiplayer"
  | "single-player"
  | "quick"
  | "challenging";

const FILTERS: ReadonlyArray<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "solitaire", label: "Solitaire" },
  { key: "cards", label: "Cards" },
  { key: "dice", label: "Dice" },
  { key: "board", label: "Board" },
  { key: "arcade", label: "Arcade" },
  { key: "multiplayer", label: "Multiplayer" },
  { key: "single-player", label: "Single-player" },
  { key: "quick", label: "Quick" },
  { key: "challenging", label: "Challenging" },
];

const FILTER_KEYS: ReadonlySet<string> = new Set(FILTERS.map((f) => f.key));

const CATEGORY_FILTERS: ReadonlySet<FilterKey> = new Set([
  "solitaire", "cards", "dice", "board", "arcade",
]);

/**
 * Quick = short-session games. Heuristics:
 *   - id/title contains "quick"/"mini"/"flash"/"speed", OR
 *   - howToPlay text is short (<= 600 chars), OR
 *   - category is "arcade" (arcade games are designed for ~30s loops).
 *
 * Challenging = games with deep rules / long playtime. Heuristics:
 *   - howToPlay text is long (>= 1500 chars), OR
 *   - id/title/howToPlay mentions "challenging"/"strategy"/"tournament", OR
 *   - category is "board" (typically deeper rule sets).
 */
function gamePassesFilter(g: GamePlugin, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (CATEGORY_FILTERS.has(filter)) return g.category === filter;
  if (filter === "multiplayer") return g.players.multiplayer === true;
  if (filter === "single-player") return g.players.multiplayer !== true;
  const blob = `${g.id} ${g.title} ${g.howToPlay ?? ""}`.toLowerCase();
  const hp = g.howToPlay ?? "";
  if (filter === "quick") {
    if (/\b(quick|mini|flash|speed)\b/.test(blob)) return true;
    if (g.category === "arcade") return true;
    return hp.length > 0 && hp.length <= 600;
  }
  if (filter === "challenging") {
    if (/\b(challenging|strategy|tournament|advanced)\b/.test(blob)) return true;
    if (g.category === "board") return true;
    return hp.length >= 1500;
  }
  return true;
}

function parseFilter(raw: string | null): FilterKey {
  if (raw && FILTER_KEYS.has(raw)) return raw as FilterKey;
  return "all";
}

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((s): s is string => typeof s === "string").slice(0, RECENT_MAX);
    }
  } catch { /* corrupt — fall through */ }
  return [];
}

function writeRecent(list: string[]): void {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
  } catch { /* storage unavailable — silently skip */ }
}

/**
 * Render `text` with the first occurrence of `q` wrapped in <mark>.
 * Implementation lives in `../platform/highlight.ts` so the lobby tiles
 * can share the same case-insensitive single-substring behaviour.
 */
const highlight = highlightMatch;

export default function SearchPage(): JSX.Element {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [debounced, setDebounced] = useState(initial);
  const [selected, setSelected] = useState(0);
  const [recent, setRecent] = useState<string[]>(() => readRecent());
  const [filter, setFilter] = useState<FilterKey>(() => parseFilter(params.get("filter")));
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Keep input in sync if the URL `?q=` changes externally (e.g. browser
  // back/forward, or AppShell submit while already on /search). Also
  // re-parse the filter chip selection from `?filter=` so that hitting
  // back/forward restores the previously-active chip.
  useEffect(() => {
    const next = params.get("q") ?? "";
    setQuery(next);
    setFilter(parseFilter(params.get("filter")));
  }, [params]);

  // Debounce the query→`debounced` propagation by 200ms so the heavy
  // hit computation doesn't run on every keystroke.
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(query), 200);
    return () => window.clearTimeout(handle);
  }, [query]);

  // Sync the URL whenever the debounced query or filter changes.
  // Preserves any `cat` param that callers may pre-seed for category-
  // scoped searches (e.g. arriving from the lobby category rail).
  useEffect(() => {
    const currentQ = params.get("q") ?? "";
    const currentFilter = params.get("filter") ?? "";
    const currentCat = params.get("cat") ?? "";
    const desiredFilter = filter === "all" ? "" : filter;
    if (debounced === currentQ && desiredFilter === currentFilter) return;
    const next: Record<string, string> = {};
    if (debounced) next.q = debounced;
    if (currentCat) next.cat = currentCat;
    if (desiredFilter) next.filter = desiredFilter;
    setParams(next, { replace: true });
  }, [debounced, filter, params, setParams]);

  // Persist debounced query to recent searches once it stabilises (>=2
  // chars to avoid recording every single typed letter).
  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2) return;
    const next = [q, ...recent.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, RECENT_MAX);
    if (next[0] === recent[0] && next.length === recent.length) return;
    setRecent(next);
    writeRecent(next);
    // Intentionally exclude `recent` from deps — we update it inline; we
    // only want to react to debounced changes here. Recent reads are
    // stable across renders thanks to the lazy initial state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const lowered = debounced.trim().toLowerCase();
  // Shared scoring/grouping lives in platform/search.ts so the AppShell
  // header popover can rank with the exact same weights.
  const { topMatch: rawTopMatch, games: rawGames, families, categories } = useMemo(
    () => searchAll(lowered),
    [lowered],
  );

  // Apply the active filter chip. Filtering is purely a post-scoring
  // narrowing pass: a game must (a) match the search query at all
  // (already enforced by buildHits) AND (b) pass the chip predicate.
  // Looking up the GamePlugin by id is O(GAMES.length) per hit which is
  // fine for our catalog size; if it ever grows, swap to a Map cache.
  const gameById = useMemo(() => {
    const m = new Map<string, GamePlugin>();
    for (const g of GAMES) if (g != null) m.set(g.id, g);
    return m;
  }, []);

  const passesGameFilter = (hit: SearchHit): boolean => {
    if (hit.kind !== "game") return true;
    const g = gameById.get(hit.id);
    if (!g) return filter === "all";
    return gamePassesFilter(g, filter);
  };

  const games = useMemo(
    () => rawGames.filter(passesGameFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawGames, filter, gameById],
  );

  // If the chosen top match is itself a game that doesn't pass the
  // active filter, hide it so the chip selection feels honest. The
  // promoted top-match logic in searchAll also strips it from the games
  // group, so we don't need to worry about double-counting.
  const topMatch: SearchHit | null = rawTopMatch && passesGameFilter(rawTopMatch)
    ? rawTopMatch
    : null;

  // Flat list used for keyboard navigation — top match first, then
  // games, families, categories in display order.
  const navList = useMemo(() => {
    const list: SearchHit[] = [];
    if (topMatch) list.push(topMatch);
    list.push(...games, ...families, ...categories);
    return list;
  }, [topMatch, games, families, categories]);

  // Reset selection when the result set changes.
  useEffect(() => { setSelected(0); }, [lowered, filter]);

  // ↑/↓ to move, Enter to navigate. Only fires when the input is focused
  // and the query has produced at least one hit.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (navList.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, navList.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter") {
        const target = navList[selected];
        if (target) {
          e.preventDefault();
          navigate(target.href);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navList, selected, navigate]);

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setDebounced(query);
    const trimmed = query.trim();
    if (trimmed.length > 0) track("search.submit", { length: trimmed.length });
  };

  const runRecent = (q: string): void => {
    setQuery(q);
    setDebounced(q);
    inputRef.current?.focus();
  };

  const isEmpty = lowered.length === 0;
  const noResults = !isEmpty && navList.length === 0;

  return (
    <div className="search-page">
      <PageHead title={debounced ? `Search: ${debounced}` : "Search"} />
      <header className="search-head">
        <h1>Search</h1>
        <form role="search" onSubmit={onSubmit} className="search-form">
          <input
            ref={inputRef}
            type="search"
            data-testid="search-input"
            className="search-input"
            placeholder="Search every game, family, or category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search Cards and Such"
            autoFocus
          />
        </form>
      </header>

      {/* Filter chip row — visible whenever a query is active so users
          can quickly narrow the result set without retyping. Hidden on
          the empty state because it would be ambiguous what "filtering
          nothing" means. */}
      {!isEmpty && (
        <nav
          className="search-filters"
          aria-label="Filter results"
          role="group"
        >
          <ul className="search-chips search-chips--filters">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <li key={`filter-${f.key}`}>
                  <button
                    type="button"
                    className={`search-chip search-chip--filter${active ? " is-active" : ""}`}
                    data-testid={`search-filter-${f.key}`}
                    aria-pressed={active}
                    onClick={() => setFilter(f.key)}
                  >{f.label}</button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {isEmpty ? (
        <div className="search-empty">
          {recent.length > 0 && (
            <section aria-label="Recent searches">
              <h2>Recent</h2>
              <ul className="search-chips">
                {recent.map((r, i) => (
                  <li key={`recent-${i}`}>
                    <button
                      type="button"
                      className="search-chip"
                      data-testid={`search-recent-${i}`}
                      onClick={() => runRecent(r)}
                    >{r}</button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section aria-label="Suggested searches">
            <h2>Suggested</h2>
            <ul className="search-chips">
              {SUGGESTED.map((s) => (
                <li key={`sugg-${s}`}>
                  <button
                    type="button"
                    className="search-chip search-chip--suggested"
                    onClick={() => runRecent(s)}
                  >{s}</button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : noResults ? (
        <div className="search-no-results" data-testid="search-no-results">
          <p>No results for <strong>{debounced}</strong>.</p>
          <p>Try a shorter word — a game name, family, or category usually does it.</p>
        </div>
      ) : (
        <div className="search-results">
          {topMatch && (
            <section className="search-section search-top-match-section">
              <h2>Top match</h2>
              <Link
                to={topMatch.href}
                className={`search-card search-card--top${selected === 0 ? " is-selected" : ""}`}
                data-testid="search-top-match"
              >
                <span className="search-card-kind">{topMatch.kind}</span>
                <span className="search-card-title">{highlight(topMatch.title, lowered)}</span>
                <span className="search-card-desc">{highlight(topMatch.description, lowered)}</span>
              </Link>
            </section>
          )}
          {games.length > 0 && (
            <section className="search-section">
              <h2>Games</h2>
              <ul className="search-list">
                {games.map((h, idx) => {
                  const navIdx = (topMatch ? 1 : 0) + idx;
                  return (
                    <li key={`g-${h.id}`}>
                      <Link
                        to={h.href}
                        className={`search-card${selected === navIdx ? " is-selected" : ""}`}
                        data-testid={`search-game-${h.id}`}
                      >
                        <span className="search-card-title">{highlight(h.title, lowered)}</span>
                        <span className="search-card-desc">{highlight(h.description, lowered)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {families.length > 0 && (
            <section className="search-section">
              <h2>Families</h2>
              <ul className="search-list">
                {families.map((h, idx) => {
                  const navIdx = (topMatch ? 1 : 0) + games.length + idx;
                  return (
                    <li key={`f-${h.id}`}>
                      <Link
                        to={h.href}
                        className={`search-card${selected === navIdx ? " is-selected" : ""}`}
                        data-testid={`search-family-${h.id}`}
                      >
                        <span className="search-card-title">{highlight(h.title, lowered)}</span>
                        <span className="search-card-desc">{highlight(h.description, lowered)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {categories.length > 0 && (
            <section className="search-section">
              <h2>Categories</h2>
              <ul className="search-list">
                {categories.map((h, idx) => {
                  const navIdx
                    = (topMatch ? 1 : 0) + games.length + families.length + idx;
                  return (
                    <li key={`c-${h.id}`}>
                      <Link
                        to={h.href}
                        className={`search-card${selected === navIdx ? " is-selected" : ""}`}
                        data-testid={`search-cat-${h.id}`}
                      >
                        <span className="search-card-title">{h.title}</span>
                        <span className="search-card-desc">{h.description}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

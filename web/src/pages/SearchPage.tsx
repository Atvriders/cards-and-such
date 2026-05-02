import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHead } from "../platform/PageHead.js";
import { searchAll, type SearchHit } from "../platform/search.js";
import { highlightMatch } from "../platform/highlight.js";
import { track } from "../platform/analytics.js";
import "./SearchPage.css";

/**
 * Dedicated full-page search at `/search?q=...`. Goes deeper than the
 * AppShell's inline search box: scores against title, description,
 * howToPlay, family ids, and category names; groups results into
 * Top match / Games / Families / Categories; supports keyboard nav,
 * recent searches, and inline highlighting via <mark>.
 *
 * The scoring/grouping itself lives in `../platform/search.ts` so the
 * AppShell's live-preview popover can share the exact same ranking.
 */

const RECENT_KEY = "cards-recent-searches";
const RECENT_MAX = 10;
const SUGGESTED: ReadonlyArray<string> = ["klondike", "poker", "wordle", "dice"];

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
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Keep input in sync if the URL `?q=` changes externally (e.g. browser
  // back/forward, or AppShell submit while already on /search).
  useEffect(() => {
    const next = params.get("q") ?? "";
    setQuery(next);
  }, [params]);

  // Debounce the query→`debounced` propagation by 200ms so the heavy
  // hit computation doesn't run on every keystroke.
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(query), 200);
    return () => window.clearTimeout(handle);
  }, [query]);

  // Sync the URL whenever the debounced query changes — but only when it
  // diverges from `?q=`, otherwise we'd cause a redundant history entry.
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (debounced === current) return;
    if (debounced) setParams({ q: debounced }, { replace: true });
    else setParams({}, { replace: true });
  }, [debounced, params, setParams]);

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
  const { topMatch, games, families, categories } = useMemo(
    () => searchAll(lowered),
    [lowered],
  );

  // Flat list used for keyboard navigation — top match first, then
  // games, families, categories in display order.
  const navList = useMemo(() => {
    const list: SearchHit[] = [];
    if (topMatch) list.push(topMatch);
    list.push(...games, ...families, ...categories);
    return list;
  }, [topMatch, games, families, categories]);

  // Reset selection when the result set changes.
  useEffect(() => { setSelected(0); }, [lowered]);

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

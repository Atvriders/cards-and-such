import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GAMES } from "../games/registry.js";
import { FAMILIES } from "../games/families.js";
import type { GameCategory, GamePlugin } from "../platform/game-plugin/types.js";
import { PageHead } from "../platform/PageHead.js";
import "./SearchPage.css";

/**
 * Dedicated full-page search at `/search?q=...`. Goes deeper than the
 * AppShell's inline search box: scores against title, description,
 * howToPlay, family ids, and category names; groups results into
 * Top match / Games / Families / Categories; supports keyboard nav,
 * recent searches, and inline highlighting via <mark>.
 */

type ResultKind = "game" | "family" | "category";

interface SearchHit {
  kind: ResultKind;
  /** Stable id used for testid + dedupe (game id, family id, or category name). */
  id: string;
  title: string;
  description: string;
  /** Where this hit links. */
  href: string;
  /** Score — higher is better. Used for ranking + picking the top match. */
  score: number;
}

const RECENT_KEY = "cards-recent-searches";
const RECENT_MAX = 10;
const SUGGESTED: ReadonlyArray<string> = ["klondike", "poker", "wordle", "dice"];

const CATEGORY_ORDER: GameCategory[] = [
  "solitaire", "cards", "dice", "board", "arcade",
];
const CATEGORY_LABELS: Record<GameCategory, string> = {
  solitaire: "Solitaire",
  cards: "Cards",
  dice: "Dice",
  board: "Board",
  arcade: "Arcade",
};

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
 * Score a single text field against the lowercased query. Title-class
 * fields should weigh more than description-class fields — the caller
 * passes a `weight` multiplier per field.
 *
 * Scoring tiers (per field):
 *   exact match         100
 *   word-boundary start  60
 *   substring contains   30
 *   no match              0
 */
function scoreField(text: string | undefined, q: string, weight: number): number {
  if (!text || !q) return 0;
  const lower = text.toLowerCase();
  if (lower === q) return 100 * weight;
  // Word-boundary start: matches `q` at start or after non-word char.
  // Cheap regex; q comes from user input so we escape special chars.
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`(^|[^a-z0-9])${escaped}`, "i").test(lower)) return 60 * weight;
  if (lower.includes(q)) return 30 * weight;
  return 0;
}

/**
 * Build the ranked hit list for `q` (already trimmed + lowercased).
 * Empty `q` returns []. Caps groups at sensible sizes so the page
 * doesn't scroll forever on a generic query like "k".
 */
function buildHits(q: string): SearchHit[] {
  if (!q) return [];
  const out: SearchHit[] = [];
  const safeGames = GAMES.filter((g): g is GamePlugin => g != null);

  // Games: weighted across title (3x), category (1.5x), description (1x), howToPlay (0.5x).
  for (const g of safeGames) {
    const score
      = scoreField(g.title, q, 3)
      + scoreField(g.category, q, 1.5)
      + scoreField(g.description, q, 1)
      + scoreField(g.howToPlay, q, 0.5);
    if (score > 0) {
      out.push({
        kind: "game",
        id: g.id,
        title: g.title,
        description: g.description,
        href: `/play/${g.id}`,
        score,
      });
    }
  }

  // Families: weighted across id, label (3x), description (1x).
  for (const fam of FAMILIES) {
    const score
      = scoreField(fam.id, q, 2)
      + scoreField(fam.label, q, 3)
      + scoreField(fam.description, q, 1);
    if (score > 0) {
      out.push({
        kind: "family",
        id: fam.id,
        title: fam.label,
        description: fam.description,
        // Families don't have their own page — surface them via the
        // lobby search so the existing FamilyPicker opens.
        href: `/?q=${encodeURIComponent(fam.label)}`,
        score,
      });
    }
  }

  // Categories: a fixed list of 5; surface them as "Show all N <cat> games".
  for (const cat of CATEGORY_ORDER) {
    const score = scoreField(cat, q, 4) + scoreField(CATEGORY_LABELS[cat], q, 4);
    if (score > 0) {
      const count = safeGames.filter((g) => g.category === cat).length;
      out.push({
        kind: "category",
        id: cat,
        title: `Show all ${count.toLocaleString()} ${CATEGORY_LABELS[cat]} games`,
        description: `Browse the full ${CATEGORY_LABELS[cat]} catalog.`,
        href: `/category/${cat}`,
        score,
      });
    }
  }

  out.sort((a, b) => b.score - a.score);
  return out;
}

/**
 * Render `text` with the first occurrence of `q` wrapped in <mark>.
 * Case-insensitive. Returns plain text when there's no match.
 */
function highlight(text: string, q: string): React.ReactNode {
  if (!q) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx < 0) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);
  return (
    <>
      {before}
      <mark>{match}</mark>
      {after}
    </>
  );
}

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
  const hits = useMemo(() => buildHits(lowered), [lowered]);

  // Group hits by kind (preserve score order within each group).
  const { topMatch, games, families, categories } = useMemo(() => {
    const allGames = hits.filter((h) => h.kind === "game");
    const allFamilies = hits.filter((h) => h.kind === "family");
    const allCats = hits.filter((h) => h.kind === "category");
    const top = hits.length > 0 ? hits[0]! : null;
    // Drop the top match from its source group so it isn't rendered twice.
    const games = top && top.kind === "game"
      ? allGames.filter((g) => g.id !== top.id)
      : allGames;
    const families = top && top.kind === "family"
      ? allFamilies.filter((f) => f.id !== top.id)
      : allFamilies;
    const categories = top && top.kind === "category"
      ? allCats.filter((c) => c.id !== top.id)
      : allCats;
    return {
      topMatch: top,
      games: games.slice(0, 30),
      families: families.slice(0, 12),
      categories: categories.slice(0, 5),
    };
  }, [hits]);

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
          <p>Try a shorter or simpler word — for example a game name, family, or category.</p>
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

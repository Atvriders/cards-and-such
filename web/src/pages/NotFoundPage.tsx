import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageHead } from "../platform/PageHead.js";
import { GAMES } from "../games/registry.js";
import "./NotFoundPage.css";

const MAX_SUGGESTIONS = 3;

interface GameLite {
  id: string;
  title: string;
  haystack: string;
}

/** Cheap Levenshtein distance — used to score suggestion relevance. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array<number>(n + 1);
  let cur = new Array<number>(n + 1);
  for (let j = 0; j <= n; j += 1) prev[j] = j;
  for (let i = 1; i <= m; i += 1) {
    cur[0] = i;
    const ai = a.charCodeAt(i - 1);
    for (let j = 1; j <= n; j += 1) {
      const cost = ai === b.charCodeAt(j - 1) ? 0 : 1;
      const del = (prev[j] ?? 0) + 1;
      const ins = (cur[j - 1] ?? 0) + 1;
      const sub = (prev[j - 1] ?? 0) + cost;
      cur[j] = Math.min(del, ins, sub);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[n] ?? 0;
}

/** Score how well `token` matches a game — lower is better. Substring hits
 *  beat any pure edit-distance match. */
function scoreMatch(token: string, game: GameLite): number {
  if (!token) return Number.POSITIVE_INFINITY;
  if (game.id === token) return -100;
  if (game.haystack.includes(token)) {
    // Reward substring hits, prefer earlier matches and shorter titles.
    const idx = game.haystack.indexOf(token);
    return -50 + idx + game.haystack.length * 0.01;
  }
  // Compare token against the closer of id or title (lowercased).
  const dId = levenshtein(token, game.id);
  const dTitle = levenshtein(token, game.title.toLowerCase());
  return Math.min(dId, dTitle);
}

function suggestForPath(path: string, games: GameLite[]): GameLite[] {
  const tokens = path
    .split("/")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 1);
  if (tokens.length === 0) return [];

  // Score every game by its best-matching token.
  const scored = games.map((g) => {
    let best = Number.POSITIVE_INFINITY;
    for (const tok of tokens) {
      const s = scoreMatch(tok, g);
      if (s < best) best = s;
    }
    return { game: g, score: best };
  });

  scored.sort((a, b) => a.score - b.score);
  // Drop wildly-distant matches (>5 edits and no substring hit).
  return scored
    .filter((s) => s.score < 6)
    .slice(0, MAX_SUGGESTIONS)
    .map((s) => s.game);
}

export default function NotFoundPage(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const games = useMemo<GameLite[]>(() => {
    return GAMES.filter((g): g is NonNullable<typeof g> => g != null).map(
      (g) => ({
        id: g.id,
        title: g.title,
        haystack: `${g.id} ${g.title.toLowerCase()}`,
      }),
    );
  }, []);

  const suggestions = useMemo(
    () => suggestForPath(location.pathname, games),
    [location.pathname, games],
  );

  function onSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="nf-page" data-testid="not-found-page">
      <PageHead title="Page not found" />

      <header className="nf-hero" data-testid="nf-hero">
        <ConfusedCardSvg />
        <h1 className="nf-title">We can&apos;t find that page</h1>
        <p className="nf-tag">
          The trail goes cold at <code className="nf-path">{location.pathname}</code>.
          Looks like the deck got reshuffled.
        </p>
      </header>

      {suggestions.length > 0 ? (
        <section className="nf-section">
          <h2 className="nf-section-title">Did you mean&hellip;</h2>
          <ul className="nf-suggest-list">
            {suggestions.map((g, idx) => (
              <li key={g.id}>
                <Link
                  to={`/play/${g.id}`}
                  className="nf-suggest"
                  data-testid={`nf-suggest-${idx}`}
                >
                  <span className="nf-suggest-title">{g.title}</span>
                  <span className="nf-suggest-id">/play/{g.id}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="nf-section">
        <h2 className="nf-section-title">Or search the catalog</h2>
        <form className="nf-search-form" onSubmit={onSubmit} role="search">
          <input
            type="search"
            className="nf-search-input"
            placeholder="Try 'klondike', 'wordle', 'chess'…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="nf-search"
            aria-label="Search games"
          />
          <button type="submit" className="nf-search-submit">
            Search
          </button>
        </form>
        <p className="nf-section-hint">
          Or head back to the <Link to="/" className="nf-link">lobby</Link>.
        </p>
      </section>
    </div>
  );
}

/** Inline SVG so it works while offline and inherits theme colors. */
function ConfusedCardSvg(): JSX.Element {
  return (
    <svg
      className="nf-svg"
      viewBox="0 0 200 220"
      role="img"
      aria-label="A confused playing card"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="nf-card-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
        <linearGradient id="nf-accent-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f0abfc" />
          <stop offset="50%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
      </defs>
      <g transform="rotate(-12 100 110)">
        <rect
          x="38"
          y="30"
          width="124"
          height="170"
          rx="14"
          ry="14"
          fill="url(#nf-card-grad)"
          stroke="url(#nf-accent-grad)"
          strokeWidth="2"
        />
        <text
          x="56"
          y="64"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="28"
          fill="#f0abfc"
        >
          ?
        </text>
        <text
          x="144"
          y="186"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="28"
          fill="#67e8f9"
          textAnchor="end"
        >
          ?
        </text>
        <g transform="translate(100 115)" textAnchor="middle">
          <text
            fontFamily="Inter, sans-serif"
            fontWeight="800"
            fontSize="64"
            fill="url(#nf-accent-grad)"
          >
            404
          </text>
        </g>
      </g>
    </svg>
  );
}

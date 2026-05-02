import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { GAMES } from "../games/registry.js";
import { FAMILIES, compareTitles, expandFamily } from "../games/families.js";
import type { GameCategory, GamePlugin } from "../platform/game-plugin/types.js";
import { PageHead } from "../platform/PageHead.js";
import { StarRating, readRatings } from "../platform/StarRating.js";
import { t } from "../platform/i18n.js";
import "./LobbyPage.css";

/**
 * Per-category deep-dive page. Unlike the lobby, families are NOT
 * collapsed — every variant gets its own tile so users can scan the
 * full catalog of a single category without opening pickers. Quick
 * filters layer on top: by family, by player-count bucket, by min
 * rating.
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
  solitaire: "Single-player patiences — Klondike, FreeCell, Spider, and hundreds more.",
  cards: "Trick-takers, shedding games, rummies, and modern card games for two or more.",
  dice: "Yahtzee-style dice rollers, push-your-luck, and dice-driven challenges.",
  board: "Chess, checkers, abstracts, and modern board game adaptations.",
  arcade: "Reflex, action, and casual arcade puzzlers for a quick burst.",
};

type PlayerBucket = "any" | "1" | "2" | "3+";
type RatingBucket = "any" | "3" | "4" | "5";

function playersLine(p: { min: number; max: number }): string {
  return p.min === p.max
    ? `${p.min} player${p.min === 1 ? "" : "s"}`
    : `${p.min}–${p.max} players`;
}

function matchesPlayerBucket(p: { min: number; max: number }, bucket: PlayerBucket): boolean {
  if (bucket === "any") return true;
  if (bucket === "1") return p.min <= 1 && p.max >= 1;
  if (bucket === "2") return p.min <= 2 && p.max >= 2;
  return p.max >= 3;
}

export default function CategoryPage(): JSX.Element {
  const { cat } = useParams<{ cat: string }>();
  const category = (cat ?? "") as GameCategory;
  const isValid = CATEGORIES.includes(category);

  const [familyFilter, setFamilyFilter] = useState<string>("all");
  const [playerFilter, setPlayerFilter] = useState<PlayerBucket>("any");
  const [ratingFilter, setRatingFilter] = useState<RatingBucket>("any");
  const [ratings] = useState<Record<string, number>>(() => readRatings());

  // Resolve catalog (always run hooks regardless of validity for Rules-of-Hooks).
  const catGames = useMemo(() => {
    if (!isValid) return [];
    return GAMES.filter((g): g is GamePlugin => g != null && g.category === category)
      .slice()
      .sort((a, b) => compareTitles(a.title, b.title));
  }, [category, isValid]);

  // Map game id -> family id (for the family filter chip set).
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

  // Families present in this category, sorted by member count desc.
  const familyChips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const g of catGames) {
      const fid = gameToFamily.get(g.id);
      if (fid) counts.set(fid, (counts.get(fid) ?? 0) + 1);
    }
    const labelById = new Map(FAMILIES.map((f) => [f.id, f.label] as const));
    return Array.from(counts.entries())
      .map(([id, count]) => ({ id, label: labelById.get(id) ?? id, count }))
      .sort((a, b) => b.count - a.count || compareTitles(a.label, b.label));
  }, [catGames, gameToFamily]);

  const featured = useMemo(() => {
    // Pick 3 highest-rated games; fall back to first 3 alphabetical when no ratings.
    const scored = catGames
      .map((g) => ({ g, r: ratings[g.id] ?? 0 }))
      .sort((a, b) => b.r - a.r || compareTitles(a.g.title, b.g.title));
    return scored.slice(0, 3).map((x) => x.g);
  }, [catGames, ratings]);

  const filtered = useMemo(() => {
    return catGames.filter((g) => {
      if (familyFilter !== "all") {
        const fid = gameToFamily.get(g.id);
        if (familyFilter === "__none__") {
          if (fid) return false;
        } else if (fid !== familyFilter) {
          return false;
        }
      }
      if (!matchesPlayerBucket(g.players, playerFilter)) return false;
      if (ratingFilter !== "any") {
        const minR = Number(ratingFilter);
        if ((ratings[g.id] ?? 0) < minR) return false;
      }
      return true;
    });
  }, [catGames, gameToFamily, familyFilter, playerFilter, ratingFilter, ratings]);

  if (!isValid) {
    return <Navigate to="/" replace />;
  }

  const tag = CATEGORY_TAG[category];
  const label = CATEGORY_LABELS[category];
  const glyph = CATEGORY_GLYPHS[category];

  return (
    <div className="lobby-page" data-testid={`category-page-${category}`}>
      <PageHead
        title={`${label} games — Cards and Such`}
        description={`Browse every ${label.toLowerCase()} game in the Cards and Such catalog. ${CATEGORY_BLURB[category]}`}
      />

      <header className="lobby-hero">
        <div className="lobby-hero-eyebrow">
          <span className="lobby-hero-pulse" aria-hidden="true" />
          <span>Category · {label}</span>
        </div>
        <h1>
          <span className="lobby-hero-title" aria-hidden="true" style={{ marginRight: "0.5rem" }}>{glyph}</span>
          <span className="lobby-hero-title">{label}</span>
        </h1>
        <p className="lobby-sub" data-testid="category-count">
          <strong>{catGames.length.toLocaleString()}</strong> {label.toLowerCase()} game{catGames.length === 1 ? "" : "s"} — every variant, flat. {CATEGORY_BLURB[category]}
        </p>

        {featured.length > 0 && (
          <section className="lobby-featured" aria-label={`Featured ${label} games`} style={{ marginTop: "1.25rem" }}>
            <h2>
              <span className="lobby-featured-spark" aria-hidden="true">✦</span>
              Featured {label}
            </h2>
            <div className="lobby-grid lobby-grid--featured" data-testid="category-featured">
              {featured.map((g) => (
                <Link
                  key={`feat-${g.id}`}
                  to={`/play/${g.id}`}
                  className={`tile tile--cat-${CATEGORY_TAG[g.category]} tile--featured`}
                  data-testid={`cat-feat-tile-${g.id}`}
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
                    <span className="tile-players">{playersLine(g.players)}</span>
                    <span className="tile-cta" aria-hidden="true">Play</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </header>

      <div className="lobby-controls">
        <div
          className="lobby-chips"
          role="group"
          aria-label="Filter by family"
          data-testid="cat-family-chips"
        >
          <button
            type="button"
            className={`lobby-chip${familyFilter === "all" ? " is-active" : ""}`}
            onClick={() => setFamilyFilter("all")}
            data-testid="cat-fam-all"
          >
            <span>All families</span>
            <span className="lobby-chip-count">{catGames.length.toLocaleString()}</span>
          </button>
          {familyChips.length > 0 && (
            <button
              type="button"
              className={`lobby-chip${familyFilter === "__none__" ? " is-active" : ""}`}
              onClick={() => setFamilyFilter("__none__")}
              data-testid="cat-fam-standalone"
            >
              <span>Standalone</span>
              <span className="lobby-chip-count">
                {(catGames.length - familyChips.reduce((s, c) => s + c.count, 0)).toLocaleString()}
              </span>
            </button>
          )}
          {familyChips.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`lobby-chip${familyFilter === f.id ? " is-active" : ""}`}
              onClick={() => setFamilyFilter(f.id)}
              data-testid={`cat-fam-${f.id}`}
            >
              <span>{f.label}</span>
              <span className="lobby-chip-count">{f.count}</span>
            </button>
          ))}
        </div>

        <div
          className="lobby-chips"
          role="group"
          aria-label="Filter by player count"
          data-testid="cat-player-chips"
        >
          {([
            ["any", "Any players"],
            ["1", "Solo"],
            ["2", "2 players"],
            ["3+", "3+ players"],
          ] as const).map(([key, lab]) => (
            <button
              key={key}
              type="button"
              className={`lobby-chip${playerFilter === key ? " is-active" : ""}`}
              onClick={() => setPlayerFilter(key)}
              data-testid={`cat-players-${key}`}
            >
              <span>{lab}</span>
            </button>
          ))}
        </div>

        <div
          className="lobby-chips"
          role="group"
          aria-label="Filter by rating"
          data-testid="cat-rating-chips"
        >
          {([
            ["any", "Any rating"],
            ["3", "3+ stars"],
            ["4", "4+ stars"],
            ["5", "5 stars"],
          ] as const).map(([key, lab]) => (
            <button
              key={key}
              type="button"
              className={`lobby-chip${ratingFilter === key ? " is-active" : ""}`}
              onClick={() => setRatingFilter(key)}
              data-testid={`cat-rating-${key}`}
            >
              <span className="lobby-chip-glyph" aria-hidden="true">★</span>
              <span>{lab}</span>
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
              {filtered.length.toLocaleString()} of {catGames.length.toLocaleString()}
            </span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="lobby-no-results" data-testid="cat-no-results">
            <p>No {label.toLowerCase()} games match these filters.</p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setFamilyFilter("all");
                setPlayerFilter("any");
                setRatingFilter("any");
              }}
            >
              {t("lobby.clear_filters")}
            </button>
          </div>
        ) : (
          <div className="lobby-grid" data-testid="category-grid">
            {filtered.map((g) => {
              const userRating = ratings[g.id] ?? 0;
              return (
                <Link
                  key={`cat-${g.id}`}
                  to={`/play/${g.id}`}
                  className={`tile tile--cat-${tag}`}
                  data-testid={`cat-tile-${g.id}`}
                >
                  <span className="tile-stripe" aria-hidden="true" />
                  <span className="tile-sheen" aria-hidden="true" />
                  <div className="tile-meta">
                    <span className={`tile-cat tile-cat-${tag}`}>
                      <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
                      {label}
                    </span>
                    {g.players.multiplayer && (
                      <span className="tile-mp-badge" data-testid={`cat-mp-${g.id}`}>
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
                        data-testid={`cat-rating-${g.id}`}
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
        )}
      </section>
    </div>
  );
}

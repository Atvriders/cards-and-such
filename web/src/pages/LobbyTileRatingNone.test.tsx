import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W965 — the lobby tile-rating widget is fully gated by a stored rating.
 *
 * Sibling tests cover the present-rating render branches:
 *   - W682 (LobbyPage.test.tsx ~L2550): pins the standalone-tile
 *     `tile-rating-<id>` wrapper-span aria-label "Your rating: N of 5
 *     stars" + cardinality when a rating is seeded.
 *   - W873 (LobbyPage.test.tsx ~L3873): pins the family-tile branch's
 *     "Best variant rating: N of 5 stars" wrapper aria-label.
 *   - W951 (LobbyTileRatingStars.test.tsx): drills into the StarRating
 *     filled-star count + read-only disabled buttons.
 *
 * The complement — the ZERO-rating branch — was previously unpinned.
 * The render gate lives at LobbyPage.tsx ~L3043 (standalone tile),
 * ~L3282 (family tile), and ~L3043's-equivalent in the recently-played
 * / search-result / featured paths, all of which use the same
 * `userRating > 0 && (...)` shape with the rating sourced from
 * `ratings[g.id] ?? 0` (LobbyPage.tsx ~L2025, ~L2347, ~L2370). With an
 * empty `cards-ratings` localStorage blob, every tile defaults to 0 and
 * the gate must short-circuit — NO `tile-rating-*` testid should mount.
 *
 * A regression that flipped the gate to `userRating >= 0` (or removed
 * the gate entirely) would render an empty StarRating widget on every
 * tile, cluttering the lobby footer and producing 5 stale "0 stars"
 * indicators per game card. This test catches that by asserting the
 * `data-testid` prefix is entirely absent from the document.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W874 / W908 / W932 / W951: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-rating widget gated off without stored rating (W965)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders no tile-rating widgets when cards-ratings is empty", async () => {
    // Ensure the canonical ratings blob is absent — the LobbyPage
    // useState initializer (LobbyPage.tsx ~L732) reads via readRatings()
    // which falls back to {} when the key is missing, so every tile's
    // `ratings[g.id] ?? 0` resolves to 0 and the `userRating > 0` gate
    // (LobbyPage.tsx ~L3043, ~L3282) MUST short-circuit.
    expect(localStorage.getItem("cards-ratings")).toBeNull();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to fully mount — the search input is the
    // canonical "lobby is rendered" anchor used across sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Pin the gate: NOT A SINGLE `tile-rating-*` widget should be
    // present in the document. We query by data-testid attribute prefix
    // rather than testid suffix, so any tile (standalone, family,
    // featured, recently-played, or search result) that leaks an empty
    // rating widget surfaces here.
    const ratingWidgets = document.querySelectorAll(
      '[data-testid^="tile-rating-"]',
    );
    expect(ratingWidgets).toHaveLength(0);
  });
});

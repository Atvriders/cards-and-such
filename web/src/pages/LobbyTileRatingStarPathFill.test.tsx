import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1786 — every star button inside the lobby tile-rating widget renders
 * a single inner <svg> with exactly one <path> child, and that path
 * declares a `fill` attribute that toggles between "currentColor" (for
 * filled stars at index ≤ value) and "none" (for unfilled stars).
 *
 * Sibling tests pin adjacent attributes of the SAME star buttons / glyphs
 * (W1754 path stroke="currentColor", W1764 path stroke-width="1.6",
 * W1708 path stroke-linejoin="round", W1719 path stroke-linecap absent,
 * W1775 path d geometry). NONE of those pin the inner <path>'s `fill`
 * attribute (StarRating.tsx ~L186-192) — the value-driven toggle between
 * "currentColor" and "none" remains uncovered.
 *
 * The `fill` toggle is the visual contract that distinguishes a "filled"
 * (rated) star from an "unfilled" (above-rating) star: the filled variant
 * paints the interior with `fill="currentColor"` so it inherits the
 * theming cascade, while the unfilled variant uses `fill="none"` to leave
 * only the stroke outline. A regression that hard-codes either side
 * (e.g. always `"none"`, or a literal hex color) would silently collapse
 * the rating widget into a single visual state across every lobby tile
 * without throwing.
 *
 * `pool-10ball` reuses the canonical fixture id from the W1754 / W1764 /
 * W1708 / W1775 cluster: not a FEATURED game, so its tile renders exactly
 * once under the canonical `tile-<id>` testid, keeping the inner-rating
 * query unambiguous. Seeding rating=3 splits the 5 stars into a 3/2
 * filled/unfilled pair so we can pin BOTH sides of the toggle in one
 * assertion sweep.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the rest of the LobbyTileRatingStar* cluster: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating star inner path fill toggle (W1786)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders fill="currentColor" on filled stars and fill="none" on unfilled stars', async () => {
    // Seed the canonical rating blob BEFORE mount so the page's useState
    // initializer hydrates synchronously via readRatings()
    // (LobbyPage.tsx ~L732).
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "pool-10ball": 3 }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Reach the rating widget through its W682-pinned wrapper testid so
    // this test stays anchored on the same surface rather than drifting
    // to a sibling rating widget if one ever appears.
    const ratingWidget = await screen.findByTestId("tile-rating-pool-10ball");

    // Five radio-role star buttons regardless of rating value
    // (StarRating.tsx ~L156-196).
    const stars = within(ratingWidget).getAllByRole("radio");
    expect(stars).toHaveLength(5);

    // Each star button must contain EXACTLY one inner <svg> glyph
    // (StarRating.tsx ~L179-193) wrapping EXACTLY one <path> child
    // (~L186-192). The path's `fill` toggles based on whether the star's
    // 1-based index is ≤ the seeded rating value of 3:
    //   - stars[0..2] (indices 1..3) → filled → fill="currentColor"
    //   - stars[3..4] (indices 4..5) → unfilled → fill="none"
    stars.forEach((star, i) => {
      const paths = star.querySelectorAll("svg > path");
      expect(paths).toHaveLength(1);
      const expected = i < 3 ? "currentColor" : "none";
      expect(paths[0]!.getAttribute("fill")).toBe(expected);
    });
  });
});

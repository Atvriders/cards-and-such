import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1775 — every star button inside the lobby tile-rating widget renders
 * a single inner <svg> with exactly one <path> child, and that path
 * declares the canonical 5-point star geometry via its `d` attribute.
 *
 * Sibling tests pin adjacent attributes of the SAME star path
 * (W1754 stroke="currentColor", W1708 stroke-linejoin="round",
 * W1719 absent stroke-linecap, W1764 stroke-width="1.6"), but NONE
 * of them pin the path's `d` geometry string (StarRating.tsx ~L187).
 * The `d` value encodes the literal 5-point star shape — a regression
 * that swaps it for a heart, square, or any other glyph would silently
 * change every lobby tile rating widget across the entire app without
 * throwing. Pinning the exact path-data string catches that regression
 * at the unit-test layer rather than via screenshot diffs.
 *
 * `pool-10ball` reuses the canonical fixture id from the rest of the
 * LobbyTileRatingStarPath* cluster: not a FEATURED game, so its tile
 * renders exactly once under the canonical `tile-<id>` testid, keeping
 * the inner-rating query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the rest of the LobbyTileRatingStar* cluster: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating star inner path d=star-geometry (W1775)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the canonical 5-point star "d" geometry on the inner svg path of all 5 star buttons', async () => {
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
    // (~L186-192). The path's `d` attribute MUST be the literal
    // 5-point star geometry authored against the 24x24 viewBox.
    const expectedD =
      "M12 2.6l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.7l-5.88 3.01 1.12-6.55-4.76-4.64 6.58-.96L12 2.6z";
    for (const star of stars) {
      const paths = star.querySelectorAll("svg > path");
      expect(paths).toHaveLength(1);
      expect(paths[0]!.getAttribute("d")).toBe(expectedD);
    }
  });
});

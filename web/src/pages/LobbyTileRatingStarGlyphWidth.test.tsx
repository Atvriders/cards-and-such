import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1731 — every star button inside the lobby tile-rating widget contains
 * exactly one inner <svg> glyph that declares the literal `width="100%"`
 * attribute, letting the SVG fluidly fill its parent <button>'s box so
 * the star scales with the surrounding `.star-rating--md` / `--sm`
 * sizing rather than being pinned to a fixed pixel dimension.
 *
 * Sibling tests pin adjacent attributes of the SAME star inner SVG glyphs:
 *   - W1556 (LobbyTileRatingStarGlyphAria.test.tsx): inner SVG aria-hidden.
 *   - W1569 (LobbyTileRatingStarGlyphFocusable.test.tsx): SVG focusable=false.
 *   - W1695 (LobbyTileRatingStarGlyphViewBox.test.tsx): SVG viewBox=0 0 24 24.
 *   - W1708 (LobbyTileRatingStarPathStrokeLinejoin.test.tsx): path stroke-linejoin.
 *   - W1719 (LobbyTileRatingStarPathStrokeLinecap.test.tsx): path stroke-linecap absent.
 *
 * None of those pin the inner SVG's `width` attribute. StarRating.tsx
 * ~L179-185 renders an <svg> with `width="100%"` (~L181). A refactor
 * that hard-codes a pixel value (e.g. `width="14"`) — easy to do by
 * accidentally copy-pasting from the sibling "Saved" toast SVG which
 * uses `width="14"` (~L124) — would break the responsive star sizing
 * without throwing at render time. Pinning the literal "100%" string
 * surfaces such drift at the unit-test layer.
 *
 * `pool-10ball` reuses the canonical fixture id from sibling W*-tests:
 * not a FEATURED game, so its tile renders exactly once under the
 * canonical `tile-<id>` testid, keeping the inner-rating query
 * unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1556/W1569/W1695: shares the `src/pages/Lobby` vitest
 * path filter without colliding with concurrent edits to the mega-file.
 */
describe('LobbyPage — tile-rating star inner svg glyph width="100%" (W1731)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('declares width="100%" on the inner svg glyph of all 5 star buttons', async () => {
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

    // Five radio-role star buttons regardless of rating
    // (StarRating.tsx ~L156-196).
    const stars = within(ratingWidget).getAllByRole("radio");
    expect(stars).toHaveLength(5);

    // Every star button must contain EXACTLY one inner <svg> glyph
    // (StarRating.tsx ~L179-193) and that glyph MUST declare the literal
    // `width="100%"` (~L181) so the star scales with its parent button.
    // A regression that swaps the percentage for a fixed pixel value
    // would freeze the glyph size at render time without throwing —
    // pinning the exact string here surfaces such drift at the
    // unit-test layer.
    for (const star of stars) {
      const glyphs = star.querySelectorAll("svg");
      expect(glyphs).toHaveLength(1);
      expect(glyphs[0]).toHaveAttribute("width", "100%");
    }
  });
});

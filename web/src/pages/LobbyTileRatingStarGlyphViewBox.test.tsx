import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1695 — every star button inside the lobby tile-rating widget contains
 * exactly one inner <svg> glyph that declares `viewBox="0 0 24 24"`,
 * pinning the coordinate system the star <path> is authored against.
 *
 * Sibling tests pin adjacent attributes of the SAME star buttons / glyphs:
 *   - W951  (LobbyTileRatingStars.test.tsx): `is-filled` count + `disabled`.
 *   - W1262 (LobbyTileRatingChecked.test.tsx): per-star `aria-checked`.
 *   - W1370 (LobbyTileRatingTag.test.tsx): outer wrapper-span tag/class.
 *   - W1530 (LobbyTileRatingStarType.test.tsx): explicit `type="button"`.
 *   - W1543 (LobbyTileRatingStarTabIndex.test.tsx): button `tabIndex={-1}`.
 *   - W1556 (LobbyTileRatingStarGlyphAria.test.tsx): inner SVG aria-hidden.
 *   - W1569 (LobbyTileRatingStarGlyphFocusable.test.tsx): SVG focusable=false.
 *   - W1581 (LobbyTileRatingStarLabel.test.tsx): button `aria-label` format.
 *   - W1660 (LobbyTileRatingStarTagName.test.tsx): button base className.
 *   - W1679 (LobbyTileRatingStarRoleAttr.test.tsx): button role="radio".
 *
 * None of those pin the inner SVG's `viewBox`. StarRating.tsx ~L179-185
 * renders an <svg> with `viewBox="0 0 24 24"` and a star <path> whose
 * coordinates (`d="M12 2.6l2.94 5.96 ..."` ~L187) are authored against
 * that exact 24×24 box. A refactor that swapped the viewBox (e.g. to
 * `0 0 16 16` or `0 0 32 32`) without rescaling the path would silently
 * crop or shrink the star glyph in every lobby tile rating widget, so
 * pinning the literal viewBox value catches the visual regression at
 * the unit-test layer rather than via screenshot diffs.
 *
 * `pool-10ball` reuses the canonical fixture id from W682/W951/W1262/
 * W1370/W1530/W1543/W1556/W1569: not a FEATURED game, so its tile
 * renders exactly once under the canonical `tile-<id>` testid, keeping
 * the inner-rating query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W951/W1262/W1370/W1530/W1543/W1556/W1569: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-rating star inner svg glyph viewBox=0 0 24 24 (W1695)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('declares viewBox="0 0 24 24" on the inner svg glyph of all 5 star buttons', async () => {
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
    // `viewBox="0 0 24 24"` (~L180) the path coordinates are authored
    // against. A regression that mutates the viewBox without rescaling
    // the path "d" attribute (~L187) would crop / shrink the star at
    // render time without throwing — pinning the exact string here
    // surfaces such drift at the unit-test layer.
    for (const star of stars) {
      const glyphs = star.querySelectorAll("svg");
      expect(glyphs).toHaveLength(1);
      expect(glyphs[0]).toHaveAttribute("viewBox", "0 0 24 24");
    }
  });
});

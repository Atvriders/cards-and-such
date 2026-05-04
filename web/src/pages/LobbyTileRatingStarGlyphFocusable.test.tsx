import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1569 — every star button inside the lobby tile-rating widget contains
 * exactly one inner <svg> glyph that carries `focusable="false"`, keeping
 * the decorative SVG out of the keyboard tab order on legacy IE/Edge and
 * preventing focus from ever landing on the inline <svg> instead of its
 * surrounding <button role="radio">.
 *
 * Sibling tests pin adjacent attributes of the SAME star buttons / glyphs:
 *   - W951  (LobbyTileRatingStars.test.tsx): `is-filled` count + `disabled`.
 *   - W1262 (LobbyTileRatingChecked.test.tsx): per-star `aria-checked`.
 *   - W1370 (LobbyTileRatingTag.test.tsx): outer wrapper-span tag/class.
 *   - W1530 (LobbyTileRatingStarType.test.tsx): explicit `type="button"`.
 *   - W1543 (LobbyTileRatingStarTabIndex.test.tsx): button `tabIndex={-1}`.
 *   - W1556 (LobbyTileRatingStarGlyphAria.test.tsx): inner SVG aria-hidden.
 *   - W682  (LobbyPage.test.tsx ~L2550): wrapper-span aria-label.
 *
 * None of those pin the inner SVG's `focusable` attribute. StarRating.tsx
 * ~L179-185 renders an <svg> inside every star button that explicitly
 * sets `focusable="false"`. SVG elements default to focusable=auto in
 * older Edge/IE which historically pulled the <svg> into the tab order
 * even when it sat inside a `tabIndex={-1}` button — breaking the
 * StarRating's keyboard model that funnels arrow-key navigation through
 * the OUTER radiogroup div (StarRating.tsx ~L82-103). Pinning
 * `focusable="false"` on the SVG ensures a future refactor that swaps
 * the inline <svg> for an icon-component (e.g. lucide-react's <Star/>)
 * does not silently drop the attribute and re-introduce a stray
 * focus-stop on every star glyph in every lobby tile.
 *
 * `pool-10ball` reuses the canonical fixture id from W682/W951/W1262/
 * W1370/W1530/W1543/W1556: not a FEATURED game, so its tile renders
 * exactly once under the canonical `tile-<id>` testid, keeping the
 * inner-rating query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W951/W1262/W1370/W1530/W1543/W1556: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-rating star inner svg glyph focusable=false (W1569)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('marks the inner svg glyph focusable="false" on all 5 star buttons', async () => {
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
    // (StarRating.tsx ~L179-193) and that glyph MUST carry
    // `focusable="false"` (~L184). Distinct from W1556's aria-hidden:
    // aria-hidden hides the SVG from assistive tech; focusable=false
    // keeps the SVG out of the keyboard tab order on legacy engines
    // that default SVG focusability to auto.
    for (const star of stars) {
      const glyphs = star.querySelectorAll("svg");
      expect(glyphs).toHaveLength(1);
      expect(glyphs[0]).toHaveAttribute("focusable", "false");
    }
  });
});

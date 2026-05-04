import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1556 — every star button inside the lobby tile-rating widget contains
 * exactly one inner <svg> glyph that carries `aria-hidden="true"`, hiding
 * the decorative star path from assistive tech.
 *
 * Sibling tests pin adjacent attributes of the SAME star buttons:
 *   - W951  (LobbyTileRatingStars.test.tsx): `is-filled` count + `disabled`.
 *   - W1262 (LobbyTileRatingChecked.test.tsx): per-star `aria-checked`.
 *   - W1370 (LobbyTileRatingTag.test.tsx): outer wrapper-span tag/class.
 *   - W1530 (LobbyTileRatingStarType.test.tsx): explicit `type="button"`.
 *   - W1543 (LobbyTileRatingStarTabIndex.test.tsx): `tabIndex={-1}`.
 *   - W682  (LobbyPage.test.tsx ~L2550): wrapper-span aria-label.
 *
 * None of those drill into the inner SVG glyph that paints each star.
 * StarRating.tsx ~L179-193 renders an <svg> inside every star button with
 * `aria-hidden="true"`. The button itself already carries `aria-label` /
 * `aria-checked` / `role="radio"` — the SVG is purely decorative paint and
 * MUST be hidden from screen readers, otherwise AT would announce the raw
 * SVG (and on some platforms its <path> data) on top of the button's own
 * "N stars, radio button, checked/not checked" announcement, doubling-up
 * each star with redundant noise.
 *
 * A regression that dropped the attribute (e.g. a refactor that swapped
 * the inline <svg> for a <Star /> wrapper component that forgot to pass
 * `aria-hidden` through, or a CSS/icon-font migration that left the node
 * exposed to AT) would silently inflate every screen-reader pass over
 * the lobby grid by 5x per visible rating widget.
 *
 * `pool-10ball` reuses the canonical fixture id from W682/W951/W1262/
 * W1370/W1530/W1543: not a FEATURED game, so its tile renders exactly
 * once under the canonical `tile-<id>` testid, keeping the inner-rating
 * query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W951/W1262/W1370/W1530/W1543: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — tile-rating star inner svg glyph aria-hidden (W1556)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hides the inner svg glyph from assistive tech on all 5 star buttons", async () => {
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
    // `aria-hidden="true"` (~L183). The button already speaks via its
    // aria-label / aria-checked / role="radio" attributes — the SVG is
    // decorative paint only and must NOT be re-announced by AT.
    for (const star of stars) {
      const glyphs = star.querySelectorAll("svg");
      expect(glyphs).toHaveLength(1);
      expect(glyphs[0]).toHaveAttribute("aria-hidden", "true");
    }
  });
});

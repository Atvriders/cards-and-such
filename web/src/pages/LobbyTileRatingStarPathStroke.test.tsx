import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1754 — every star button inside the lobby tile-rating widget renders
 * a single inner <svg> with exactly one <path> child, and that path
 * declares `stroke="currentColor"`.
 *
 * Sibling tests pin adjacent attributes of the SAME star buttons / glyphs
 * (W1262 aria-checked, W1370 wrapper, W1530 type=button, W1543 tabIndex,
 * W1556 SVG aria-hidden, W1569 SVG focusable, W1581 aria-label format,
 * W1660 button base className, W1679 button role="radio", W1695 SVG
 * viewBox, W1708 path stroke-linejoin, W1719 path stroke-linecap absent,
 * W1731 svg width=100%, W1744 svg height=100%). NONE of those pin the
 * inner <path>'s `stroke` attribute (StarRating.tsx ~L186-192) — `d`,
 * `fill`, `stroke`, and `strokeWidth` remain uncovered.
 *
 * `stroke="currentColor"` is the visual contract that lets the star
 * outline inherit the surrounding text/CSS color cascade — both the
 * filled and unfilled glyph variants rely on it (the filled variant
 * additionally sets `fill="currentColor"`, while the unfilled variant
 * uses `fill="none"` + this stroke). A regression that hard-codes a
 * literal color (e.g. `"#000"`) or drops the prop entirely would silently
 * break the theming/hover cascade across every lobby tile rating
 * without throwing.
 *
 * `pool-10ball` reuses the canonical fixture id from the W951 / W1262 /
 * W1370 / W1530 / W1543 / W1556 / W1569 / W1695 / W1708 cluster: not a
 * FEATURED game, so its tile renders exactly once under the canonical
 * `tile-<id>` testid, keeping the inner-rating query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the rest of the LobbyTileRatingStar* cluster: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating star inner path stroke=currentColor (W1754)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders stroke="currentColor" on the inner svg path of all 5 star buttons', async () => {
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
    // (~L186-192). The path MUST declare `stroke="currentColor"` so the
    // outline color cascades from the parent CSS context.
    for (const star of stars) {
      const paths = star.querySelectorAll("svg > path");
      expect(paths).toHaveLength(1);
      expect(paths[0].getAttribute("stroke")).toBe("currentColor");
    }
  });
});

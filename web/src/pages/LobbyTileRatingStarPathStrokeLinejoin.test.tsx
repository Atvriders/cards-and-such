import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1708 — every star button inside the lobby tile-rating widget renders
 * a single inner <svg> with exactly one <path> child, and that path
 * declares `stroke-linejoin="round"`.
 *
 * Sibling tests pin adjacent attributes of the SAME star buttons / glyphs
 * (W1262 aria-checked, W1370 wrapper, W1530 type=button, W1543 tabIndex,
 * W1556 SVG aria-hidden, W1569 SVG focusable, W1581 aria-label format,
 * W1660 button base className, W1679 button role="radio", W1695 SVG
 * viewBox). NONE of those pin attributes on the inner <path> element
 * (StarRating.tsx ~L186-192) — the `d`, `fill`, `stroke`, `strokeWidth`
 * and `strokeLinejoin` attributes are all currently uncovered.
 *
 * `strokeLinejoin="round"` is the visual contract that makes the star's
 * five outer points render as smoothly rounded peaks rather than sharp
 * miter spikes (which can extend well past the path bounds at the 1.6
 * stroke width used here). A regression that drops the prop or flips it
 * to `miter` / `bevel` would silently warp every lobby star glyph
 * without throwing — pinning the literal serialized value
 * `stroke-linejoin="round"` (React lowercases the SVG attribute on the
 * DOM) catches the regression at the unit-test layer rather than via
 * screenshot diffs.
 *
 * `pool-10ball` reuses the canonical fixture id from the W951 / W1262 /
 * W1370 / W1530 / W1543 / W1556 / W1569 / W1695 cluster: not a FEATURED
 * game, so its tile renders exactly once under the canonical
 * `tile-<id>` testid, keeping the inner-rating query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the rest of the LobbyTileRatingStar* cluster: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating star inner path stroke-linejoin=round (W1708)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders stroke-linejoin="round" on the inner svg path of all 5 star buttons', async () => {
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
    // (~L186-192). The path MUST declare `strokeLinejoin="round"` —
    // React serializes the camelCase prop to the lowercased SVG
    // attribute `stroke-linejoin` on the DOM, which is the form
    // `getAttribute` returns.
    for (const star of stars) {
      const paths = star.querySelectorAll("svg > path");
      expect(paths).toHaveLength(1);
      expect(paths[0].getAttribute("stroke-linejoin")).toBe("round");
    }
  });
});

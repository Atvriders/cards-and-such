import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1719 — every star button inside the lobby tile-rating widget renders
 * a single inner <svg> with exactly one <path> child, and that path does
 * NOT declare a `stroke-linecap` attribute (it relies on the SVG default
 * of `butt`).
 *
 * Sibling tests pin adjacent attributes of the SAME star buttons / glyphs
 * (W1262 aria-checked, W1370 wrapper, W1530 type=button, W1543 tabIndex,
 * W1556 SVG aria-hidden, W1569 SVG focusable, W1581 aria-label format,
 * W1660 button base className, W1679 button role="radio", W1695 SVG
 * viewBox, W1708 stroke-linejoin=round). NONE of those pin the absence
 * of `stroke-linecap` on the inner <path> element (StarRating.tsx
 * ~L186-192).
 *
 * The star path is a CLOSED shape — its `d` attribute begins at "M 12 2.6"
 * and terminates with "z" (close-path) at L17.7 — so every line segment
 * joins another at a corner and there are no free endpoints for a linecap
 * to render. Adding `stroke-linecap="round"` (or any non-default value)
 * would have no visual effect for the closed star but would inflate the
 * serialized DOM and signal intent that doesn't match the geometry,
 * potentially encouraging regressions when the glyph is later refactored
 * into an open path. Pinning the literal `null` from `getAttribute`
 * catches a regression that drops a stray linecap prop onto the path at
 * the unit-test layer rather than via screenshot diffs.
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
describe("LobbyPage — tile-rating star inner path stroke-linecap absent (W1719)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not declare stroke-linecap on the inner svg path of all 5 star buttons", async () => {
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
    // (~L186-192). The path MUST NOT declare `stroke-linecap` — React
    // would serialize the camelCase prop to the lowercased SVG attribute
    // `stroke-linecap` on the DOM, which `getAttribute` returns. The
    // closed star shape has no free endpoints so any linecap value is
    // pointless and the prop should remain absent.
    for (const star of stars) {
      const paths = star.querySelectorAll("svg > path");
      expect(paths).toHaveLength(1);
      expect(paths[0].getAttribute("stroke-linecap")).toBeNull();
    }
  });
});

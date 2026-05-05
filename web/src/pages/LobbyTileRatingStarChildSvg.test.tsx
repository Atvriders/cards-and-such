import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1798 — every star <button> inside the lobby tile-rating widget renders
 * EXACTLY ONE direct element child, and that child is the inline <svg>
 * glyph (StarRating.tsx ~L179-193). The SVG's child <path> is one level
 * deeper and is NOT a direct child of the button.
 *
 * Sibling tests pin OTHER attributes of the SAME 5 star buttons and the
 * SAME inner SVG/path, but none assert the BUTTON->SVG containment
 * (i.e. the button's direct-child cardinality + the firstElementChild
 * being the svg, not the path):
 *   - W951  (LobbyTileRatingStars.test.tsx): is-filled count + disabled.
 *   - W1262 (LobbyTileRatingChecked.test.tsx): per-star aria-checked.
 *   - W1530 (LobbyTileRatingStarType.test.tsx): per-star type="button".
 *   - W1543 (LobbyTileRatingStarTabIndex.test.tsx): per-star tabIndex=-1.
 *   - W1556 (LobbyTileRatingStarGlyphAria.test.tsx): inner svg aria-hidden.
 *   - W1569 (LobbyTileRatingStarGlyphFocusable.test.tsx): inner svg focusable.
 *   - W1581 (LobbyTileRatingStarLabel.test.tsx): per-star aria-label.
 *   - W1660 (LobbyTileRatingStarTagName.test.tsx): base star-rating-star class.
 *   - W1708 (LobbyTileRatingStarPathStrokeLinejoin.test.tsx): path strokeLinejoin.
 *   - W1719 (LobbyTileRatingStarPathStrokeLinecap.test.tsx): path linecap absent.
 *   - W1754 (LobbyTileRatingStarPathStroke.test.tsx): path stroke=currentColor.
 *   - W1764 (LobbyTileRatingStarPathStrokeWidth.test.tsx): path stroke-width.
 *   - W1775 (LobbyTileRatingStarPathD.test.tsx): path d.
 *   - W1786 (LobbyTileRatingStarPathFill.test.tsx): path fill toggle.
 *
 * Each of those keys off either the button OR a leaf svg/path attribute,
 * but none pin the BUTTON's direct-child count (which is implicitly 1) or
 * the structural fact that the FIRST direct child element of the button
 * is the SVG glyph — not a wrapping span/div, not the path, and not a
 * sibling overlay element.
 *
 * The contract matters because:
 *
 *   1. A regression that wrapped the SVG in an extra <span> (e.g. a
 *      tooltip wrapper, a focus-ring overlay, or a "Saved!" inline label
 *      mistakenly rendered per-star instead of replacing the radiogroup)
 *      would inflate `childElementCount` past 1 and shift the
 *      firstElementChild's tagName off "svg". None of the sibling tests
 *      catch that — they all use `within(...).querySelector("svg")` /
 *      `getAllByRole("radio")` patterns that would still find the SVG
 *      regardless of wrapping depth.
 *
 *   2. A regression that hoisted the <path> to be a direct child of the
 *      button (dropping the <svg> wrapper entirely — which would happen
 *      if a refactor moved the path into a CSS-mask treatment) would also
 *      surface here as `firstElementChild.tagName === "path"` instead of
 *      "svg", breaking the W1556/W1569/W1660 dependent assertions about
 *      `aria-hidden` / `focusable` / `viewBox` living on the svg layer.
 *
 *   3. The "inner sub-element distinct from path" angle is uniquely the
 *      SVG itself — pinning that the svg is the SOLE structural mediator
 *      between the button and the path is the cheapest defense against a
 *      DOM-tree-shape regression.
 *
 * Note: `firstElementChild.tagName` returns the tag in lowercase for SVG
 * elements in HTML documents (per the DOM spec — SVGElement preserves
 * case unlike HTMLElement). We pin the lowercase form to match jsdom +
 * browser behavior.
 *
 * `pool-10ball` reuses the same fixture id as the W951/W1262/W1530/W1543/
 * W1556/W1569/W1581/W1660/W1708/W1719/W1754/W1764/W1775/W1786 sibling
 * tests: not a FEATURED game, so its tile renders exactly once under the
 * canonical `tile-<id>` testid, keeping the inner-rating query
 * unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other Lobby tile-rating siblings: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating star button's only direct child is the inline svg (W1798)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("each star button has childElementCount=1 and firstElementChild.tagName='svg'", async () => {
    // Seed the canonical rating blob BEFORE mount so the page's useState
    // initializer hydrates synchronously via readRatings()
    // (LobbyPage.tsx ~L732). Value=3 yields a mix of filled (n=1..3) and
    // unfilled (n=4..5) stars so the structural pin holds for BOTH
    // branches of the path's `fill={filled ? "currentColor" : "none"}`
    // template at StarRating.tsx ~L188 — every button still has exactly
    // one svg child regardless of fill state.
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
    // this test stays anchored on the canonical surface rather than
    // drifting to a sibling rating widget if one ever appears.
    const ratingWidget = await screen.findByTestId("tile-rating-pool-10ball");

    // Five radio-role star buttons regardless of stored rating
    // (StarRating.tsx ~L156-196 maps over STARS = [1,2,3,4,5]).
    const stars = within(ratingWidget).getAllByRole("radio");
    expect(stars).toHaveLength(5);

    // For EVERY star button, pin the structural contract:
    //   - exactly one direct child element (the inline svg)
    //   - that child's tagName is "svg" (lowercase per SVGElement DOM
    //     casing — distinct from HTMLElement's uppercase tagName)
    //   - the path is NOT a direct child of the button — it lives one
    //     level deeper inside the svg
    for (const star of stars) {
      expect(star.childElementCount).toBe(1);
      const onlyChild = star.firstElementChild;
      expect(onlyChild).not.toBeNull();
      // SVG element tagName is preserved as lowercase in both jsdom and
      // browsers; pinning lowercase makes the assertion robust to env.
      expect(onlyChild!.tagName.toLowerCase()).toBe("svg");
      // Cross-check: the path lives INSIDE the svg, not as a direct
      // child of the button. A regression that flattened the structure
      // would surface here.
      expect(star.querySelector(":scope > path")).toBeNull();
      expect(onlyChild!.querySelector("path")).not.toBeNull();
    }
  });
});

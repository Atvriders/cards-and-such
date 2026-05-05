import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1819 — every star button's INNER <svg> glyph (StarRating.tsx ~L179-193)
 * renders EXACTLY ONE direct element child: the inline <path>.
 *
 * Sibling tests cover BUTTON->SVG containment and many svg/path attrs,
 * but none pin the SVG's OWN direct-child cardinality nor the SVG's
 * firstElementChild === <path> relationship:
 *   - W1798 (LobbyTileRatingStarChildSvg.test.tsx): button.childElementCount,
 *     button.firstElementChild.tagName === "svg" — pins the BUTTON layer.
 *   - W1648 (LobbyTileRatingChildCount.test.tsx): radiogroup.childElementCount === 5
 *     — pins the radiogroup layer, not the svg layer.
 *   - W1556/W1569/W1581/W1660/W1708/W1719/W1754/W1764/W1775/W1786 — leaf
 *     attribute pins on svg/path that would still pass if the SVG had
 *     extra siblings (e.g. a <title> for tooltip, a <desc>, a stray <g>
 *     wrapper, or a second decorative <path>).
 *
 * The contract matters: a regression that wrapped the path in a <g>,
 * inserted a <title>/<desc> for accessible naming, or appended a second
 * decorative <path> (e.g. an inner highlight overlay) would inflate the
 * svg's childElementCount past 1 and shift firstElementChild off the
 * canonical glyph path. None of the existing leaf tests catch that —
 * they all use querySelector("path") which finds the FIRST matching
 * descendant regardless of svg-direct-child shape.
 */
describe("LobbyPage — tile-rating star inner svg has exactly one child path (W1819)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("each star svg has childElementCount=1 and firstElementChild.tagName='path'", async () => {
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "pool-10ball": 3 }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const ratingWidget = await screen.findByTestId("tile-rating-pool-10ball");
    const stars = within(ratingWidget).getAllByRole("radio");
    expect(stars).toHaveLength(5);

    for (const star of stars) {
      const svg = star.firstElementChild;
      expect(svg).not.toBeNull();
      expect(svg!.tagName.toLowerCase()).toBe("svg");
      // SVG's OWN direct-child contract: exactly one child, the path.
      expect(svg!.childElementCount).toBe(1);
      const onlyChild = svg!.firstElementChild;
      expect(onlyChild).not.toBeNull();
      expect(onlyChild!.tagName.toLowerCase()).toBe("path");
    }
  });
});

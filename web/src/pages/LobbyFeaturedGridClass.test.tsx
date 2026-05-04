import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1559 — the Featured strip's inner grid wrapper carries the exact
 * `class` attribute string `"lobby-grid lobby-grid--featured"`, with no
 * extra utility classes, no debug hooks, and no other classes on the
 * wrapper element beyond those two.
 *
 * Why this needs its own pin:
 *  - W1255 (LobbyFeaturedSpark) pins the inner sparkle span inside the
 *    h2; W1515 (LobbyFeaturedHeadingText) pins the h2's textual
 *    contents; W1527 (LobbyFeaturedOrder) pins the section's child
 *    element count plus `classList.contains("lobby-grid")` and
 *    `classList.contains("lobby-grid--featured")` on the grid wrapper.
 *  - `classList.contains` is permissive — a regression that bolted on
 *    an extra utility class (e.g. `"lobby-grid lobby-grid--featured
 *    debug-outline"` from a stray dev hook, or `"lobby-grid
 *    lobby-grid--featured lobby-grid--feat"` for an experimental
 *    featured-only column tweak) would still pass W1527's `contains`
 *    assertions while silently bloating the lobby's CSS surface and
 *    breaking the intentional reuse of the shared Featured grid column
 *    rules across the Featured and Recommended strips.
 *  - Pinning the literal `getAttribute("class")` string here closes
 *    that gap by asserting class-set equality (not subset containment),
 *    so any added or reordered class on the featured grid wrapper trips
 *    this pin red. This mirrors W1548's coverage of the Recommended
 *    grid wrapper's exact class attribute, ensuring both sibling strips
 *    are pinned to the same canonical class string.
 *
 * The featured strip only renders when `query` is empty, `filter` is
 * "all", and `featured.length > 0`. The default lobby state satisfies
 * all three, so we expect the section to be present.
 */
describe("LobbyPage — Featured strip grid wrapper class attribute (W1559)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the featured grid wrapper with class=\"lobby-grid lobby-grid--featured\" verbatim", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const featured = document.querySelector<HTMLElement>(
      'section.lobby-featured[aria-label="Featured games"]',
    );
    expect(featured).not.toBeNull();

    // The grid wrapper is the section's last element child (pinned by
    // W1527); resolve it the same way so this pin is consistent with
    // the document-order assertions in the order test.
    const grid = featured!.lastElementChild as HTMLElement | null;
    expect(grid).not.toBeNull();
    expect(grid!.tagName).toBe("DIV");

    // Pin the exact `class` attribute string — class-set equality, not
    // a `classList.contains` subset check. The order is the order React
    // emits from the JSX template literal `lobby-grid lobby-grid--featured`,
    // so a regression that swapped the order or appended an extra class
    // would flip this red.
    expect(grid!.getAttribute("class")).toBe(
      "lobby-grid lobby-grid--featured",
    );
  });
});

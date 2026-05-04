import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1618 — the lobby tile-rating widget's wrapper <span> carries NO inline
 * `style` attribute.
 *
 * Sibling tests pin adjacent attributes of the SAME wrapper element:
 *   - W682  (LobbyPage.test.tsx): the wrapper's aria-label copy.
 *   - W965  (LobbyTileRatingNone.test.tsx): the gate-off case.
 *   - W1370 (LobbyTileRatingTag.test.tsx): the wrapper's tagName + className.
 *   - W1611 (LobbyTileRatingReadOnlyClass.test.tsx): inner radiogroup classes.
 *
 * None of those siblings forbid the wrapper from acquiring an inline
 * `style` attribute. That matters because:
 *
 *   1. The wrapper's badge/pill look is owned ENTIRELY by `tile-rating`
 *      class rules in LobbyPage.css (W1370 pins the class hook). A future
 *      refactor that drops in `style={{ display: "..." }}` (or pulls a
 *      computed token in) would bypass the CSS layer and start coupling
 *      runtime React state to presentation — exactly the kind of slow
 *      drift CSS-in-JSX migrations cause.
 *
 *   2. JSX `style` props serialize to an `style` HTML attribute even when
 *      the object is empty-ish (e.g. `{}`) only when truthy values are
 *      present, but ANY non-empty `style` prop will produce a populated
 *      attribute. Pinning `getAttribute("style") === null` rejects ALL
 *      such serializations in one hit.
 *
 *   3. JSDOM exposes the inline-style attribute literally (no computed-
 *      style fallback for unset values), so `getAttribute("style")` is
 *      the precise mechanism — `.style.cssText` would also work but is
 *      less direct about what the markup actually emitted.
 *
 * Standalone (non-family) game `pool-10ball` is reused from the W1370 /
 * W951 / W1262 fixture set so the rating-widget query stays unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other Lobby tile-rating siblings: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating wrapper has no inline style attribute (W1618)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-rating wrapper span without a style attribute", async () => {
    // Seed a stored rating BEFORE mount so the page's useState initializer
    // hydrates synchronously via readRatings() (LobbyPage.tsx ~L732).
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "pool-10ball": 3 }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Reach the wrapper via its W682-pinned testid so this test stays
    // anchored on the canonical surface rather than drifting to a sibling.
    const ratingWidget = await screen.findByTestId("tile-rating-pool-10ball");

    // Sanity: confirm we're talking about the W1370 wrapper, not the inner
    // radiogroup div — getAttribute would resolve either way, so anchoring
    // on tagName === SPAN guarantees we're checking the OUTER element's
    // markup contract.
    expect(ratingWidget.tagName).toBe("SPAN");

    // Pin the contract: the wrapper MUST emit zero inline style. ANY
    // `style={...}` JSX prop would serialize to a non-null attribute.
    expect(ratingWidget.getAttribute("style")).toBeNull();
  });
});

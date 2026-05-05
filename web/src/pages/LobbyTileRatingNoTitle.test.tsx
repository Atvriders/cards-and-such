import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2396 — pin that the lobby tile-rating wrapper `<span>` renders WITHOUT
 * a `title` attribute.
 *
 * The wrapper is the outer `<span class="tile-rating" data-testid="tile-rating-<id>">`
 * (LobbyPage.tsx ~L3044-3050). It carries an `aria-label="Your rating: N
 * of 5 stars"` (W682) for assistive-tech announcement; the screen-reader
 * surface MUST NOT be duplicated by a redundant native browser tooltip
 * stamped via the `title` attribute.
 *
 * Sibling tests pin adjacent attributes of the SAME outer wrapper:
 *   - W682  (LobbyPage.test.tsx ~L2550): wrapper aria-label copy.
 *   - W1370 (LobbyTileRatingTag.test.tsx): wrapper tagName + className.
 *   - W1618 (LobbyTileRatingWrapStyle.test.tsx): wrapper inline-style.
 *   - W2080 (LobbyTileRatingNoId.test.tsx): wrapper has no `id`.
 *   - W2219 (LobbyTileRatingNoRole.test.tsx): wrapper has no `role`.
 *   - W2206 (LobbyTileRatingAriaHidden.test.tsx): wrapper aria-hidden.
 *   - W1630 (LobbyTileRatingWrapClassEq.test.tsx): wrapper className eq.
 *   - W2266 (LobbyTileRatingNoTabindex.test.tsx): wrapper tabindex absence.
 *
 * None of those pin ABSENCE of the `title` attribute on the outer
 * wrapper. A regression that added `title={`Your rating: ${userRating}
 * of 5 stars`}` (e.g. as a "hover-tooltip mirror" of the aria-label)
 * would slip past the existing suite, because:
 *
 *   1. The browser would render a native OS-level tooltip on hover that
 *      duplicates the screen-reader announcement, doubling the verbosity
 *      AT users hear when their cursor lingers (some screen readers
 *      announce both `aria-label` AND `title` in sequence, producing
 *      "Your rating: 3 of 5 stars. Your rating: 3 of 5 stars.").
 *
 *   2. The native tooltip would also surface to ALL users (including
 *      sighted, mouse-only ones) as a transient delayed-render box that
 *      the design system explicitly does not provide — the lobby tile's
 *      hover affordance is the "Play" CTA chip and the tile-card lift,
 *      not a stray system tooltip on a decorative rating pill.
 *
 *   3. A `title` attribute is not picked up by the existing className /
 *      tagName / aria-* sibling tests, so this gap can be patched only
 *      by an explicit `hasAttribute("title")` assertion.
 *
 * `pool-10ball` is reused from the W682/W951/W1262/W1370/W1618/W1624/W2266
 * sibling fixtures: not a FEATURED game, so its tile renders exactly
 * once under the canonical `tile-<id>` testid, keeping the wrapper
 * query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other Lobby tile-rating siblings: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating outer wrapper has no title attribute (W2396)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-rating wrapper <span> without a `title` attribute", async () => {
    // Seed the canonical rating blob BEFORE mount so the page's useState
    // initializer hydrates synchronously via readRatings()
    // (LobbyPage.tsx ~L732). Without a non-zero rating the wrapper is
    // gated out by `userRating > 0` (LobbyPage.tsx ~L3043).
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "pool-10ball": 3 }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Reach the wrapper through the W682-pinned testid so this test
    // stays anchored on the canonical surface rather than drifting to
    // a sibling widget if one ever appears.
    const wrap = await screen.findByTestId("tile-rating-pool-10ball");

    // Core assertion: the wrapper carries NO `title` attribute. Using
    // `hasAttribute` (rather than reading `wrap.title`, which returns
    // an empty string for "no attribute set" — indistinguishable from
    // an explicit `title=""`) is the only way to pin true absence of
    // the attribute on the DOM node.
    expect(wrap.hasAttribute("title")).toBe(false);
  });
});

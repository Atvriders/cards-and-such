import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2266 — pin that the lobby tile-rating wrapper `<span>` renders WITHOUT
 * a `tabindex` attribute.
 *
 * The wrapper is the outer `<span class="tile-rating" data-testid="tile-rating-<id>">`
 * (LobbyPage.tsx ~L3044-3050). It is purely a decorative pill that holds
 * the inner read-only StarRating widget — the keyboard-navigable surface
 * is the enclosing tile `<a>` (W545 grid-roving tabindex), and the inner
 * radiogroup root has its own `tabIndex=-1` contract pinned by W1624
 * (LobbyTileRatingRootTabIndex.test.tsx). The OUTER wrapper itself must
 * stay out of the tab order entirely, with NO `tabindex` attribute set.
 *
 * Sibling tests pin adjacent attributes of the SAME outer wrapper:
 *   - W682  (LobbyPage.test.tsx ~L2550): wrapper aria-label copy.
 *   - W1370 (LobbyTileRatingTag.test.tsx): wrapper tagName + className.
 *   - W1618 (LobbyTileRatingWrapStyle.test.tsx): wrapper inline-style.
 *   - W?   (LobbyTileRatingNoId.test.tsx): wrapper has no `id`.
 *   - W?   (LobbyTileRatingNoRole.test.tsx): wrapper has no `role`.
 *   - W?   (LobbyTileRatingAriaHidden.test.tsx): wrapper aria-hidden.
 *   - W?   (LobbyTileRatingWrapClassEq.test.tsx): wrapper className eq.
 *
 * None of those pin ABSENCE of the `tabindex` attribute on the outer
 * wrapper. W1624 covers the INNER radiogroup div, which is a separate
 * DOM node with its own independent tabIndex contract. A regression
 * that stamped `tabIndex={0}` (or even `tabIndex={-1}`) onto the outer
 * wrapper — e.g. to make the badge itself programmatically focusable
 * for a tooltip-on-focus pattern — would slip past the existing suite,
 * because:
 *
 *   1. `tabIndex={0}` would inject an extra Tab stop on EVERY tile that
 *      has a stored rating, doubling the keyboard surface inside each
 *      tile (the tile <a> AND the rating wrapper would both be focusable).
 *      That would silently break the W545 roving-tabindex contract,
 *      which assumes ONE tab stop per tile.
 *
 *   2. Even `tabIndex={-1}` (programmatically focusable, skipped by Tab)
 *      would leak a stray focus target that AT users could land on via
 *      `element.focus()` calls, surfacing a "rating widget" focus ring
 *      around a non-interactive decorative span. Pinning ABSENCE of the
 *      attribute (rather than `tabIndex === -1`) catches both regressions
 *      with a single assertion.
 *
 *   3. Reading via `.tabIndex` (the DOM IDL property) collapses both
 *      "no attribute set" and "explicit tabindex='-1'" into the same
 *      numeric default of -1 for a non-interactive `<span>`. The only
 *      way to distinguish "no attribute" from "explicit -1" is via
 *      `hasAttribute("tabindex")` — which is what this test pins.
 *
 * `pool-10ball` is reused from the W682/W951/W1262/W1370/W1618/W1624
 * sibling fixtures: not a FEATURED game, so its tile renders exactly
 * once under the canonical `tile-<id>` testid, keeping the wrapper
 * query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other Lobby tile-rating siblings: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating outer wrapper has no tabindex attribute (W2266)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-rating wrapper <span> without a `tabindex` attribute", async () => {
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

    // Core assertion: the wrapper carries NO `tabindex` attribute.
    // Using `hasAttribute` (rather than reading `wrap.tabIndex`, which
    // returns a numeric default of -1 for a non-interactive <span>) is
    // the only way to distinguish "no attribute set" from "explicit
    // tabindex={-1}" — we want both to fail-forward as "decorative
    // wrapper, never in any focus path".
    expect(wrap.hasAttribute("tabindex")).toBe(false);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1636 — the lobby tile-rating widget's INNER StarRating radiogroup
 * root is a `<div>`. StarRating.tsx ~L146 emits a literal `<div ...>`
 * as the radiogroup container, and LobbyPage.tsx ~L3049 wraps it inside
 * a `<span class="tile-rating">`. Pinning the radiogroup root's
 * `tagName === "DIV"` is a structural sentinel that's distinct from the
 * sibling tests below.
 *
 * Sibling tests pin adjacent attributes of the SAME inner StarRating
 * (radiogroup root) but NOT its tagName:
 *   - W1370 (LobbyTileRatingTag.test.tsx): the OUTER wrapper-span
 *     tagName === "SPAN" (a different DOM element entirely).
 *   - W1597 (LobbyTileRatingDataValue.test.tsx): inner radiogroup
 *     `data-value` attribute.
 *   - W1604 (LobbyTileRatingInnerLabel.test.tsx): inner radiogroup
 *     `aria-label`.
 *   - W1611 (LobbyTileRatingReadOnlyClass.test.tsx): inner radiogroup
 *     `className` tokens.
 *   - W1624 (LobbyTileRatingRootTabIndex.test.tsx): inner radiogroup
 *     `tabIndex=-1`.
 *
 * None of those siblings pin the radiogroup root's HTML tagName.
 * `getByRole("radiogroup")` would still match if StarRating swapped
 * the `<div>` for, say, a `<fieldset>` or a `<ul>` — both of which
 * accept `role="radiogroup"` overrides without warning but would
 * change the rendered semantics:
 *
 *   1. A `<fieldset>` would inject native `disabled`-cascade behaviour
 *      across descendant buttons, silently disabling all five star
 *      buttons whenever a parent form was disabled — breaking the
 *      widget's read-only-vs-interactive contract.
 *
 *   2. A `<ul>` (or `<ol>`/`<menu>`) would force AT users to traverse
 *      a list-item announcement before reaching the radiogroup, since
 *      most screen readers narrate list semantics even when an
 *      explicit ARIA role overrides them.
 *
 *   3. Block-level vs inline-level swaps (e.g. `<div>` to `<section>`)
 *      change the default flow inside the inline `tile-rating` span,
 *      potentially line-breaking the rating widget mid-row of the
 *      tile footer.
 *
 * Pinning `tagName === "DIV"` catches all three regressions without
 * needing to enumerate every disallowed alternative.
 *
 * `pool-10ball` reuses the same fixture id as the W1597/W1604/W1611/
 * W1624 sibling tests: not a FEATURED game, so its tile renders exactly
 * once under the canonical `tile-<id>` testid, keeping the
 * inner-rating query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other Lobby tile-rating siblings: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating inner radiogroup root is a <div> (W1636)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner StarRating radiogroup root as a DIV element", async () => {
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
    // stays anchored on the canonical surface rather than drifting to a
    // sibling widget if one ever appears.
    const ratingWidget = await screen.findByTestId("tile-rating-pool-10ball");

    // The inner StarRating renders a radiogroup-role element as its
    // single direct child of the wrapper span (StarRating.tsx ~L146).
    const radiogroup = within(ratingWidget).getByRole("radiogroup");

    // The radiogroup root MUST be a <div> — StarRating.tsx ~L146 emits
    // a literal `<div ...>` as the radiogroup container. tagName is
    // upper-cased on HTML elements per the DOM spec, so we compare
    // against "DIV".
    expect(radiogroup.tagName).toBe("DIV");
  });
});

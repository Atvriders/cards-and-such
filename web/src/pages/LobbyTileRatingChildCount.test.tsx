import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1648 — the lobby tile-rating widget's INNER StarRating radiogroup root
 * (the <div role="radiogroup"> at StarRating.tsx ~L146-155) renders
 * EXACTLY 5 direct element children — one <button role="radio"> per star
 * (StarRating.tsx ~L156-196 maps over the `STARS = [1,2,3,4,5]` constant).
 *
 * This pins the radiogroup root's `childElementCount`, distinct from
 * already-covered surfaces:
 *   - W951  (LobbyTileRatingStars.test.tsx): `getAllByRole("radio")` length —
 *           counts radio-role descendants, not the root's direct children.
 *           A regression that wrapped each star in an extra <span> (e.g.
 *           a tooltip wrapper) would still yield 5 radios but inflate the
 *           root's `childElementCount` past 5.
 *   - W1262 (LobbyTileRatingChecked.test.tsx): per-star aria-checked.
 *   - W1370 (LobbyTileRatingTag.test.tsx): outer wrapper-span tag+class.
 *   - W1530 (LobbyTileRatingStarType.test.tsx): per-star type="button".
 *   - W1543 (LobbyTileRatingStarTabIndex.test.tsx): per-star tabIndex=-1.
 *   - W1556 (LobbyTileRatingStarGlyphAria.test.tsx): per-star svg aria-hidden.
 *   - W1569 (LobbyTileRatingStarGlyphFocusable.test.tsx): per-star svg focusable.
 *   - W1581 (LobbyTileRatingStarLabel.test.tsx): per-star aria-label format.
 *   - W1597 (LobbyTileRatingDataValue.test.tsx): inner radiogroup data-value.
 *   - W1604 (LobbyTileRatingInnerLabel.test.tsx): inner radiogroup aria-label.
 *   - W1611 (LobbyTileRatingReadOnlyClass.test.tsx): inner radiogroup className.
 *   - W1624 (LobbyTileRatingRootTabIndex.test.tsx): inner radiogroup tabIndex.
 *   - W1636 (LobbyTileRatingRootTag.test.tsx): inner radiogroup tagName=DIV.
 *
 * None of those pin the root's DIRECT-child cardinality. It matters because:
 *
 *   1. `childElementCount === 5` is the structural contract that the
 *      radiogroup root holds nothing OTHER than the 5 star buttons in the
 *      non-saved branch. A regression that injected a sibling element
 *      (e.g. a hint <span>, a tooltip portal, or — most subtly — left the
 *      `data-saved="true"` "Saved" toast branch's <span> rendered alongside
 *      the stars) would surface here as a 6+ child count even while every
 *      sibling test still passes.
 *
 *   2. The non-saved branch (StarRating.tsx ~L145-198) returns a fragment-
 *      free <div> whose ONLY children are produced by the `STARS.map(...)`
 *      call. Pinning `childElementCount === 5` is the cheapest cross-check
 *      that no leading/trailing decorative element snuck in.
 *
 *   3. A read-only lobby tile (LobbyPage.tsx ~L3049: `readOnly size="sm"`)
 *      MUST render via the non-saved branch — the saved branch is gated on
 *      `interactive` (StarRating.tsx ~L105). If a regression collapsed both
 *      branches into one render path, the saved branch's inner <span>
 *      (StarRating.tsx ~L121) would replace the stars and drop
 *      childElementCount to 1.
 *
 * `pool-10ball` reuses the same fixture id as the W951/W1262/W1370/W1530/
 * W1543/W1556/W1569/W1581/W1597/W1604/W1611/W1624/W1636 sibling tests:
 * not a FEATURED game, so its tile renders exactly once under the canonical
 * `tile-<id>` testid, keeping the inner-rating query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other Lobby tile-rating siblings: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating inner radiogroup root has childElementCount=5 (W1648)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders exactly 5 direct element children on the inner StarRating radiogroup div", async () => {
    // Seed the canonical rating blob BEFORE mount so the page's useState
    // initializer hydrates synchronously via readRatings()
    // (LobbyPage.tsx ~L732).
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "pool-10ball": 2 }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Reach the wrapper through the W682-pinned testid so this test stays
    // anchored on the canonical surface rather than drifting to a sibling
    // widget if one ever appears.
    const ratingWidget = await screen.findByTestId("tile-rating-pool-10ball");

    // The inner StarRating renders a radiogroup-role div as its single
    // direct child of the wrapper span (StarRating.tsx ~L146-155).
    const radiogroup = within(ratingWidget).getByRole("radiogroup");

    // The structural contract: exactly 5 direct element children — one
    // <button role="radio"> per star produced by `STARS.map(...)`
    // (StarRating.tsx ~L156-196). `childElementCount` excludes text/comment
    // nodes, so it pins the ELEMENT count regardless of any whitespace
    // formatting React may emit between siblings.
    expect(radiogroup.childElementCount).toBe(5);

    // Cross-check: every direct child is a <button> star, so the count
    // doesn't accidentally pass via 5 unrelated siblings (e.g. if a future
    // regression wrapped 4 stars in a fragment AND added a stray <span>).
    const directChildren = Array.from(radiogroup.children);
    expect(directChildren).toHaveLength(5);
    for (const child of directChildren) {
      expect(child.tagName).toBe("BUTTON");
    }
  });
});

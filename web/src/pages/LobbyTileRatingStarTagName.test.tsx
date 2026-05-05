import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1660 — every star <button> inside the lobby tile-rating widget carries
 * the base `star-rating-star` className token (StarRating.tsx ~L166:
 * `className={`star-rating-star${filled ? " is-filled" : ""}`}`).
 *
 * Sibling tests pin OTHER attributes of the SAME 5 star buttons but none
 * of them assert the BASE class token specifically:
 *   - W951  (LobbyTileRatingStars.test.tsx): `is-filled` count + `disabled`.
 *           Only checks the FILL-state class — a regression that renamed
 *           the base token to `rating-star` (or dropped the base token
 *           entirely while keeping the `is-filled` modifier) would still
 *           pass W951's `classList.contains("is-filled")` check.
 *   - W1262 (LobbyTileRatingChecked.test.tsx): per-star aria-checked.
 *   - W1370 (LobbyTileRatingTag.test.tsx): outer wrapper-span tag.
 *   - W1530 (LobbyTileRatingStarType.test.tsx): per-star type="button" + tagName.
 *   - W1543 (LobbyTileRatingStarTabIndex.test.tsx): per-star tabIndex=-1.
 *   - W1556 (LobbyTileRatingStarGlyphAria.test.tsx): per-star svg aria-hidden.
 *   - W1569 (LobbyTileRatingStarGlyphFocusable.test.tsx): per-star svg focusable.
 *   - W1581 (LobbyTileRatingStarLabel.test.tsx): per-star aria-label format.
 *   - W1597 (LobbyTileRatingDataValue.test.tsx): inner radiogroup data-value.
 *   - W1604 (LobbyTileRatingInnerLabel.test.tsx): inner radiogroup aria-label.
 *   - W1611 (LobbyTileRatingReadOnlyClass.test.tsx): inner radiogroup className.
 *   - W1624 (LobbyTileRatingRootTabIndex.test.tsx): inner radiogroup tabIndex.
 *   - W1636 (LobbyTileRatingRootTag.test.tsx): inner radiogroup tagName=DIV.
 *   - W1648 (LobbyTileRatingChildCount.test.tsx): root child count + child tagName.
 *
 * The base `star-rating-star` token is load-bearing: StarRating.css scopes
 * the entire visual treatment (size, hit-area, focus ring, hover preview,
 * filled vs. unfilled svg fill) to that selector. A regression that
 * renamed the token would silently strip ALL star styling — every button
 * would still be a clickable radio with the right aria semantics, but
 * would render as bare default-styled buttons that no longer look like
 * stars at all. None of the existing sibling assertions would catch that
 * because they all key off behavior + structure rather than the base class.
 *
 * `pool-10ball` reuses the same fixture id as the W682/W951/W1262/W1370/
 * W1530/W1543/W1556/W1569/W1581/W1597/W1604/W1611/W1624/W1636/W1648 sibling
 * tests: not a FEATURED game, so its tile renders exactly once under the
 * canonical `tile-<id>` testid, keeping the inner-rating query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other Lobby tile-rating siblings: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating star buttons carry base 'star-rating-star' class (W1660)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("every star button has the base star-rating-star className token", async () => {
    // Seed the canonical rating blob BEFORE mount so the page's useState
    // initializer hydrates synchronously via readRatings()
    // (LobbyPage.tsx ~L732). Value=2 yields 2 filled + 3 unfilled stars,
    // exercising BOTH the `is-filled` and the bare-base-class branches of
    // the className template at StarRating.tsx ~L166.
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "pool-10ball": 2 }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Reach the rating widget through its W682-pinned wrapper testid so
    // this test stays anchored on the canonical surface rather than
    // drifting to a sibling widget if one ever appears.
    const ratingWidget = await screen.findByTestId("tile-rating-pool-10ball");

    // Five radio-role star buttons regardless of stored rating
    // (StarRating.tsx ~L156-196 maps over STARS = [1,2,3,4,5]).
    const stars = within(ratingWidget).getAllByRole("radio");
    expect(stars).toHaveLength(5);

    // Every star MUST carry the base `star-rating-star` class token. This
    // pins the FIRST half of the className template at StarRating.tsx ~L166.
    // Using `classList.contains` rather than a substring match guarantees
    // we're matching a discrete token (not e.g. a class named
    // `not-star-rating-starry-night` that happens to contain the substring),
    // which makes the assertion robust against future class additions.
    for (const star of stars) {
      expect(star.classList.contains("star-rating-star")).toBe(true);
    }
  });
});

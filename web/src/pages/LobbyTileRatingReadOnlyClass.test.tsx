import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1611 — the lobby tile-rating widget's INNER StarRating radiogroup
 * <div> carries the read-only-mode className tokens stamped by
 * StarRating.tsx ~L147:
 *
 *     `star-rating star-rating--sm is-readonly`
 *
 * This pins the radiogroup root's CSS surface, distinct from the
 * already-pinned `data-value` (W1597), `aria-label` (W1604), per-star
 * `aria-checked` (W1262), and outer wrapper-span tag+class (W1370).
 *
 * Sibling tests pin adjacent attributes of the SAME inner StarRating:
 *   - W682  (LobbyPage.test.tsx ~L2550): outer wrapper-span aria-label.
 *   - W951  (LobbyTileRatingStars.test.tsx): per-star is-filled count.
 *   - W1262 (LobbyTileRatingChecked.test.tsx): per-star aria-checked.
 *   - W1370 (LobbyTileRatingTag.test.tsx): outer wrapper-span tag+class.
 *   - W1530 (LobbyTileRatingStarType.test.tsx): per-star type="button".
 *   - W1543 (LobbyTileRatingStarTabIndex.test.tsx): per-star tabIndex=-1.
 *   - W1556 (LobbyTileRatingStarGlyphAria.test.tsx): per-star svg aria-hidden.
 *   - W1569 (LobbyTileRatingStarGlyphFocusable.test.tsx): per-star svg focusable.
 *   - W1581 (LobbyTileRatingStarLabel.test.tsx): per-star aria-label format.
 *   - W1597 (LobbyTileRatingDataValue.test.tsx): inner radiogroup data-value.
 *   - W1604 (LobbyTileRatingInnerLabel.test.tsx): inner radiogroup aria-label.
 *
 * None of those pin the radiogroup root's className. It matters because:
 *
 *   1. The `is-readonly` token is the load-bearing CSS hook that suppresses
 *      hover/focus chrome on lobby tiles — without it the read-only stars
 *      would adopt the `is-interactive` styling (cursor:pointer, hover
 *      brighten) and visually pretend to be clickable while the underlying
 *      buttons are `disabled` (StarRating.tsx ~L167). That mismatch is a
 *      WCAG 1.3.1 failure surfaced only via a className regression.
 *
 *   2. The `--sm` size modifier is the only signal that the lobby variant
 *      gets the compact 14-px star metric instead of the default 18-px.
 *      A regression that flipped the prop default or dropped the size
 *      pass-through would silently inflate every tile-rating widget.
 *
 *   3. `LobbyPage.tsx` ~L3049 calls `<StarRating readOnly size="sm">` —
 *      pinning the rendered class chain catches a regression at EITHER
 *      end (LobbyPage stops passing the props OR StarRating stops mapping
 *      them to className tokens).
 *
 * `pool-10ball` reuses the same fixture id as the W682/W951/W1262/W1370/
 * W1530/W1543/W1556/W1569/W1581/W1597/W1604 sibling tests: not a FEATURED
 * game, so its tile renders exactly once under the canonical
 * `tile-<id>` testid, keeping the inner-rating query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other Lobby tile-rating siblings: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating inner radiogroup carries read-only className tokens (W1611)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stamps `star-rating star-rating--sm is-readonly` on the inner StarRating radiogroup div", async () => {
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

    // Reach the wrapper through the W682-pinned testid so this test stays
    // anchored on the canonical surface rather than drifting to a sibling
    // widget if one ever appears.
    const ratingWidget = await screen.findByTestId("tile-rating-pool-10ball");

    // The inner StarRating renders a radiogroup-role div as its single
    // direct child of the wrapper span (StarRating.tsx ~L146-155).
    const radiogroup = within(ratingWidget).getByRole("radiogroup");

    // The radiogroup div MUST carry all three className tokens — the base
    // `star-rating`, the `--sm` size modifier (LobbyPage passes size="sm"),
    // and `is-readonly` (LobbyPage passes readOnly + omits onChange,
    // making interactive=false at StarRating.tsx ~L37).
    expect(radiogroup).toHaveClass("star-rating");
    expect(radiogroup).toHaveClass("star-rating--sm");
    expect(radiogroup).toHaveClass("is-readonly");

    // Cross-mode guard: the radiogroup MUST NOT carry the `is-interactive`
    // token reserved for editable instances. Without this, a regression
    // that flipped the interactive branch (e.g. defaulted onChange to a
    // no-op) would still satisfy a positive `is-readonly` match if the
    // class chain stamped BOTH tokens.
    expect(radiogroup).not.toHaveClass("is-interactive");
  });
});

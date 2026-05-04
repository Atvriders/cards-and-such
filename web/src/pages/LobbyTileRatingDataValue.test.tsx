import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1597 — the lobby tile-rating widget's INNER StarRating radiogroup
 * <div> stamps a `data-value` attribute mirroring the numeric rating
 * value (StarRating.tsx ~L151). This is an extra production hook
 * orthogonal to the per-star `aria-checked` semantics already pinned
 * by W1262.
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
 *
 * None of those touch the radiogroup root's `data-value`. It matters
 * because the attribute is the canonical CSS / scripting hook for the
 * "current rating" surface — used by integrators (and any future
 * styling that wants to e.g. tint the badge differently for 5-star
 * games) without re-deriving the value from the per-star aria-checked
 * scan. A regression that dropped the attribute (or stamped the hover
 * value instead of `value`) would silently break that contract AND
 * remove the only directly-machine-readable copy of the persisted
 * rating from the lobby DOM.
 *
 * `pool-10ball` reuses the same fixture id as the W682/W951/W1262/W1370/
 * W1530/W1543/W1556/W1569/W1581 sibling tests: not a FEATURED game, so
 * its tile renders exactly once under the canonical `tile-<id>` testid.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other Lobby tile-rating siblings: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating inner radiogroup carries data-value (W1597)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stamps data-value on the inner StarRating radiogroup div", async () => {
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
    // direct child of the wrapper span (StarRating.tsx ~L146).
    const radiogroup = within(ratingWidget).getByRole("radiogroup");

    // The radiogroup div MUST carry data-value with the seeded numeric
    // rating, stringified by React's standard data-* serialization.
    // A regression that dropped the attribute, mis-typed it, or stamped
    // the hover value (which is gated by interactive=true; the lobby
    // renders read-only) would surface here.
    expect(radiogroup).toHaveAttribute("data-value", "3");
  });
});

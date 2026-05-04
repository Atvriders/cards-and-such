import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1624 — the lobby tile-rating widget's INNER StarRating radiogroup
 * <div> carries `tabIndex=-1` because the lobby renders the widget in
 * read-only mode. StarRating.tsx ~L154 stamps
 * `tabIndex={interactive ? 0 : -1}`; LobbyPage.tsx ~L3049 passes
 * `readOnly` (and no `onChange`), making `interactive=false` and
 * pinning the radiogroup root OUT of the natural Tab-key sequence.
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
 *   - W1611 (LobbyTileRatingReadOnlyClass.test.tsx): radiogroup is-readonly.
 *   - W1618 (LobbyTileRatingWrapStyle.test.tsx): outer wrapper inline-style.
 *
 * None of those pin the radiogroup root's tabIndex. W1543 covers the
 * per-star buttons; this test covers the GROUP root, which is a
 * separate DOM element with its own independent tabIndex contract.
 *
 * It matters because:
 *
 *   1. The lobby's tile-rating is purely informational — a read-only
 *      mirror of the rating the user already submitted in PlayPage. If
 *      the radiogroup root were Tab-focusable (tabIndex=0), the lobby
 *      would inject an extra Tab stop on EVERY tile that has a rating,
 *      flooding keyboard users with a "rating, radiogroup" announcement
 *      mid-grid even though there's nothing to interact with.
 *
 *   2. StarRating.tsx ~L154 makes the tabIndex conditional on the
 *      `interactive` flag — so a regression at the LobbyPage call site
 *      (e.g. dropping the `readOnly` prop, or wiring an `onChange`
 *      handler "just to track impressions") would silently flip the
 *      lobby tile-rating into interactive mode. The tabIndex sentinel
 *      catches that even when no other attribute changes.
 *
 *   3. The widget's radiogroup pattern relies on Arrow keys for
 *      navigation, but Arrow handlers no-op when `interactive=false`
 *      (StarRating.tsx ~L84). Pinning tabIndex=-1 on the root closes
 *      the loop: the group is unfocusable AND its keyboard handlers
 *      are inert, eliminating any phantom keyboard surface in the
 *      lobby DOM.
 *
 * `pool-10ball` reuses the same fixture id as the W682/W951/W1262/W1370/
 * W1530/W1543/W1556/W1569/W1581/W1597/W1604/W1611/W1618 sibling tests:
 * not a FEATURED game, so its tile renders exactly once under the
 * canonical `tile-<id>` testid, keeping the inner-rating query
 * unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other Lobby tile-rating siblings: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating inner radiogroup root carries tabIndex=-1 in read-only mode (W1624)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stamps tabIndex=-1 on the read-only inner StarRating radiogroup div", async () => {
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

    // The inner StarRating renders a radiogroup-role div as its single
    // direct child of the wrapper span (StarRating.tsx ~L146-155).
    const radiogroup = within(ratingWidget).getByRole("radiogroup");

    // The radiogroup root MUST carry tabIndex=-1 — StarRating.tsx ~L154
    // emits `tabIndex={interactive ? 0 : -1}` and LobbyPage's read-only
    // call site flips that to -1. Reading via `.tabIndex` (the DOM
    // IDL property) collapses both `tabindex="-1"` and a missing
    // attribute into the same numeric value, so we ALSO pin the raw
    // attribute below to catch a regression that drops the explicit
    // tabIndex prop entirely (which would yield IDL=-1 by default for
    // a non-interactive element AND lose the explicit hook).
    expect(radiogroup.tabIndex).toBe(-1);
    expect(radiogroup).toHaveAttribute("tabindex", "-1");
  });
});

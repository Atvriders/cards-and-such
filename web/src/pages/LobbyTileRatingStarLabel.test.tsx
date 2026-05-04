import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1581 — every star <button> inside the lobby tile-rating widget carries
 * an `aria-label` of the canonical format `"N star"` (singular for n=1)
 * or `"N stars"` (plural for n=2..5), pinning the n===1 ternary branch
 * at StarRating.tsx ~L165 (`${n} star${n === 1 ? "" : "s"}`).
 *
 * Sibling tests pin adjacent attributes of the SAME star buttons / glyphs:
 *   - W951  (LobbyTileRatingStars.test.tsx): `is-filled` count + `disabled`.
 *           Touches `aria-label` ONLY for the unfilled remainder ("5 stars")
 *           as a sanity-check — does NOT pin the full 5-label sequence.
 *   - W1262 (LobbyTileRatingChecked.test.tsx): per-star `aria-checked`.
 *           Touches `aria-label` ONLY for the checked star ("3 stars") as
 *           a sanity-check — does NOT pin the full 5-label sequence.
 *   - W1370 (LobbyTileRatingTag.test.tsx): outer wrapper-span tag/class.
 *   - W1530 (LobbyTileRatingStarType.test.tsx): explicit `type="button"`.
 *   - W1543 (LobbyTileRatingStarTabIndex.test.tsx): button `tabIndex={-1}`.
 *   - W1556 (LobbyTileRatingStarGlyphAria.test.tsx): inner SVG aria-hidden.
 *   - W1569 (LobbyTileRatingStarGlyphFocusable.test.tsx): inner SVG focusable.
 *   - W682  (LobbyPage.test.tsx ~L2550): wrapper-span aria-label.
 *
 * None of those drill into the per-star aria-label STRING FORMAT — in
 * particular, none of them exercise the `n === 1` singular branch
 * (`"1 star"`, no trailing 's'). A regression that flipped the ternary
 * (e.g. dropped the `n === 1` check and always appended `"s"`, yielding
 * `"1 stars"`) would silently produce ungrammatical screen-reader
 * announcements for every rating widget across the lobby grid AND every
 * other consumer of StarRating, but would NOT be caught by W951 or W1262
 * because both happen to seed ratings (4 / 3) that miss the n=1 branch.
 *
 * Pinning all 5 labels at once also catches:
 *   1. A regression that swapped to a different localized format (e.g.
 *      `"Rate N"` or `"Star N"`) — would surface as ALL five mismatching.
 *   2. A regression that dropped the `${n}` interpolation and rendered
 *      the literal template string `"${n} stars"` — would surface as
 *      five identical labels instead of five distinct ordinal labels.
 *   3. A regression that reversed the ordering (5..1 instead of 1..5)
 *      — would surface as `stars[0]` carrying "5 stars" instead of
 *      "1 star".
 *
 * `pool-10ball` reuses the canonical fixture id from W682/W951/W1262/
 * W1370/W1530/W1543/W1556/W1569: not a FEATURED game, so its tile renders
 * exactly once under the canonical `tile-<id>` testid, keeping the
 * inner-rating query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W951/W1262/W1370/W1530/W1543/W1556/W1569: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating star aria-label singular/plural format (W1581)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("labels stars '1 star' (singular) and '2 stars'..'5 stars' (plural)", async () => {
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

    // Reach the rating widget through its W682-pinned wrapper testid so
    // this test stays anchored on the same surface rather than drifting
    // to a sibling rating widget if one ever appears.
    const ratingWidget = await screen.findByTestId("tile-rating-pool-10ball");

    // Five radio-role star buttons regardless of rating
    // (StarRating.tsx ~L156-196).
    const stars = within(ratingWidget).getAllByRole("radio");
    expect(stars).toHaveLength(5);

    // Pin the full 5-label sequence — StarRating.tsx ~L165:
    //   `${n} star${n === 1 ? "" : "s"}`
    // The n=1 case is the ONLY singular form; all others append "s".
    // Asserting all five at once catches both the ternary-flip regression
    // ("1 stars") AND any global format/ordering regressions.
    expect(stars[0]).toHaveAttribute("aria-label", "1 star");
    expect(stars[1]).toHaveAttribute("aria-label", "2 stars");
    expect(stars[2]).toHaveAttribute("aria-label", "3 stars");
    expect(stars[3]).toHaveAttribute("aria-label", "4 stars");
    expect(stars[4]).toHaveAttribute("aria-label", "5 stars");
  });
});

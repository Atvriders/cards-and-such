import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1604 — the lobby tile-rating widget's INNER StarRating radiogroup <div>
 * carries its OWN `aria-label="Your rating"` — distinct from the OUTER
 * wrapper-span's "Your rating: N of 5 stars" pinned by W682.
 *
 * The inner label is wired by LobbyPage.tsx ~L3049 passing
 * `ariaLabel="Your rating"` as a prop to <StarRating>, which stamps it
 * onto the radiogroup-role <div> at StarRating.tsx ~L149.
 *
 * Sibling tests pin adjacent attributes of the SAME tile-rating surface:
 *   - W682  (LobbyPage.test.tsx ~L2550): outer wrapper-span aria-label
 *           "Your rating: N of 5 stars".
 *   - W873  (LobbyPage.test.tsx ~L3873): family branch's outer wrapper
 *           "Best variant rating" aria-label.
 *   - W951  (LobbyTileRatingStars.test.tsx): per-star is-filled count.
 *   - W1262 (LobbyTileRatingChecked.test.tsx): per-star aria-checked.
 *   - W1370 (LobbyTileRatingTag.test.tsx): outer wrapper-span tag+class.
 *   - W1530 (LobbyTileRatingStarType.test.tsx): per-star type="button".
 *   - W1543 (LobbyTileRatingStarTabIndex.test.tsx): per-star tabIndex=-1.
 *   - W1556 (LobbyTileRatingStarGlyphAria.test.tsx): per-star svg aria-hidden.
 *   - W1569 (LobbyTileRatingStarGlyphFocusable.test.tsx): per-star svg focusable.
 *   - W1581 (LobbyTileRatingStarLabel.test.tsx): per-star aria-label "N stars".
 *   - W1597 (LobbyTileRatingDataValue.test.tsx): inner radiogroup data-value.
 *
 * None of those pin the radiogroup root's OWN `aria-label`. It matters
 * because:
 *
 *   1. Many AT users navigate by role (e.g. NVDA's "next radio group"
 *      command). Those users hear ONLY the radiogroup's own aria-label —
 *      not the outer wrapper-span's. A regression that dropped the
 *      `ariaLabel` prop on the LobbyPage <StarRating> call (or that
 *      changed it to a different string) would silently produce an
 *      unlabeled radiogroup that AT users could not identify.
 *
 *   2. The LobbyPage call site uses the SHORT form "Your rating" for the
 *      radiogroup label and the LONG form "Your rating: N of 5 stars"
 *      for the outer wrapper. Pinning both halves prevents a refactor
 *      that collapses the two values from accidentally homogenising the
 *      AT experience (the long form is verbose for radiogroup navigation;
 *      the short form is uninformative for the wrapper alone).
 *
 * `pool-10ball` reuses the same fixture id as the W682/W951/W1262/W1370/
 * W1530/W1543/W1556/W1569/W1581/W1597 sibling tests: not a FEATURED
 * game, so its tile renders exactly once under the canonical
 * `tile-<id>` testid, keeping the inner-rating query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other Lobby tile-rating siblings: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating inner radiogroup carries aria-label='Your rating' (W1604)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stamps aria-label='Your rating' on the inner StarRating radiogroup div", async () => {
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

    // The radiogroup MUST carry its own aria-label = "Your rating" — the
    // SHORT form passed via the `ariaLabel` prop at LobbyPage.tsx ~L3049.
    // A regression that dropped the prop, renamed it, or homogenised the
    // value with the outer wrapper's long-form label would surface here.
    expect(radiogroup).toHaveAttribute("aria-label", "Your rating");

    // Cross-surface guard: the radiogroup's aria-label MUST NOT collapse
    // into the wrapper's verbose "Your rating: N of 5 stars" form. Without
    // this, a refactor that homogenised the two attributes would still
    // satisfy a substring match for "Your rating" but flood AT users with
    // the long form on every radiogroup landing.
    expect(radiogroup.getAttribute("aria-label") ?? "").not.toMatch(
      /of 5 stars/,
    );
  });
});

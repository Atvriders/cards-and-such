import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W951 — the lobby tile-rating widget renders exactly N filled stars for
 * a stored rating of N, and all 5 stars are non-interactive (read-only).
 *
 * Sibling tests cover adjacent surfaces:
 *   - W682 (LobbyPage.test.tsx ~L2550): pins the tile-rating-<id>
 *     wrapper-span aria-label "Your rating: N of 5 stars" + cardinality.
 *   - W873 (LobbyPage.test.tsx ~L3873): pins the family-tile branch's
 *     "Best variant rating" aria-label.
 *
 * Neither sibling drills into the StarRating widget itself — they stop at
 * the wrapper span's aria-label. This test pins the actual visual
 * contract of the StarRating render (StarRating.tsx ~L156-196):
 *
 *   1. The number of stars carrying the `is-filled` class equals the
 *      seeded rating (4 of 5 filled for value=4). A regression that
 *      stopped propagating `userRating` into the read-only StarRating's
 *      `value` prop (LobbyPage.tsx ~L3049: `<StarRating value={userRating}
 *      readOnly size="sm" .../>`) would either light up zero stars or all
 *      five — both caught by pinning the count at exactly 4.
 *
 *   2. Every star <button> is `disabled` because the lobby tile passes
 *      `readOnly`, which forces `interactive=false` (StarRating.tsx
 *      ~L37, ~L167: `disabled={!interactive}`). A refactor that dropped
 *      the `readOnly` flag on the lobby tile and let the prop default to
 *      false (making the widget click-rateable inside a tile that already
 *      navigates on click) would surface here as enabled buttons.
 *
 * Standalone (non-family) game `pool-10ball` is reused from W682's
 * fixture set: it's not a FEATURED id, so its tile renders exactly once
 * under the canonical `tile-<id>` testid (no featured-strip duplicate),
 * keeping the inner-rating query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W874 / W908 / W932: shares the `src/pages/Lobby` vitest
 * path filter without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-rating filled-star count + read-only stars (W951)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders 4 filled stars and 5 disabled buttons for a stored 4-rating", async () => {
    // Seed the canonical rating blob BEFORE mount so the page's useState
    // initializer hydrates the value synchronously via readRatings()
    // (LobbyPage.tsx ~L732).
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "pool-10ball": 4 }),
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

    // The StarRating renders 5 <button role="radio"> children regardless
    // of the rating; each gets `is-filled` only when `n <= display`
    // (StarRating.tsx ~L157, ~L166). With value=4 and no hover (read-only
    // forbids hover state — StarRating.tsx ~L37, ~L78), exactly stars
    // 1..4 carry `is-filled` and star 5 does not.
    const stars = within(ratingWidget).getAllByRole("radio");
    expect(stars).toHaveLength(5);

    const filled = stars.filter((s) => s.classList.contains("is-filled"));
    expect(filled).toHaveLength(4);

    // Sanity-check the unfilled remainder so a regression that flipped
    // the comparison (`n >= display` instead of `n <= display`) — which
    // would still produce 4 "filled" stars but inverted — surfaces here.
    const unfilled = stars.filter((s) => !s.classList.contains("is-filled"));
    expect(unfilled).toHaveLength(1);
    expect(unfilled[0]).toHaveAttribute("aria-label", "5 stars");

    // Every star button MUST be disabled because the lobby tile's
    // StarRating is `readOnly` (LobbyPage.tsx ~L3049). This pins the
    // read-only render branch — a regression that dropped the prop
    // would surface here as enabled buttons that intercept tile clicks.
    for (const star of stars) {
      expect(star).toBeDisabled();
    }
  });
});

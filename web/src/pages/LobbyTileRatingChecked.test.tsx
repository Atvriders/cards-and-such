import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1262 — the lobby tile-rating widget exposes the standard radiogroup
 * `aria-checked` contract on its child star buttons: exactly one star
 * (the one matching the stored rating) carries `aria-checked="true"`,
 * and the other four carry `aria-checked="false"`.
 *
 * Sibling tests cover adjacent rating-widget surfaces:
 *   - W682 (LobbyPage.test.tsx ~L2550): wrapper-span `aria-label`
 *     "Your rating: N of 5 stars" + cardinality.
 *   - W873 (LobbyPage.test.tsx ~L3873): family branch's "Best variant
 *     rating" wrapper aria-label.
 *   - W951 (LobbyTileRatingStars.test.tsx): filled-star count via the
 *     `is-filled` class + every button is `disabled` (read-only).
 *   - W965 (LobbyTileRatingNone.test.tsx): wrapper is fully gated when
 *     `cards-ratings` is empty.
 *
 * None of those drill into the per-star `aria-checked` attribute — the
 * AT-facing "currently selected radio" signal that distinguishes the
 * picked star from the rest of the radiogroup. The attribute is wired
 * in StarRating.tsx ~L164 (`aria-checked={selected}`, where
 * `selected = n === value`), and it must hold even in read-only mode
 * because screen readers rely on it to announce the active rating
 * regardless of whether the buttons are disabled.
 *
 * `pool-10ball` reuses the same fixture id as W682/W951: it's not a
 * FEATURED game, so its tile renders exactly once under the canonical
 * `tile-<id>` testid, keeping the inner-rating query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W951 / W965: shares the `src/pages/Lobby` vitest path
 * filter without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-rating selected star carries aria-checked='true' (W1262)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("marks the 3rd star aria-checked='true' when the stored rating is 3", async () => {
    // Seed the canonical rating blob BEFORE mount so the page's
    // useState initializer hydrates the value synchronously via
    // readRatings() (LobbyPage.tsx ~L732).
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

    // Exactly the star whose ordinal equals `value` is `aria-checked`
    // — StarRating.tsx ~L158, ~L164. With value=3 that pins star[2].
    const checked = stars.filter(
      (s) => s.getAttribute("aria-checked") === "true",
    );
    expect(checked).toHaveLength(1);
    expect(checked[0]).toHaveAttribute("aria-label", "3 stars");

    // Sanity-pin the remainder so a regression that flipped
    // `selected = n <= value` (which would still aria-check ONE star —
    // star[0] — with value=3 but mark stars 1-3 as checked instead of
    // just 3) surfaces here.
    expect(stars[0]).toHaveAttribute("aria-checked", "false");
    expect(stars[1]).toHaveAttribute("aria-checked", "false");
    expect(stars[2]).toHaveAttribute("aria-checked", "true");
    expect(stars[3]).toHaveAttribute("aria-checked", "false");
    expect(stars[4]).toHaveAttribute("aria-checked", "false");
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1679 — every star button inside the lobby tile-rating widget exposes a
 * literal `role="radio"` HTML attribute.
 *
 * Sibling tests already pin neighbouring properties of the SAME star
 * buttons:
 *   - W1262 (LobbyTileRatingChecked.test.tsx): per-star `aria-checked`.
 *   - W1530 (LobbyTileRatingStarType.test.tsx): explicit `type="button"`.
 *   - W1543 (LobbyTileRatingStarTabIndex.test.tsx): tabIndex === -1.
 *   - W1660 (LobbyTileRatingStarBaseClass): the `star-rating-star` base.
 *
 * What's missing: NONE of them assert the literal `role` ATTRIBUTE on the
 * star buttons. Most reach the buttons via `getAllByRole("radio")`, which
 * happily resolves an implicit-role match (e.g. an `<input type="radio">`
 * exposes role=radio without ever carrying a `role` attribute). That gap
 * means a refactor that drops the explicit `role="radio"` attribute on the
 * `<button>` elements (StarRating.tsx ~L163) would still let
 * `getAllByRole("radio")` find the buttons in tests that pre-seed a
 * native radio fallback — and the regression would only surface in
 * production on browsers/AT pairs that don't synthesize the role from the
 * radiogroup parent alone.
 *
 * Pinning `getAttribute("role") === "radio"` on every star button locks
 * the explicit-attribute contract at the cheapest mount surface (the
 * read-only lobby render path).
 *
 * Reuses the `pool-10ball` fixture id (same as W1530/W1262/W1370) — not a
 * FEATURED game, so the tile renders exactly once under the canonical
 * `tile-<id>` testid and keeps the inner-rating query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) so it shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile-rating star buttons carry role='radio' attribute (W1679)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders all 5 star buttons with an explicit role='radio' attribute", async () => {
    // Seed the canonical rating blob BEFORE mount so the page's useState
    // initializer hydrates the value synchronously via readRatings()
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

    // Five star buttons regardless of stored rating (StarRating.tsx
    // ~L156-196). We collect them by their *implicit* role so the
    // explicit-role assertion below remains the load-bearing check.
    const stars = within(ratingWidget).getAllByRole("radio");
    expect(stars).toHaveLength(5);

    // Every star MUST carry the LITERAL `role="radio"` attribute on the
    // <button> element — StarRating.tsx ~L163. `getAllByRole("radio")`
    // would resolve an implicit-role native radio fallback as well, so
    // we drill past the role-resolver into the raw attribute to lock
    // the explicit contract that ARIA-aware AT pairs depend on.
    for (const star of stars) {
      expect(star.getAttribute("role")).toBe("radio");
    }
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1530 — every star <button> inside the lobby tile-rating widget carries
 * an explicit `type="button"` attribute.
 *
 * Sibling tests pin adjacent attributes of the SAME star buttons:
 *   - W951  (LobbyTileRatingStars.test.tsx): the `is-filled` class count
 *           and `disabled` (read-only) state.
 *   - W1262 (LobbyTileRatingChecked.test.tsx): the per-star
 *           `aria-checked` radiogroup contract.
 *   - W1370 (LobbyTileRatingTag.test.tsx): the OUTER wrapper-span tag.
 *   - W682  (LobbyPage.test.tsx ~L2550): the wrapper-span aria-label.
 *
 * None of those drill into the star button's HTML `type` attribute. By
 * default a `<button>` inside a `<form>` defaults to `type="submit"`,
 * which would pick up form submission semantics. While the lobby tile is
 * NOT inside a form today, the rating widget is reused (StarRating.tsx)
 * in PlayPage where it CAN sit alongside other form-shaped surfaces, and
 * the explicit `type="button"` at StarRating.tsx ~L162 is the canonical
 * defense against that footgun. A regression that dropped the attribute
 * (e.g. a refactor to a custom Button wrapper that forgot to pass it
 * through) would silently change the buttons' default behavior across
 * every consumer of StarRating, and would only surface as a bug once the
 * widget got dropped into a form.
 *
 * Pinning `type="button"` on the read-only lobby render path catches
 * that regression at the cheapest possible mount surface (the lobby
 * grid, no form context required).
 *
 * `pool-10ball` reuses the same fixture id as W682/W951/W1262/W1370:
 * not a FEATURED game, so its tile renders exactly once under the
 * canonical `tile-<id>` testid, keeping the inner-rating query
 * unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W951 / W1262 / W1370: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — tile-rating star buttons carry type='button' (W1530)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders all 5 star buttons with an explicit type='button' attribute", async () => {
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

    // Every star MUST be a real <button> with explicit `type="button"`
    // — StarRating.tsx ~L160, ~L162. The check has two parts:
    //   (1) tagName === "BUTTON" — guards against a refactor that
    //       swapped <button role="radio"> for <div role="radio">,
    //       which would still pass the role-based selector but lose
    //       the implicit Enter/Space activation semantics that AT
    //       relies on for radiogroup buttons.
    //   (2) type === "button" — guards the explicit submit-suppression
    //       attribute that's load-bearing whenever StarRating is
    //       rendered inside a form (e.g. in PlayPage's settings panel).
    for (const star of stars) {
      expect(star.tagName).toBe("BUTTON");
      expect(star).toHaveAttribute("type", "button");
    }
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1370 — the lobby tile-rating widget's wrapper element is a <span>
 * carrying the `tile-rating` class.
 *
 * Sibling tests pin adjacent attributes of the SAME wrapper:
 *   - W682  (LobbyPage.test.tsx): the wrapper's aria-label copy.
 *   - W951  (LobbyTileRatingStars.test.tsx): the inner StarRating render.
 *   - W965  (LobbyTileRatingNone.test.tsx): the gate-off case.
 *   - W1262 (LobbyTileRatingChecked.test.tsx): the inner radiogroup
 *           aria-checked semantics.
 *
 * None of those siblings pin the wrapper's HTML tagName or its className.
 * That matters for two reasons:
 *
 *   1. The wrapper sits inside an `<a>` tile (LobbyPage.test.tsx ~L2075
 *      pins `tile.tagName === "A"`). HTML5 forbids interactive descendants
 *      inside an anchor. A regression that swapped this `<span>` for a
 *      `<button>` or `<a>` — perhaps to make the rating itself clickable —
 *      would silently produce invalid nested-interactive markup that
 *      breaks AT navigation. Pinning tagName === "SPAN" catches that.
 *
 *   2. The `tile-rating` class is the CSS hook for the badge's pill
 *      styling (LobbyPage.css). A rename to e.g. `tile-rating-badge`
 *      would leave the test suite green (every existing assertion goes
 *      through the testid) but ship un-styled markup to production.
 *
 * Standalone (non-family) game `pool-10ball` is reused from the W951 /
 * W1262 fixture set so the inner-rating query stays unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W951 / W1262: shares the `src/pages/Lobby` vitest path
 * filter without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-rating wrapper is a <span class=\"tile-rating\"> (W1370)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the rating widget as a SPAN element with the tile-rating class", async () => {
    // Seed a stored rating BEFORE mount so the page's useState initializer
    // hydrates synchronously via readRatings() (LobbyPage.tsx ~L732).
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "pool-10ball": 3 }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Reach the wrapper via the W682-pinned testid so this test stays
    // anchored on the canonical surface rather than drifting to a sibling
    // widget if one ever appears.
    const ratingWidget = await screen.findByTestId("tile-rating-pool-10ball");

    // (1) Tag contract: must remain a non-interactive <span> so the tile's
    // outer <a> stays valid HTML5 (no interactive descendants). A swap to
    // BUTTON/A/DIV would surface here.
    expect(ratingWidget.tagName).toBe("SPAN");

    // (2) Class contract: must carry the `tile-rating` hook so LobbyPage.css
    // can style the badge. Renaming the class would silently un-style
    // production markup; this assertion catches that.
    expect(ratingWidget).toHaveClass("tile-rating");
  });
});

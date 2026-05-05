import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1946 — pin the total number of `<section>` elements rendered by
 * LobbyPage in its default first-paint state.
 *
 * Why this needs its own pin:
 *  - Individual section landmarks are covered piecemeal: the Featured
 *    strip's class/aria are pinned (W735, LobbyFeaturedHeadingText) and
 *    the catalog's aria-label is pinned (W1200), but no test asserts
 *    the *total count* of `<section>` elements rendered together.
 *  - In default state (no query, no persisted stats / favorites /
 *    ratings) the lobby renders exactly two sections:
 *      1. `.lobby-featured` (Featured strip — `featured.length > 0`
 *         because FEATURED_IDS is hand-curated and non-empty).
 *      2. `aria-label="All games"` (the main catalog — always rendered).
 *    The `.lobby-recommended` section is gated on `totalPlays >= 3`,
 *    which a fresh-localStorage render does NOT satisfy.
 *  - A regression that adds an extra wrapper `<section>` or drops one
 *    of the two would silently shift landmark structure for screen
 *    readers without flipping any existing test red.
 */
describe("LobbyPage — default-state section count (W1946)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders exactly two <section> landmarks on first paint", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const sections = container.querySelectorAll("section");
    expect(sections.length).toBe(2);
  });
});

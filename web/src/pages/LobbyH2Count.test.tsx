import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2143 — pin a structural FLOOR on the LobbyPage's `<h2>` tag count
 * for a fresh, unfiltered mount with empty localStorage.
 *
 * The lobby uses `<h2>` as its top-level section heading element for
 * the major page regions:
 *   - "Featured" strip (LobbyPage.tsx ~L2006), gated on
 *     `!query && filter === "all" && featured.length > 0`. Since
 *     FEATURED_IDS (~L635) is a hand-curated 6-id list and the
 *     registry resolves all six on a fresh mount, this h2 is always
 *     present on the default unfiltered view.
 *   - "Recommended for you" strip (~L2042), gated on
 *     `recommendations.length > 0`. The recommender requires
 *     `totalPlays >= 3` (~L1046), so a fresh mount with empty
 *     localStorage emits ZERO recommendations — this h2 is NOT
 *     rendered on default mount.
 *   - "All games" section header (~L2083), unconditional.
 *   - The family-picker dialog title (~L3603), only rendered when
 *     `openFamilyId` matches a family — NOT on fresh mount.
 *
 * Existing sibling tests pin many lobby surfaces (button counts,
 * chip-strip child counts, drawer link counts, every individual chip
 * glyph / aria, …), and the LobbyAllGames* family pins the all-games
 * section's aria-label and absence of an id, but NOT a single
 * existing test inspects the AGGREGATE `<h2>` cardinality of the
 * page. A regression that demoted the section headings to `<div>`s
 * (or to `<h3>`s, or rolled them into a `<header>`) would silently
 * slip past every per-feature pin while harming page-level a11y
 * landmarks and SEO outline.
 *
 * Resolution uses a deliberately CONSERVATIVE FLOOR (>=2) rather than
 * an exact count because:
 *   - Any future "Trending", "New this month" or other promotional
 *     section would legitimately add another `<h2>` and break an
 *     exact-count pin.
 *   - The Featured strip's gate (`featured.length > 0`) depends on
 *     FEATURED_IDS resolving in the live registry; should a featured
 *     id be retired without a replacement the strip would still
 *     resolve (5 of 6) and emit its h2, so the floor is robust.
 *   - The all-games h2 is unconditional; the floor of 2 cleanly
 *     covers `featured + all-games` on a default mount.
 *
 * Selector is the literal `<h2>` tag — independent of class names
 * (`lobby-picker-title` is the only h2 with a className, on the
 * dialog), data-testids, or aria attributes — which keeps this pin
 * orthogonal to every existing testid- or aria-based lobby test.
 */
describe("LobbyPage — overall <h2> count floor (W2143)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders at least 2 <h2> elements on a fresh unfiltered mount", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Tag-only selector — independent of any data-testid or className.
    // We're asserting the literal `<h2>` emission rate, NOT any
    // particular id stamping or styling class.
    const headings = document.querySelectorAll("h2");

    // Floor, not exact: future promotional sections (e.g. "Trending",
    // "New this month") may legitimately add additional h2 elements.
    // A floor of 2 cleanly covers the unconditional "All games"
    // heading plus the "Featured" strip heading (gated on
    // FEATURED_IDS resolving, which it does on master). Any refactor
    // that demoted the section headings to `<div>` / `<h3>` / similar
    // would push the count below 2 and trip the assertion; legitimate
    // section additions only push it higher.
    expect(headings.length).toBeGreaterThanOrEqual(2);
  });
});

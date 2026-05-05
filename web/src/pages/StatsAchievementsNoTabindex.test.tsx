import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2256: StatsPage's `data-testid="stats-achievements"` card — the
 * `.stats-card` wrapper holding the Achievements heading, the search
 * input, the show-locked toggle, and the achievements grid — carries
 * NO `tabindex` attribute. Sibling pins already cover several
 * attribute-shape contracts on this same card:
 *   - StatsAchievementsCardClass.test.tsx pins the exact className.
 *   - StatsAchievementsCardNoId.test.tsx pins absence of `id`.
 *   - StatsAchievementsCardNoStyle.test.tsx pins absence of inline `style`.
 *   - StatsAchievementsContainerTag.test.tsx pins the container tag.
 *   - StatsAchievementsTitleClass.test.tsx pins the heading shape.
 *
 * What none of those cover is the ABSENCE of a `tabindex` attribute on
 * the achievements card itself. The card is a presentational grouping
 * wrapper — its actionable descendants (the search input, the locked
 * toggle, the achievement tiles) already manage their own focus.
 * Adding any `tabindex` to the card would silently:
 *   1. With `tabIndex={0}`, insert the entire card wrapper into the
 *      keyboard tab order ahead of its actionable children, forcing
 *      keyboard users through an unannounced stop on a non-actionable
 *      group element.
 *   2. With `tabIndex={-1}`, make the card programmatically focusable
 *      (`element.focus()` would succeed) and create a new undeclared
 *      focus surface that other code (skip-link targets, scroll-into-
 *      view handlers, search-completion focus restoration) could come
 *      to depend on.
 * Either change would alter the page's focus contract and should be
 * reviewed deliberately, not slip in via an unrelated refactor.
 *
 * Pin the ABSENCE of any `tabindex` attribute on the achievements card,
 * using `hasAttribute` so even an explicit `tabindex="-1"` is caught.
 */
describe("StatsPage stats-achievements — card tabindex attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2256: stats-achievements card has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-achievements");
    expect(card).not.toBeNull();

    // Sanity: confirm we pinned the achievements card itself and not,
    // say, a descendant that might legitimately carry a tabindex of its
    // own (e.g. the search input or an interactive achievement tile).
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: no `tabindex` attribute on the achievements
    // card. `hasAttribute` rather than a specific value check — even
    // `tabindex="-1"` would make the card programmatically focusable
    // and create a new undeclared focus surface.
    expect(card.hasAttribute("tabindex")).toBe(false);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2355: StatsPage's `data-testid="stats-achievements"` card — the
 * `.stats-card` wrapper holding the Achievements heading, the search
 * input, the show-locked toggle, and the achievements grid — carries
 * NO explicit `role` attribute. Sibling pins already cover several
 * attribute-shape contracts on this same card:
 *   - StatsAchievementsCardClass.test.tsx pins the exact className.
 *   - StatsAchievementsCardNoId.test.tsx pins absence of `id`.
 *   - StatsAchievementsCardNoStyle.test.tsx pins absence of inline `style`.
 *   - StatsAchievementsNoTabindex.test.tsx pins absence of `tabindex`.
 *   - StatsAchievementsContainerTag.test.tsx pins the container tag.
 *   - StatsAchievementsTitleClass.test.tsx pins the heading shape.
 *
 * What none of those cover is the ABSENCE of an explicit `role`
 * attribute on the achievements card itself. The card is a plain
 * presentational `<div>` grouping wrapper; its implicit role is
 * `generic` (i.e. nothing announced as a landmark or widget). Adding
 * any explicit `role` would silently change the AT semantics of this
 * region:
 *   1. `role="region"` (or `role="group"`) without a matching
 *      `aria-label` / `aria-labelledby` would create an unnamed
 *      landmark that screen readers skip past with no context.
 *   2. `role="list"` would mis-announce the wrapper, since the
 *      achievements grid below is the actual list-like container —
 *      and a wrapper-level `role="list"` would conflict with the
 *      grid's own implicit semantics.
 *   3. `role="button"` / `role="link"` (accidentally copied from a
 *      clickable card variant elsewhere) would imply interactivity
 *      that this wrapper does not provide.
 * Either of those would be a meaningful a11y change and should be
 * reviewed deliberately, not slip in via an unrelated refactor.
 *
 * Pin the ABSENCE of any `role` attribute on the achievements card,
 * using `hasAttribute` so even an empty `role=""` is caught.
 */
describe("StatsPage stats-achievements — card role attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2355: stats-achievements card has no role attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-achievements");
    expect(card).not.toBeNull();

    // Sanity: confirm we pinned the achievements card itself and not
    // a descendant that might legitimately carry a role of its own
    // (e.g. the inner progressbar element on each achievement tile).
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: no explicit `role` attribute on the
    // achievements card. `hasAttribute` rather than a specific-value
    // check — even an empty `role=""` would alter how some assistive
    // technologies treat the wrapper.
    expect(card.hasAttribute("role")).toBe(false);
  });
});

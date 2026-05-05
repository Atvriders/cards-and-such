import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2526: StatsPage's `data-testid="stats-achievements"` card — the
 * `.stats-card` wrapper holding the Achievements heading, the search
 * input, the show-locked toggle, and the achievements grid — carries
 * NO explicit `aria-label` attribute. Sibling pins already cover several
 * attribute-shape contracts on this same card:
 *   - StatsAchievementsCardClass.test.tsx pins the exact className.
 *   - StatsAchievementsCardNoId.test.tsx pins absence of `id`.
 *   - StatsAchievementsCardNoStyle.test.tsx pins absence of inline `style`.
 *   - StatsAchievementsNoTabindex.test.tsx pins absence of `tabindex`.
 *   - StatsAchievementsCardNoRole.test.tsx (W2355) pins absence of `role`.
 *   - StatsAchievementsCardChildCount.test.tsx (W2493) pins childElementCount.
 *   - StatsAchievementsCardLastChild.test.tsx (W2504) pins lastElementChild.
 *   - StatsAchievementsContainerTag.test.tsx pins the container tag.
 *   - StatsAchievementsTitleClass.test.tsx pins the heading shape.
 *
 * What none of those cover is the ABSENCE of an explicit `aria-label`
 * attribute on the achievements card itself. The card is a plain
 * presentational `<div>` whose accessible name (when relevant) comes
 * from the inner `<h2>Achievements</h2>` heading, NOT from any
 * wrapper-level aria-label. Adding `aria-label="Achievements"` (or
 * similar) would:
 *   1. Either be redundant with the inner h2 (causing screen readers
 *      to either announce the name twice or — worse — suppress the
 *      heading announcement), or
 *   2. Diverge from the visible heading text, creating a confusing
 *      mismatch between visible and assistive-tech presentations.
 * Combined with the existing `role` absence pin, this guarantees the
 * card stays an unnamed plain wrapper and is not promoted to a named
 * landmark via a stray aria-label refactor.
 *
 * Pin the ABSENCE of any `aria-label` attribute on the achievements
 * card, using `hasAttribute` so even an empty `aria-label=""` is
 * caught (an empty string is itself a meaningful a11y signal — it
 * suppresses the accessible name).
 */
describe("StatsPage stats-achievements — card aria-label attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2526: stats-achievements card has no aria-label attribute", () => {
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
    // a descendant that might legitimately carry an aria-label of its
    // own (e.g. the inner search input has aria-label="Search
    // achievements", which we explicitly do NOT want to assert here).
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: no explicit `aria-label` attribute on the
    // achievements card wrapper. `hasAttribute` rather than a
    // specific-value check — even an empty `aria-label=""` would
    // alter how some assistive technologies treat the wrapper.
    expect(card.hasAttribute("aria-label")).toBe(false);
  });
});

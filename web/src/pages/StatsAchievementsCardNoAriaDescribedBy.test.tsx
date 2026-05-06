import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2565: StatsPage's `data-testid="stats-achievements"` card — the
 * `.stats-card` wrapper holding the Achievements heading, the search
 * input, the show-locked toggle, and the achievements grid — carries
 * NO explicit `aria-describedby` attribute. Sibling pins already cover
 * several attribute-shape contracts on this same card:
 *   - StatsAchievementsCardClass.test.tsx pins the exact className.
 *   - StatsAchievementsCardNoId.test.tsx pins absence of `id`.
 *   - StatsAchievementsCardNoStyle.test.tsx pins absence of inline `style`.
 *   - StatsAchievementsNoTabindex.test.tsx pins absence of `tabindex`.
 *   - StatsAchievementsCardNoRole.test.tsx (W2355) pins absence of `role`.
 *   - StatsAchievementsCardNoAriaLabel.test.tsx (W2526) pins absence of
 *     `aria-label`.
 *   - StatsAchievementsCardNoAriaLabelledBy.test.tsx pins absence of
 *     `aria-labelledby`.
 *
 * What none of those cover is the ABSENCE of an explicit
 * `aria-describedby` attribute on the achievements card itself. The
 * card is a plain presentational `<div>` whose semantic content is
 * provided by the inner `<h2>Achievements</h2>` heading and the
 * descendant achievements grid — there is no separate descriptor
 * element wired into the wrapper. Adding `aria-describedby` would:
 *   1. Force creation/maintenance of a referenced descriptor element
 *      whose id must remain stable across refactors, OR
 *   2. Point at an existing element (e.g. the search input or status
 *      text) and conflate "description" with "control label", which
 *      would mislead assistive technologies into announcing unrelated
 *      content as the card's description.
 * Combined with the existing role/aria-label/aria-labelledby absence
 * pins, this guarantees the card stays an unnamed, undescribed plain
 * wrapper and is not promoted to a named/described landmark via a
 * stray aria-describedby refactor.
 *
 * Pin the ABSENCE of any `aria-describedby` attribute on the
 * achievements card using `hasAttribute` so even an empty
 * `aria-describedby=""` is caught (an empty string is itself a
 * meaningful a11y signal that can suppress description resolution).
 */
describe("StatsPage stats-achievements — card aria-describedby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2565: stats-achievements card has no aria-describedby attribute", () => {
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
    // a descendant that might legitimately carry an aria-describedby
    // of its own.
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: no explicit `aria-describedby` attribute on
    // the achievements card wrapper. `hasAttribute` rather than a
    // specific-value check — even an empty `aria-describedby=""`
    // would alter how some assistive technologies treat the wrapper.
    expect(card.hasAttribute("aria-describedby")).toBe(false);
  });
});

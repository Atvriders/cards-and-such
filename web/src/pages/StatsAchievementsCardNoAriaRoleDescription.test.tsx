import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2708: StatsPage's `data-testid="stats-achievements"` card — the
 * `.stats-card` wrapper holding the Achievements heading, the search
 * input, the show-locked toggle, and the achievements grid — carries
 * NO explicit `aria-roledescription` attribute. Sibling pins on this
 * same card already cover the rest of its attribute-shape contract:
 *   - StatsAchievementsCardClass.test.tsx pins the exact className.
 *   - StatsAchievementsCardNoId.test.tsx pins absence of `id`.
 *   - StatsAchievementsCardNoStyle.test.tsx pins absence of inline `style`.
 *   - StatsAchievementsNoTabindex.test.tsx pins absence of `tabindex`.
 *   - StatsAchievementsCardNoRole.test.tsx (W2355) pins absence of `role`.
 *   - StatsAchievementsCardNoAriaLabel.test.tsx (W2526) pins no aria-label.
 *   - StatsAchievementsCardNoAriaLabelledBy.test.tsx pins no aria-labelledby.
 *   - StatsAchievementsCardNoAriaDescribedBy.test.tsx pins no aria-describedby.
 *   - StatsAchievementsCardChildCount.test.tsx (W2493) pins childElementCount.
 *   - StatsAchievementsCardLastChild.test.tsx (W2504) pins lastElementChild.
 *
 * What none of those cover is the ABSENCE of an explicit
 * `aria-roledescription` attribute on the achievements card itself.
 * `aria-roledescription` lets authors override the default role
 * announcement that assistive tech provides for an element (e.g. a
 * generic `div` could be announced as "card" or "panel"). Because
 * the achievements card is a plain presentational `<div>` with no
 * explicit `role` (W2355), promoting it via `aria-roledescription`
 * would:
 *   1. Be ignored by most screen readers, since `aria-roledescription`
 *      requires a valid role to take effect — applying it to a roleless
 *      generic `<div>` produces inconsistent or dropped announcements.
 *   2. If combined with a stray future role refactor, would silently
 *      start announcing a custom role-description (e.g. "card",
 *      "achievements panel") on top of the inner `<h2>Achievements</h2>`
 *      heading — creating duplicate or conflicting name+role audio.
 * Pinning ABSENCE here guarantees the card stays a plain unannounced
 * wrapper and is not retroactively promoted to a custom-described
 * landmark by a future styling/labelling pass.
 *
 * Use `hasAttribute` rather than a specific-value check — even an
 * empty `aria-roledescription=""` is a meaningful a11y signal (it
 * explicitly clears any inherited description) and would also
 * violate this contract.
 */
describe("StatsPage stats-achievements — card aria-roledescription attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2708: stats-achievements card has no aria-roledescription attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-achievements");
    expect(card).not.toBeNull();

    // Sanity: confirm we pinned the achievements card wrapper itself
    // and not a descendant.
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: no explicit `aria-roledescription`
    // attribute on the achievements card wrapper.
    expect(card.hasAttribute("aria-roledescription")).toBe(false);
  });
});

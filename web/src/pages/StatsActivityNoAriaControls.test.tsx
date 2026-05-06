import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2600: StatsPage's "Activity" stats card (data-testid="stats-activity")
 * — the wrapper <div class="stats-card stats-card--exportable"> that frames
 * the line-chart panel and the top summary stats — must NOT carry an
 * `aria-controls` attribute. This card is a static content region: it does
 * not toggle, expand, collapse, or otherwise own a separately-rendered
 * controlled element. WAI-ARIA reserves `aria-controls` for elements whose
 * activation changes the state/visibility of another element (e.g. a
 * disclosure button pointing at its panel, a tab pointing at its tabpanel).
 * Slapping `aria-controls` on a non-interactive container would advertise a
 * dynamic relationship that does not exist, and most screen readers would
 * announce the bogus controls hint when the card receives focus or when the
 * user navigates the AT tree, polluting the activity summary's announcement
 * with a phantom "controls X" reference.
 *
 * Sibling absence contracts on this exact node already pin role
 * (W2-NoRole), id (W-NoId), aria-label / aria-labelledby (W2014),
 * aria-describedby (W-NoAriaDescribedBy), aria-hidden (W2585), inline style
 * (W-NoStyle), and tabindex (W-NoTabindex). The aria-controls absence is
 * the missing entry in this card's accessibility-attribute absence cluster
 * — sibling stats cards (stats-this-week, stats-most-hinted,
 * stats-personal-records, stats-categories) carry the same shape and the
 * same lack of an aria-controls relationship, so pinning it here protects
 * future refactors that might copy-paste an `aria-controls` from a real
 * disclosure pattern (e.g. the reset-confirm modal trigger pinned by
 * W-ResetConfirmAriaModal) onto this static wrapper.
 *
 * `hasAttribute` (not `getAttribute() === "..."`) is used so a stray
 * `aria-controls=""`, `aria-controls="something"`, or any other value also
 * trips the assertion — the contract is total absence of the attribute.
 */
describe("StatsPage stats-activity card — aria-controls attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2600: stats-activity card has no aria-controls attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    // Sanity: confirm we resolved the activity card wrapper, not a sibling.
    expect(card.classList.contains("stats-card")).toBe(true);
    expect(card.classList.contains("stats-card--exportable")).toBe(true);
    // The actual contract: no aria-controls attribute at all.
    expect(card.hasAttribute("aria-controls")).toBe(false);
    expect(card.getAttribute("aria-controls")).toBeNull();
  });
});

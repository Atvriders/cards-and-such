import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2585: StatsPage's "Activity" stats card (data-testid="stats-activity")
 * — the wrapper <div class="stats-card stats-card--exportable"> that frames
 * the line-chart panel and the top summary stats — must NOT carry an
 * `aria-hidden` attribute. The card is load-bearing for assistive tech: it
 * scopes the "Activity" h2 heading, the per-stat summary cards, and the
 * inner SVG chart that carries its own accessible name. Marking the wrapper
 * aria-hidden would silently strip every nested heading, summary value, and
 * chart description from the AT tree, leaving screen-reader users unable
 * to hear the activity summary that this card exists to convey.
 *
 * Sibling absence contracts on this exact node already pin role (W2-NoRole),
 * id (W-NoId), aria-label / aria-labelledby (W2014), aria-describedby
 * (W-NoAriaDescribedBy), inline style (W-NoStyle), and tabindex
 * (W-NoTabindex). The aria-hidden absence is the missing link in this card's
 * accessibility-attribute absence cluster — sibling stats cards (e.g.
 * stats-this-week pinned by W2580, stats-most-hinted, stats-personal-records)
 * already pin the same aria-hidden absence on their own wrappers for the
 * same reason. Pin it here so any future refactor that wraps the card in
 * an aria-hidden subtree, or copy-pastes `aria-hidden="true"` from a
 * decorative sibling (e.g. the heatmap head row pinned by W1198), fails
 * loudly instead of silently muting the activity summary.
 *
 * `hasAttribute` (not `getAttribute() === "true"`) is used so a stray
 * `aria-hidden=""`, `aria-hidden="false"`, or any other value also trips
 * the assertion — the contract is total absence of the attribute.
 */
describe("StatsPage stats-activity card — aria-hidden attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2585: stats-activity card has no aria-hidden attribute", () => {
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
    // The actual contract: no aria-hidden attribute at all.
    expect(card.hasAttribute("aria-hidden")).toBe(false);
    expect(card.getAttribute("aria-hidden")).toBeNull();
  });
});

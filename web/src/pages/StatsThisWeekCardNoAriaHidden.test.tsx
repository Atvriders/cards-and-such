import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2580: StatsPage's "This week" stats card (data-testid="stats-this-week")
 * — the wrapper <div class="stats-card stats-card--week"> that frames the
 * current-vs-prior-7-day comparison list, the per-row deltas, and the
 * nested stats-prev-week breakdown — must NOT carry an `aria-hidden`
 * attribute. The card is load-bearing for assistive tech: it scopes a
 * heading (W2554/W2024 family pin h2 "This week"), an aria-labelled list
 * of plays/wins/avg-time deltas, and a sibling prev-week list. Marking
 * the wrapper aria-hidden would silently strip every nested heading and
 * list value from the AT tree, leaving screen-reader users unable to
 * hear the week-over-week summary that this card exists to convey.
 *
 * Sibling absence contracts on this exact node already pin role (W2024),
 * id (W2024 family), aria-label (W2118), aria-labelledby (W2118 family),
 * aria-describedby (W2118 family), inline style (W2140), and tabindex
 * (W2118 family). The aria-hidden absence is the missing link in this
 * card's accessibility-attribute absence cluster — every other top-level
 * stats card on the page leaves aria-hidden off its wrapper for the
 * same reason. Pin it here so any future refactor that wraps the
 * card in an aria-hidden subtree, or copy-pastes `aria-hidden="true"`
 * from a decorative sibling (e.g. the heatmap head row pinned by W1198),
 * fails loudly instead of silently muting the week summary.
 *
 * `hasAttribute` (not `getAttribute() === "true"`) is used so a stray
 * `aria-hidden=""`, `aria-hidden="false"`, or any other value also trips
 * the assertion — the contract is total absence of the attribute.
 */
describe("StatsPage stats-this-week card — aria-hidden attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2580: stats-this-week card has no aria-hidden attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    // Sanity: confirm we resolved the card wrapper, not an unrelated sibling.
    expect(card.classList.contains("stats-card")).toBe(true);
    expect(card.classList.contains("stats-card--week")).toBe(true);
    // The actual contract: no aria-hidden attribute at all.
    expect(card.hasAttribute("aria-hidden")).toBe(false);
    expect(card.getAttribute("aria-hidden")).toBeNull();
  });
});

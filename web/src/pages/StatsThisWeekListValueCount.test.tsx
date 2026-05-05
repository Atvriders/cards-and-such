import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1758: StatsPage's `stats-this-week-list` <ul> renders exactly three
 * `.stats-week-value` <em>s — one for each metric row (Plays, Wins, Avg
 * time). W1747 pins the parallel `.stats-week-label` cardinality at 3,
 * but the value-side count is a distinct invariant: per-row value tag
 * tests (W1697, W1701, W1705, W1721, W1722, W1725) walk to a specific
 * <li> and assert the value's tagName, and the row-count test (W1563)
 * pins the <li> count via `querySelectorAll("li")`. None address the
 * collective value cardinality across the list as a whole.
 *
 * A regression that dropped the Wins value entirely (e.g. replacing the
 * <em> with a different className while keeping the <li> and the label)
 * would still satisfy the row-count assertion and the label-count
 * assertion, and would only be caught by the per-row value test for
 * that specific metric. Conversely, a stray `stats-week-value` <em>
 * injected outside the metric rows would slip past every per-row test.
 * Pinning `querySelectorAll(".stats-week-value")` length on the list
 * itself catches both shapes.
 */
describe("StatsPage stats-this-week — list-level value em count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1758: stats-this-week-list contains exactly 3 .stats-week-value ems", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // Plays, Wins, Avg time — three value ems, no more, no fewer.
    const values = list.querySelectorAll(".stats-week-value");
    expect(values).toHaveLength(3);
  });
});

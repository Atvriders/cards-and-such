import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1747: StatsPage's `stats-this-week-list` <ul> renders exactly three
 * `.stats-week-label` spans — one for each metric row (Plays, Wins, Avg
 * time). Existing this-week tests pin per-row label classes/tags (W1298,
 * W1329, W1518, W1694, W1700, W1704) by walking to a specific <li> and
 * asserting the label inside it, and the row-count test (W1563) pins the
 * <li> count via `querySelectorAll("li")`. None of those address the
 * collective label cardinality across the list as a whole.
 *
 * The list-level label count is a distinct invariant: a regression that
 * dropped the Wins label entirely (e.g. replacing the <span> with a
 * different className while keeping the <li>) would still satisfy the
 * row-count assertion (3 rows) and would only be caught by the per-row
 * label test for that specific metric. Conversely, a stray
 * `stats-week-label` span injected outside the metric rows would slip
 * past every per-row test. Pinning `querySelectorAll(".stats-week-label")`
 * length on the list itself catches both shapes.
 */
describe("StatsPage stats-this-week — list-level label span count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1747: stats-this-week-list contains exactly 3 .stats-week-label spans", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // Plays, Wins, Avg time — three label spans, no more, no fewer.
    const labels = list.querySelectorAll(".stats-week-label");
    expect(labels).toHaveLength(3);
  });
});

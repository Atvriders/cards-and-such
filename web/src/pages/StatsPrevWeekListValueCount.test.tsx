import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1760: StatsPage's `stats-prev-week` <ul> renders exactly three
 * `.stats-week-value` <em>s — one for each metric row (Prior plays, Prior
 * wins, Prior avg time). Existing prev-week tests pin per-row value
 * classes/tags (W1726, W1738, and the second-row variants) by walking to
 * a specific <li> and asserting the value inside it, and the row-count
 * test (W1627) pins the <li> count via `querySelectorAll("li")`. None of
 * those address the collective value cardinality across the list as a
 * whole.
 *
 * The list-level value count is a distinct invariant: a regression that
 * dropped the Prior-wins value entirely (e.g. replacing the <em> with a
 * different className while keeping the <li>) would still satisfy the
 * row-count assertion (3 rows) and would only be caught by the per-row
 * value test for that specific metric. Conversely, a stray
 * `stats-week-value` em injected outside the metric rows would slip past
 * every per-row test. Pinning `querySelectorAll(".stats-week-value")`
 * length on the list itself catches both shapes. This mirrors W1747's
 * label-count guard for the this-week list.
 */
describe("StatsPage stats-prev-week — list-level value em count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1760: stats-prev-week contains exactly 3 .stats-week-value ems", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-prev-week");
    // Prior plays, Prior wins, Prior avg time — three value ems, no more,
    // no fewer.
    const values = list.querySelectorAll(".stats-week-value");
    expect(values).toHaveLength(3);
  });
});

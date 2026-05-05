import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1759: StatsPage's `stats-prev-week` <ul> renders exactly three
 * `.stats-week-label` spans — one for each prior metric row (Prior plays,
 * Prior wins, Prior avg time). Existing prev-week tests pin per-row label
 * classes/tags (W1518-style first/second/third row label tag + label text
 * tests) by walking to a specific <li> and asserting the label inside it,
 * and the row-count test pins the <li> count via `querySelectorAll("li")`.
 * None of those address the collective label cardinality across the list
 * as a whole.
 *
 * The list-level label count is a distinct invariant: a regression that
 * dropped the Prior wins label entirely (e.g. replacing the <span> with a
 * different className while keeping the <li>) would still satisfy the
 * row-count assertion (3 rows) and would only be caught by the per-row
 * label test for that specific metric. Conversely, a stray
 * `stats-week-label` span injected outside the prior metric rows would slip
 * past every per-row test. Pinning `querySelectorAll(".stats-week-label")`
 * length on the prev-week list itself catches both shapes — and is the
 * prev-week mirror of the W1747 lock on the this-week list.
 */
describe("StatsPage stats-prev-week — list-level label span count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1759: stats-prev-week list contains exactly 3 .stats-week-label spans", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    // Prior plays, Prior wins, Prior avg time — three label spans, no more, no fewer.
    const labels = prior.querySelectorAll(".stats-week-label");
    expect(labels).toHaveLength(3);
  });
});

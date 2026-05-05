import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1959: StatsPage's "Activity" card (data-testid="stats-activity") composes
 * exactly five direct children in order:
 *   1. The export button (.stats-export-btn) — opens the SVG download.
 *   2. The <h2> heading "Activity".
 *   3. The .stats-summary 6-cell totals strip (games, wins, hints, undos, time, sessions).
 *   4. The .stats-range-row range-toggle row (label + tablist of 7d/14d/30d/90d).
 *   5. The LineChart <svg> rendered for the selected range.
 *
 * Existing tests pin individual descendants (export button, h2 parent, range
 * toggle buttons, summary cells, line chart attributes) but none pin the
 * COUNT of direct children of the activity card itself. A refactor that
 * silently inserts a wrapper, splits a section into two siblings, or adds
 * a stray empty-state slot inside the card would slip past every other
 * assertion while reshaping the card's top-level layout. Pin the exact
 * direct childElementCount so that structural drift fails fast.
 */
describe("StatsPage stats-activity card — direct childElementCount", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1959: stats-activity card has exactly 5 direct children", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    expect(card.childElementCount).toBe(5);
  });
});

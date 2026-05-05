import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1902: StatsPage's `stats-card-grid` <section> contains a fixed set of
 * panel containers, each rendered as `<div className="stats-card …">`. The
 * `stats-card` className is the load-bearing CSS hook that pins each
 * panel's padding, border, background, and grid-cell sizing — independent
 * of any modifier class such as `stats-card--exportable` or
 * `stats-card--week`. With an empty fixture (no plays recorded, default
 * localStorage cleared) the page unconditionally renders 11 such panels:
 *
 *   1.  stats-activity            (exportable line chart)
 *   2.  stats-records             (exportable pie chart)
 *   3.  stats-categories          (exportable bar chart)
 *   4.  stats-hour-of-day
 *   5.  stats-cat-heatmap-card
 *   6.  stats-this-week           (week modifier)
 *   7.  stats-personal-records
 *   8.  stats-personal-records-by-category
 *   9.  stats-most-hinted
 *   10. stats-replays-panel
 *   11. stats-achievements
 *
 * Per-card class/title/testid tests cover individual panels in isolation,
 * but no existing test pins the *count* of `.stats-card` containers via
 * `querySelectorAll`. A regression that adds an extra panel without a
 * test, drops one (e.g. during a refactor that conditionalizes a section
 * on data presence), or renames the class to e.g. `stats-panel` would
 * silently shift the page layout while every per-panel test still passes.
 */
describe("StatsPage stats-card-grid — .stats-card container count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1902: renders exactly 11 .stats-card containers in the default empty state", () => {
    const { container } = render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const cards = container.querySelectorAll(".stats-card");
    // Pin the load-bearing panel count — neither additions nor deletions
    // should slip in unnoticed.
    expect(cards.length === 11).toBe(true);
  });
});

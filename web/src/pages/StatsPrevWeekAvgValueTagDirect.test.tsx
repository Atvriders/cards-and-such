import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1738: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> whose third <li> row shows the
 * Prior avg time value. The numeric VALUE in that row is rendered inside an
 * <em className="stats-week-value"> element — the <em> tagName is the
 * load-bearing italicized-emphasis treatment that pairs the baseline
 * Prior-avg value beneath its live counterpart (W1725) in the
 * comparison card.
 *
 * Existing tests cover the Prior-avg-row value tagName via a tag-prefixed
 * row lookup:
 *   - W1643 (StatsPrevWeekThirdRowValueTag):
 *     `prior.querySelectorAll("li")[2]` then `.querySelector(".stats-week-value")`
 *     — finds the Prior-avg row by its <li> tag position, then the value
 *     by class.
 *
 * And the class-only direct selectors for the FIRST and SECOND prev-week
 * rows, plus the this-week mirror for the Avg row:
 *   - W1726 (StatsPrevWeekPlaysValueTagDirect):
 *     `prior.querySelector(".stats-week-value")` — class-only direct
 *     lookup against the prev-week list scope, resolving to the 1st
 *     week-value (Prior-plays row).
 *   - W1737 (StatsPrevWeekWinsValueTagDirect): class-only direct lookup
 *     resolving to the 2nd prev-week-value (Prior-wins row).
 *   - W1725 (StatsThisWeekAvgValueTagDirect):
 *     `list.querySelectorAll(".stats-week-value")[2]` against the
 *     current-week list — the live Avg row mirror.
 *
 * But none of those pin the Prior-avg-row value tagName via a CLASS-ONLY
 * direct selector across the prev-week list — the 3rd
 * `.stats-week-value` in document order via
 * `prior.querySelectorAll(".stats-week-value")[2]`. That selector relies
 * purely on the className hook to locate the THIRD week-value (which
 * is the Prior-avg row's value, since Prior avg time is the 3rd <li>) and
 * is the lookup pattern external CSS rules / theming overrides typically
 * use. A regression that swapped the Prior-avg-row <em> for a <span> /
 * <strong> / <b> while leaving the <em>s on the Prior-plays / Prior-wins
 * rows intact would still satisfy W1726 (Prior-plays, 1st direct) and
 * W1737 (Prior-wins, 2nd direct) but would break the italicized-emphasis
 * treatment of the THIRD week-value found by any class-only consumer in
 * the prev-week baseline list. This test pins the tag specifically via
 * the class-only direct lookup against the prev list.
 */
describe("StatsPage stats-prev-week — Prior-avg value <em> via class-only direct selector", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1738: stats-prev-week third .stats-week-value is an <em> tag", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    // Class-only direct lookup against the prev-week list scope — no <li>
    // prefix. Resolves to the Prior-avg row's value (3rd
    // .stats-week-value in document order within the prev-week list).
    const values = prior.querySelectorAll(".stats-week-value");
    expect(values.length).toBeGreaterThanOrEqual(3);
    const avgValue = values[2];
    expect(avgValue).toBeDefined();
    // The element using the stats-week-value hook must be an <em>, not a
    // <span> / <strong> / <b> / <div>. This locks the italicized-emphasis
    // visual treatment for the third week-value found by class-only
    // consumers in the prev-week baseline list.
    expect(avgValue!.tagName).toBe("EM");
  });
});

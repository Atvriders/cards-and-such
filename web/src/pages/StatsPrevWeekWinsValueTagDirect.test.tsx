import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1737: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> whose second <li> row shows the
 * Prior wins count. The numeric VALUE in that row is rendered inside an
 * <em className="stats-week-value"> element — the <em> tagName is the
 * load-bearing italicized-emphasis treatment that pairs the baseline
 * Prior-wins value beneath its live counterpart (W1715) in the comparison
 * card.
 *
 * Existing tests cover the Prior-wins-row value tagName via a tag-prefixed
 * row lookup:
 *   - W1635 (StatsPrevWeekSecondRowValueTag): `prior.querySelectorAll("li")[1]`
 *     then `.querySelector(".stats-week-value")` — finds the Prior-wins row
 *     by its <li> tag position, then the value by class.
 *
 * And the class-only direct selector for the FIRST row (Prior plays) of the
 * prev-week list:
 *   - W1726 (StatsPrevWeekPlaysValueTagDirect):
 *     `prior.querySelector(".stats-week-value")` — class-only direct lookup
 *     against the prev-week list scope, resolving to the 1st week-value
 *     in document order (Prior-plays row).
 *
 * And the this-week mirror for the Wins row:
 *   - W1715 (StatsThisWeekWinsValueTagDirect):
 *     `list.querySelectorAll(".stats-week-value")[1]` — class-only direct
 *     lookup against the current-week list scope, resolving to the 2nd
 *     week-value in document order (Wins row).
 *
 * But none of those pin the Prior-wins-row value tagName via a CLASS-ONLY
 * direct selector across the prev-week list — the 2nd `.stats-week-value`
 * in document order via `prior.querySelectorAll(".stats-week-value")[1]`.
 * That selector relies purely on the className hook to locate the SECOND
 * week-value (which is the Prior-wins row's value, since Prior wins is the
 * 2nd <li>) and is the lookup pattern external CSS rules / theming
 * overrides typically use. A regression that swapped the Prior-wins-row
 * <em> for a <span> / <strong> / <b> while leaving the <em>s on the
 * Prior-plays / Prior-avg rows intact would still satisfy W1726 (Prior
 * plays, 1st direct) and W1641 (Prior avg, tag-prefixed) but would break
 * the italicized-emphasis treatment of the SECOND week-value found by any
 * class-only consumer in the prev-week baseline list. This test pins the
 * tag specifically via the class-only direct lookup against the prev list.
 */
describe("StatsPage stats-prev-week — Prior-wins value <em> via class-only direct selector", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1737: stats-prev-week second .stats-week-value is an <em> tag", () => {
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
    // prefix. Resolves to the Prior-wins row's value (2nd .stats-week-value
    // in document order within the prev-week list).
    const values = prior.querySelectorAll(".stats-week-value");
    expect(values.length).toBeGreaterThanOrEqual(2);
    const winsValue = values[1];
    expect(winsValue).toBeDefined();
    // The element using the stats-week-value hook must be an <em>, not a
    // <span> / <strong> / <b> / <div>. This locks the italicized-emphasis
    // visual treatment for the second week-value found by class-only
    // consumers in the prev-week baseline list.
    expect(winsValue!.tagName).toBe("EM");
  });
});

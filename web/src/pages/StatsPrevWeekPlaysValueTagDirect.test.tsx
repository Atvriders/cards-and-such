import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1726: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> whose first <li> row shows the
 * Prior plays count. The numeric VALUE in that row is rendered inside an
 * <em className="stats-week-value"> element — the <em> tagName is the
 * load-bearing italicized-emphasis treatment that pairs the baseline
 * Prior-plays value beneath its live counterpart (W1710) in the
 * comparison card.
 *
 * Existing tests cover the Prior-plays-row value tagName via a tag-prefixed
 * row lookup:
 *   - W1629 (StatsPrevWeekFirstRowValueTag): `prior.querySelector("li")`
 *     then `.querySelector(".stats-week-value")` — finds the Prior-plays
 *     row by its <li> tag position, then the value by class.
 *
 * And the this-week mirror for the Plays row:
 *   - W1710 (StatsThisWeekPlaysValueTagDirect):
 *     `list.querySelector(".stats-week-value")` — class-only direct lookup
 *     against the current-week list scope.
 *
 * But none of those pin the Prior-plays-row value tagName via a CLASS-ONLY
 * direct selector against the prev-week list scope itself —
 * `prior.querySelector(".stats-week-value")`. That selector relies purely
 * on the className hook to locate the FIRST week-value in document order
 * (which is the Prior-plays row's value, since Prior plays is the 1st <li>)
 * and is the lookup pattern external CSS rules / theming overrides
 * typically use. A regression that swapped the Prior-plays-row <em> for a
 * <span> / <strong> / <b> while leaving the <em>s on the Prior-wins /
 * Prior-avg rows intact would still satisfy W1635 (Prior wins) and W1641
 * (Prior avg) but would break the italicized-emphasis treatment of the
 * FIRST week-value found by any class-only consumer. This test pins the
 * tag specifically via the class-only direct lookup against the prev list.
 */
describe("StatsPage stats-prev-week — Prior-plays value <em> via class-only direct selector", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1726: stats-prev-week first .stats-week-value is an <em> tag", () => {
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
    // prefix. Resolves to the Prior-plays row's value (1st
    // .stats-week-value in document order within the prev-week list).
    const value = prior.querySelector(".stats-week-value");
    expect(value).not.toBeNull();
    // The element using the stats-week-value hook must be an <em>, not a
    // <span> / <strong> / <b> / <div>. This locks the italicized-emphasis
    // visual treatment for the first week-value found by class-only
    // consumers in the prev-week baseline list.
    expect(value!.tagName).toBe("EM");
  });
});

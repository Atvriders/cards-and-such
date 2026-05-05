import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1725: StatsPage's `stats-this-week` card renders a current-week
 * <ul data-testid="stats-this-week-list"> whose third <li> row shows the
 * Avg time value. The numeric VALUE in that row is rendered inside an
 * <em className="stats-week-value"> element — the <em> tagName is the
 * load-bearing italicized-emphasis treatment that pairs the live Avg
 * time value with its prev-week baseline counterpart in the comparison
 * card.
 *
 * Existing tests cover the Avg-row value tagName via a tag-prefixed
 * row lookup:
 *   - W1529 (StatsThisWeekAvgValueEm): `list.querySelectorAll("li")[2]`
 *     then `.querySelector(".stats-week-value")` — finds the Avg row by
 *     its <li> tag position, then the value by class.
 *
 * And the class-only direct selectors for the FIRST and SECOND rows:
 *   - W1710 (StatsThisWeekPlaysValueTagDirect):
 *     `list.querySelector(".stats-week-value")` — class-only direct lookup
 *     against the this-week list scope, resolving to the 1st week-value
 *     in document order (Plays row).
 *   - W1715 (StatsThisWeekWinsValueTagDirect):
 *     `list.querySelectorAll(".stats-week-value")[1]` — class-only direct
 *     lookup resolving to the 2nd week-value (Wins row).
 *
 * But none of those pin the Avg-row value tagName via a CLASS-ONLY
 * direct selector across the this-week list — the 3rd
 * `.stats-week-value` in document order via
 * `list.querySelectorAll(".stats-week-value")[2]`. That selector relies
 * purely on the className hook to locate the THIRD week-value (which
 * is the Avg row's value, since Avg time is the 3rd <li>) and is the
 * lookup pattern external CSS rules / theming overrides typically use.
 * A regression that swapped the Avg-row <em> for a <span> / <strong>
 * / <b> while leaving the <em>s on the Plays / Wins rows intact would
 * still satisfy W1710 (Plays, 1st direct) and W1715 (Wins, 2nd direct)
 * but would break the italicized-emphasis treatment of the THIRD
 * week-value found by any class-only consumer. This test pins the tag
 * specifically via the class-only direct lookup against the list.
 */
describe("StatsPage stats-this-week — Avg value <em> via class-only direct selector", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1725: stats-this-week-list third .stats-week-value is an <em> tag", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // Class-only direct lookup against the list scope — no <li> prefix.
    // Resolves to the Avg row's value (3rd .stats-week-value in document
    // order within the current-week list).
    const values = list.querySelectorAll(".stats-week-value");
    expect(values.length).toBeGreaterThanOrEqual(3);
    const avgValue = values[2];
    expect(avgValue).toBeDefined();
    // The element using the stats-week-value hook must be an <em>, not a
    // <span> / <strong> / <b> / <div>. This locks the italicized-emphasis
    // visual treatment for the third week-value found by class-only
    // consumers.
    expect(avgValue!.tagName).toBe("EM");
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1715: StatsPage's `stats-this-week` card renders a current-week
 * <ul data-testid="stats-this-week-list"> whose second <li> row shows the
 * Wins count. The numeric VALUE in that row is rendered inside an
 * <em className="stats-week-value"> element — the <em> tagName is the
 * load-bearing italicized-emphasis treatment that pairs the live Wins
 * value with its prev-week baseline counterpart in the comparison card.
 *
 * Existing tests cover the Wins-row value tagName via a tag-prefixed
 * row lookup:
 *   - W1542 (StatsThisWeekWinsValueEm): `list.querySelectorAll("li")[1]`
 *     then `.querySelector(".stats-week-value")` — finds the Wins row by
 *     its <li> tag position, then the value by class.
 *
 * And the class-only direct selector for the FIRST row (Plays):
 *   - W1710 (StatsThisWeekPlaysValueTagDirect):
 *     `list.querySelector(".stats-week-value")` — class-only direct lookup
 *     against the this-week list scope, resolving to the 1st week-value
 *     in document order (Plays row).
 *
 * But none of those pin the Wins-row value tagName via a CLASS-ONLY
 * direct selector across the this-week list — the 2nd
 * `.stats-week-value` in document order via
 * `list.querySelectorAll(".stats-week-value")[1]`. That selector relies
 * purely on the className hook to locate the SECOND week-value (which
 * is the Wins row's value, since Wins is the 2nd <li>) and is the
 * lookup pattern external CSS rules / theming overrides typically use.
 * A regression that swapped the Wins-row <em> for a <span> / <strong>
 * / <b> while leaving the <em>s on the Plays / Avg rows intact would
 * still satisfy W1710 (Plays, 1st direct) and W1529 (Avg, tag-prefixed)
 * but would break the italicized-emphasis treatment of the SECOND
 * week-value found by any class-only consumer. This test pins the tag
 * specifically via the class-only direct lookup against the list.
 */
describe("StatsPage stats-this-week — Wins value <em> via class-only direct selector", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1715: stats-this-week-list second .stats-week-value is an <em> tag", () => {
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
    // Resolves to the Wins row's value (2nd .stats-week-value in document
    // order within the current-week list).
    const values = list.querySelectorAll(".stats-week-value");
    expect(values.length).toBeGreaterThanOrEqual(2);
    const winsValue = values[1];
    expect(winsValue).toBeDefined();
    // The element using the stats-week-value hook must be an <em>, not a
    // <span> / <strong> / <b> / <div>. This locks the italicized-emphasis
    // visual treatment for the second week-value found by class-only
    // consumers.
    expect(winsValue!.tagName).toBe("EM");
  });
});

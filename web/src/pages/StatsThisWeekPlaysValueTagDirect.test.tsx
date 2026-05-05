import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1710: StatsPage's `stats-this-week` card renders a current-week
 * <ul data-testid="stats-this-week-list"> whose first <li> row shows the
 * Plays count. The numeric VALUE in that row is rendered inside an
 * <em className="stats-week-value"> element — the <em> tagName is the
 * load-bearing italicized-emphasis treatment that pairs the live Plays
 * value with its prev-week baseline counterpart (W1629) in the
 * comparison card.
 *
 * Existing tests cover the Plays-row value tagName via a tag-prefixed
 * row lookup:
 *   - W1281 (StatsCardWeekValueEm): `list.querySelectorAll("li")[0]` then
 *     `.querySelector(".stats-week-value")` — finds the Plays row by its
 *     <li> tag position, then the value by class.
 *
 * And the prev-week mirror for the first row:
 *   - W1629 (StatsPrevWeekFirstRowValueTag): `prior.querySelector("li")`
 *     then `.querySelector(".stats-week-value")` — same shape against the
 *     prev-week <ul>.
 *
 * But none of those pin the Plays-row value tagName via a CLASS-ONLY
 * direct selector against the this-week list scope itself —
 * `list.querySelector(".stats-week-value")`. That selector relies purely
 * on the className hook to locate the FIRST week-value in document order
 * (which is the Plays row's value, since Plays is the 1st <li>) and is
 * the lookup pattern external CSS rules / theming overrides typically
 * use. A regression that swapped the Plays-row <em> for a <span> /
 * <strong> / <b> while leaving the <em>s on the Wins / Avg rows intact
 * would still satisfy W1542 (Wins) and W1529 (Avg) but would break the
 * italicized-emphasis treatment of the FIRST week-value found by any
 * class-only consumer. This test pins the tag specifically via the
 * class-only direct lookup against the list.
 */
describe("StatsPage stats-this-week — Plays value <em> via class-only direct selector", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1710: stats-this-week-list first .stats-week-value is an <em> tag", () => {
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
    // Resolves to the Plays row's value (1st .stats-week-value in document
    // order within the current-week list).
    const value = list.querySelector(".stats-week-value");
    expect(value).not.toBeNull();
    // The element using the stats-week-value hook must be an <em>, not a
    // <span> / <strong> / <b> / <div>. This locks the italicized-emphasis
    // visual treatment for the first week-value found by class-only
    // consumers.
    expect(value!.tagName).toBe("EM");
  });
});

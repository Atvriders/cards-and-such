import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1680: StatsPage's `stats-this-week` card renders a current-week
 * <ul data-testid="stats-this-week-list"> with three <li> rows. Unlike
 * the prior-week baseline list — whose rows each carry exactly TWO
 * element children (label SPAN + value EM, see W1647) — the current-week
 * rows pair each metric with a percent-delta indicator, so each row
 * contains EXACTLY THREE element children: the label SPAN, the value EM,
 * and a renderDelta() SPAN (which always emits one of `is-up` / `is-down`
 * / `is-flat` — never null).
 *
 * W1656 pins the FIRST (Plays) row's child count to 3, and W1672 pins
 * the SECOND (Wins) row's child count to 3. Existing this-week tests pin
 * the testid (W1599), the <ul> tagName (W1604), the BEM wrap class
 * (W1593), the exact row count (W1626), the per-row label classes
 * (W1607/W1615/W1622), the per-row value EM tagNames (W1628/W1634/W1642),
 * and the avg delta direction (W1655), but NONE lock the THIRD (Avg
 * time) row's child element count. A regression that accidentally
 * dropped the renderDelta() span from JUST the avg-time row — leaving
 * plays and wins intact and so satisfying W1656/W1672 — would silently
 * strip the avg-time-trend signal while still passing every existing
 * assertion. This test pins the avg row's element-child count to
 * exactly 3, mirroring W1656/W1672 for the third row.
 */
describe("StatsPage stats-this-week — current-week avg row child count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1680: stats-this-week-list avg (third) <li> contains exactly three element children (label + value + delta)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    const avgRow = list.querySelectorAll("li")[2];
    expect(avgRow).toBeDefined();
    // Current-week rows pair each metric with a delta indicator: label
    // SPAN + value EM + renderDelta() SPAN. The prev-week rows stay at
    // TWO (W1647); the avg row MUST stay at THREE so a stray drop of
    // its renderDelta() span — collapsing only the avg-time-trend
    // signal — is caught even if W1656 (plays) and W1672 (wins) still
    // pass.
    expect(avgRow!.children.length).toBe(3);
  });
});

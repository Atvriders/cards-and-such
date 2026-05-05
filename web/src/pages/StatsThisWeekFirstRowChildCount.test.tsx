import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1656: StatsPage's `stats-this-week` card renders a current-week
 * <ul data-testid="stats-this-week-list"> with three <li> rows. Unlike
 * the prior-week baseline list — whose rows each carry exactly TWO
 * element children (label SPAN + value EM, see W1647) — the current-week
 * rows pair each metric with a percent-delta indicator, so each row
 * contains EXACTLY THREE element children: the label SPAN, the value EM,
 * and a renderDelta() SPAN (which always emits one of `is-up` / `is-down`
 * / `is-flat` — never null).
 *
 * Existing this-week tests pin the testid (W1599), the <ul> tagName
 * (W1604), the BEM wrap class (W1593), the exact row count (W1626), the
 * per-row label classes (W1607/W1615/W1622), the per-row value EM
 * tagNames (W1628/W1634/W1642), and the avg delta direction (W1655),
 * but NONE lock the per-row child element count. A regression that
 * accidentally dropped the renderDelta() span from the current-week
 * rows — flattening them into static baselines indistinguishable from
 * the prev-week list and silently breaking the trend signal — would
 * still satisfy every existing assertion while removing the comparison
 * affordance the card exists to provide. This test pins the first
 * this-week row's element-child count to exactly 3.
 */
describe("StatsPage stats-this-week — current-week first row child count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1656: stats-this-week-list first <li> contains exactly three element children (label + value + delta)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    const firstRow = list.querySelector("li");
    expect(firstRow).not.toBeNull();
    // Current-week rows pair each metric with a delta indicator: label
    // SPAN + value EM + renderDelta() SPAN. The prev-week rows stay at
    // TWO (W1647); these MUST stay at THREE so a stray drop of the
    // renderDelta() span — collapsing the trend signal — is caught.
    expect(firstRow!.children.length).toBe(3);
  });
});

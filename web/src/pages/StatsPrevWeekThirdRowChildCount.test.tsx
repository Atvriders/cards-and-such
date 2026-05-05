import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1772: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> with three <li> rows. Unlike the
 * current-week list — whose rows each carry THREE children (label SPAN,
 * value EM, and a percent-delta SPAN) — the prev-week rows are pure
 * baselines with NO delta indicator: each row contains EXACTLY TWO
 * element children, the label SPAN and the value EM.
 *
 * The first prev-week row's child count is pinned by W1647, the second
 * prev-week row's child count is pinned by W1766, but the THIRD row
 * (Prior avg time) has no equivalent guard. A regression that
 * accidentally rendered the renderDelta() span inside the third prev-week
 * row only — making the Prior-avg-time baseline visually echo the
 * current-week Avg-time row with a misleading "▲ 0%" indicator — would
 * still satisfy every existing per-row test (label tag, label text, value
 * tag, label/value counts, the first/second-row child counts) while
 * breaking the comparison-card semantics for the avg-time row. This test
 * pins the THIRD prev-week row's element-child count to exactly 2.
 */
describe("StatsPage stats-this-week — prev-week third row child count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1772: stats-prev-week third <li> contains exactly two element children (label + value, no delta)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    const rows = prior.querySelectorAll("li");
    expect(rows.length).toBeGreaterThanOrEqual(3);
    const thirdRow = rows[2];
    expect(thirdRow).toBeDefined();
    // Prev-week rows are pure baselines: label SPAN + value EM, NO delta.
    // The current-week rows have THREE element children (incl. delta SPAN);
    // the prev-week third row (Prior avg time) must stay at TWO so a stray
    // renderDelta() leak into this baseline row is caught even when the
    // first-row (W1647) and second-row (W1766) guards miss it.
    expect(thirdRow!.children.length).toBe(2);
  });
});

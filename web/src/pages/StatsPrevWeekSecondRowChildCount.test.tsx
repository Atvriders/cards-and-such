import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1766: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> with three <li> rows. Unlike the
 * current-week list — whose rows each carry THREE children (label SPAN,
 * value EM, and a percent-delta SPAN) — the prev-week rows are pure
 * baselines with NO delta indicator: each row contains EXACTLY TWO
 * element children, the label SPAN and the value EM.
 *
 * The first prev-week row's child count is pinned by W1647, but the
 * SECOND row (Prior wins) has no equivalent guard. A regression that
 * accidentally rendered the renderDelta() span inside the second
 * prev-week row only — making the Prior-wins baseline visually echo the
 * current-week Wins row with a misleading "▲ 0%" indicator — would still
 * satisfy every existing per-row test (label tag, label text, value tag,
 * label/value counts, the first-row child count) while breaking the
 * comparison-card semantics for the wins row. This test pins the SECOND
 * prev-week row's element-child count to exactly 2.
 */
describe("StatsPage stats-this-week — prev-week second row child count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1766: stats-prev-week second <li> contains exactly two element children (label + value, no delta)", () => {
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
    expect(rows.length).toBeGreaterThanOrEqual(2);
    const secondRow = rows[1];
    expect(secondRow).toBeDefined();
    // Prev-week rows are pure baselines: label SPAN + value EM, NO delta.
    // The current-week rows have THREE element children (incl. delta SPAN);
    // the prev-week second row (Prior wins) must stay at TWO so a stray
    // renderDelta() leak into this baseline row is caught even when the
    // first-row guard (W1647) misses it.
    expect(secondRow!.children.length).toBe(2);
  });
});

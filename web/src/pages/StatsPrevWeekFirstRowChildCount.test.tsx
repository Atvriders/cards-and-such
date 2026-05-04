import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1647: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> with three <li> rows. Unlike the
 * current-week list — whose rows each carry THREE children (label SPAN,
 * value EM, and a percent-delta SPAN) — the prev-week rows are pure
 * baselines with NO delta indicator: each row contains EXACTLY TWO
 * element children, the label SPAN and the value EM.
 *
 * Existing prev-week tests pin the testid, the <ul> tagName (W1605), the
 * BEM `--prev` modifier className (W1592), the exact row count (W1627),
 * each row's label copy (W1606/W1614/W1621), and each row's value EM
 * tagName (W1629/W1635/W1643), but NONE lock the per-row child element
 * count. A regression that accidentally rendered the renderDelta() span
 * inside the prev-week rows — making them visually echo the current-week
 * rows with a misleading "▲ 0%" indicator on what is supposed to be a
 * static baseline — would still satisfy every existing assertion while
 * breaking the comparison-card semantics. This test pins the first
 * prev-week row's element-child count to exactly 2.
 */
describe("StatsPage stats-this-week — prev-week first row child count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1647: stats-prev-week first <li> contains exactly two element children (label + value, no delta)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    const firstRow = prior.querySelector("li");
    expect(firstRow).not.toBeNull();
    // Prev-week rows are pure baselines: label SPAN + value EM, NO delta.
    // The current-week rows have THREE element children (incl. delta SPAN);
    // the prev-week rows must stay at TWO so a stray renderDelta() leak
    // into the baseline list is caught.
    expect(firstRow!.children.length).toBe(2);
  });
});

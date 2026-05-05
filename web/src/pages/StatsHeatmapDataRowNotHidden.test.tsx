import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1773 — Sibling-test partner to W1198 (head row aria-hidden + Mon..Sun day
 * labels). The category × day-of-week heatmap deliberately marks ONLY the
 * decorative head row with `aria-hidden="true"` so screen readers consume
 * the chart through the grid root's `role="img"` + `aria-label` (W1250)
 * plus the per-cell `title` tooltips (W1761) — and so the five category
 * data rows remain announceable. W1198 pins the head row's aria-hidden
 * marker, but no existing test pins the inverse: that the data rows are
 * NOT aria-hidden. A refactor that hoists `aria-hidden="true"` onto every
 * `.stats-heatmap-row` (e.g. moving it to a shared row-level prop, or
 * pushing it onto the chart root by mistake) would silently make the entire
 * heatmap inaccessible to AT users while keeping every other heatmap
 * assertion green. Pin the absence of `aria-hidden` on each of the five
 * data rows so any such regression fails loudly here.
 */
describe("StatsPage heatmap data rows aria-hidden absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1773: stats-heatmap-row data rows do NOT carry aria-hidden (only the head row is decorative)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    const dataRows = Array.from(
      grid.querySelectorAll(".stats-heatmap-row"),
    ).filter((r) => !r.classList.contains("stats-heatmap-row--head"));
    // 5 category data rows (solitaire / cards / dice / board / arcade).
    expect(dataRows.length).toBe(5);
    for (const row of dataRows) {
      // Must remain announceable — only the head row is decorative.
      expect(row.hasAttribute("aria-hidden")).toBe(false);
    }
  });
});

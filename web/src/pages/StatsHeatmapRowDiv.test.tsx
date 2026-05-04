import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1278 — Sibling-test partner to W1198 (head row aria-hidden + day labels)
 * and W1210 (5 data rows + ordered category labels). The category × day-of-week
 * heatmap is rendered as a CSS-grid of plain `<div>` rows rather than a
 * semantic `<table>`/`<tr>` tree — that's deliberate so the accent-tinted
 * background reads correctly under any theme (see HeatmapChart docstring),
 * and so screen readers consume the chart through the root `role="img"` +
 * aria-label (W1250) instead of double-announcing it as a data table. W1210
 * pins the row count and label text, W1198 pins the head row's aria-hidden
 * marker, and W1206 pins the cell className — but NO test currently pins
 * the row element TYPE. A refactor that swaps the row `<div>`s for `<tr>`s
 * (or `<li>`s, `<section>`s) would silently flip the heatmap into a
 * semantic table — adding implicit `row`/`rowgroup` aria roles that
 * compete with the root `role="img"` — with every existing assertion
 * still passing. Pin the tag here so any such promotion fails loudly.
 */
describe("StatsPage heatmap row element type", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1278: stats-heatmap-row data rows are DIV elements (no implicit table-row role)", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    const allRows = grid.querySelectorAll(".stats-heatmap-row");
    // 1 head row + 5 category data rows = 6 total. Every one must be a DIV
    // so a swap to <tr>/<li>/<section> is caught regardless of which row.
    expect(allRows.length).toBe(6);
    for (const row of Array.from(allRows)) {
      expect(row.tagName).toBe("DIV");
    }
  });
});

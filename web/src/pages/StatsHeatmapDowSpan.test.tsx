import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1784 — Sibling-test partner to W1198 (head row aria-hidden + Mon..Sun day
 * labels), W1278 (row DIV tag), W1341 (head leading spacer SPAN), W1369 (data
 * row label first child), and W1576 (data row child count). The heatmap's
 * head row renders the seven Mon..Sun column labels as `<span>` elements
 * with the `.stats-heatmap-dow` className. W1198 pins the count (7) and the
 * exact ordered textContent (`Mon..Sun`), but NO test currently pins the
 * element TAG of those day labels. A refactor that promotes them to `<th>`
 * (the obvious "make it semantic" move) would inject an implicit
 * `columnheader` ARIA role for each label — which then competes with the
 * root `role="img"` (W1250) since browsers ignore neither, double-announcing
 * the chart as both an image AND a partial table. A swap to `<div>`
 * (de-inlining for grid-area styling) would silently change the inline
 * flow-vs-block default and could break sibling-relative CSS selectors.
 * Either change leaves W1198's count + className + textContent assertions
 * green. Pin the SPAN tag on every day label so any such promotion fails
 * loudly here.
 */

function renderPage(): void {
  render(
    <MemoryRouter>
      <ConfirmProvider>
        <StatsPage />
      </ConfirmProvider>
    </MemoryRouter>,
  );
}

describe("StatsPage heatmap day-of-week label element type", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1784: stats-cat-heatmap head row day labels are SPAN elements (no implicit columnheader role)", () => {
    renderPage();
    const grid = screen.getByTestId("stats-cat-heatmap");
    const headRow = grid.querySelector(".stats-heatmap-row--head");
    expect(headRow).not.toBeNull();

    const dowLabels = headRow!.querySelectorAll(".stats-heatmap-dow");
    // Sanity: W1198 already pins the count, but re-asserting here keeps this
    // test independent — if the count drifts, fix W1198 before debugging.
    expect(dowLabels.length).toBe(7);
    for (const label of Array.from(dowLabels)) {
      expect(label.tagName).toBe("SPAN");
    }
  });
});

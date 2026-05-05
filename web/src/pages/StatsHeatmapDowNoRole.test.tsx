import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1808 — Sibling-test partner to W1198 (head row aria-hidden + Mon..Sun day
 * labels in order), W1784 (day-label SPAN tag), and W1795 (no title + no
 * element children). The heatmap's seven Mon..Sun day-of-week labels render
 * as bare `<span class="stats-heatmap-dow">` elements with NO explicit ARIA
 * role. A `<span>` without a role has no implicit AX role (it's `generic`/
 * presentational), which is exactly what we want here: the parent head row
 * is `aria-hidden="true"` (W1198), so these labels are intentionally hidden
 * from assistive tech and the grid speaks instead through its `role="img"`
 * + `aria-label="Plays by category and day of week, last 30 days"` (W1250).
 *
 * The slip-through this test catches: a refactor that adds an explicit role
 * for "semantic correctness" — e.g. `role="columnheader"` (the obvious
 * "these label columns" move) or `role="rowheader"` — would NOT trip
 * W1784's SPAN tag check (the element stays a span), W1795's no-title /
 * no-children check, or W1198's count + className + textContent. But it
 * WOULD inject a header role under a `role="img"` ancestor, which most
 * screen readers handle inconsistently: some browsers prune
 * descendants of role="img" entirely, others honor the inner header role
 * and double-announce the chart as both an image AND a partial table —
 * exactly the failure mode W1784's docstring already calls out for the
 * `<th>` promotion path. Pin the absence of any `role` attribute on every
 * day label so any future explicit-role addition fails loudly here.
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

describe("StatsPage heatmap day-of-week label has no explicit role attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1808: stats-cat-heatmap head row day labels carry no role attribute (rely on bare span generic role)", () => {
    renderPage();
    const grid = screen.getByTestId("stats-cat-heatmap");
    const headRow = grid.querySelector(".stats-heatmap-row--head");
    expect(headRow).not.toBeNull();

    const dowLabels = headRow!.querySelectorAll(".stats-heatmap-dow");
    // Sanity: W1198 pins the count, but re-asserting keeps this test
    // independent — if the count drifts, fix W1198 before debugging here.
    expect(dowLabels.length).toBe(7);

    for (const label of Array.from(dowLabels)) {
      // No explicit role — a bare <span> has the generic/presentational
      // role, which is correct under the head row's aria-hidden contract.
      // An explicit role="columnheader" / "rowheader" / "heading" would
      // inject a header role beneath role="img" on the grid, double-
      // announcing the chart on browsers that don't prune role="img"
      // descendants.
      expect(label.hasAttribute("role")).toBe(false);
      expect(label.getAttribute("role")).toBeNull();
    }
  });
});

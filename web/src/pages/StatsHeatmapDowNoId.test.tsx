import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2064 — Sibling-test partner to W1198 (head row aria-hidden + Mon..Sun day
 * labels in order), W1784 (day-label SPAN tag), W1795 (no title + no element
 * children), and W1808 (no explicit ARIA role). The heatmap's seven Mon..Sun
 * day-of-week labels render as bare `<span class="stats-heatmap-dow">`
 * elements with NO `id` attribute — they are unlabelled, presentational
 * cells under an `aria-hidden="true"` head row (W1198). The parent grid
 * already exposes the chart through `role="img"` +
 * `aria-label="Plays by category and day of week, last 30 days"` (W1250),
 * and the data cells use `data-testid` / `data-count` for query keys.
 *
 * The slip-through this test catches: a well-meaning refactor that gives
 * each day label a stable DOM `id` (e.g. `id="dow-mon"` so external code
 * could `getElementById` or so a `<label htmlFor>` could point at it).
 * That would not trip W1784's tagName check, W1795's no-title / no-children
 * check, W1808's no-role check, or W1198's count + className + text
 * checks — but it would create globally unique IDs on aria-hidden labels,
 * which (a) leak document-scope identifiers for elements deliberately
 * removed from the AX tree, (b) collide if the heatmap is ever rendered
 * twice on one page (e.g. compare-mode), and (c) suggest to assistive
 * tech / scrapers that these spans are addressable anchors when they are
 * intentionally not. Pin the absence of any `id` attribute on every day
 * label so any future id-injection fails loudly here.
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

describe("StatsPage heatmap day-of-week label has no id attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2064: stats-cat-heatmap head row day labels carry no id attribute (no globally addressable anchors on aria-hidden labels)", () => {
    renderPage();
    const grid = screen.getByTestId("stats-cat-heatmap");
    const headRow = grid.querySelector(".stats-heatmap-row--head");
    expect(headRow).not.toBeNull();

    const dowLabels = headRow!.querySelectorAll(".stats-heatmap-dow");
    // Sanity: W1198 pins the count, but re-asserting keeps this test
    // independent — if the count drifts, fix W1198 before debugging here.
    expect(dowLabels.length).toBe(7);

    // Spot-check the first label explicitly so a regression message points
    // at this exact assertion before the loop generalizes it.
    const first = dowLabels[0]!;
    expect(first.hasAttribute("id")).toBe(false);

    for (const label of Array.from(dowLabels)) {
      // No id — these spans live under an aria-hidden head row and must
      // not become globally addressable anchors. An id would also collide
      // if the heatmap were ever rendered twice on the same page.
      expect(label.hasAttribute("id")).toBe(false);
      expect(label.getAttribute("id")).toBeNull();
    }
  });
});

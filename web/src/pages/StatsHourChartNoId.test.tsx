import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2081 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the `HourChart` component
 * inside `StatsPage.tsx`) is identified for tests and styling exclusively
 * via its `data-testid` and `className="stats-svg"` hooks. It deliberately
 * carries NO `id` attribute, because:
 *
 *   1. The Stats page can mount multiple chart sub-trees (week line chart,
 *      day-of-week heatmap, hour-of-day bar chart, export pie, etc.), and
 *      a stray duplicate `id` would create an HTML validity violation if
 *      the chart were ever rendered twice (e.g. via a print/export
 *      preview that re-mounts the same component).
 *   2. The chart export pipeline serializes by `.stats-svg` selector, not
 *      by id, so an id would be dead weight.
 *   3. Sibling chart containers (`stats-week-chart`, `stats-export-pie`,
 *      `stats-cat-heatmap`, etc.) follow the same testid+class identity
 *      convention with no id, and a silent id leak on this one chart
 *      would diverge from that pattern.
 *
 * Existing hour-chart coverage pins:
 *   - the `data-testid="stats-hour-chart"` (StatsPage.test.tsx),
 *   - the `aria-label` text and `role="img"` (StatsHeatmapAria-style),
 *   - the `data-peak-hour` / `data-total` attributes (StatsPage.test.tsx),
 *   - the SVG container's exact `className="stats-svg"` (W1891),
 *   - the axis baseline `<line>` stroke (W1356),
 *   - the tick label `text-anchor="middle"` (W1289 / StatsHourLabelAnchor),
 *
 * but NO test asserts the chart's _absence_ of an `id` attribute. A
 * refactor that wires up an anchor/link target (e.g. `id="hour-chart"`)
 * for in-page navigation, or a copy-paste from a styled-components
 * migration that auto-injects ids, would silently regress the
 * id-free identity convention without tripping any current assertion.
 *
 * Pin the missing `id` so any silent id leak fails loudly, forcing
 * the change to ship with an explicit DOM-identity review.
 */
describe("StatsPage hour-of-day chart container missing id", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2081: stats-hour-chart SVG container has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // The chart container is the SVG element advertising
    // `data-testid="stats-hour-chart"`. Use `hasAttribute("id")` rather
    // than reading `.id` — SVG elements expose `.id` as an empty string
    // when unset, but `hasAttribute` is the canonical DOM-level check
    // for true attribute presence.
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.hasAttribute("id")).toBe(false);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1891 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the `HourChart` component
 * inside `StatsPage.tsx`) is the SVG hook that holds the 24 hour bars,
 * the axis baseline rule, and the tick labels. It is rendered with a
 * single literal `className="stats-svg"` — a shared CSS class that other
 * Stats SVGs (`stats-line-chart`, `stats-export-pie`, etc.) explicitly
 * do NOT inherit, since each chart picks its own typography/cursor/
 * focus rules through chart-specific class hooks.
 *
 * Existing hour-chart coverage already pins:
 *   - the `aria-label` text (W1356/StatsHeatmapAria-style aria coverage),
 *   - the `data-peak-hour` / `data-total` attributes (StatsPage.test.tsx),
 *   - the bar `<rect>` corner radius `rx="2"` (W1284),
 *   - the bar fill `#a78bfa` and peak fill `#fbbf24` (W1335 / W1357),
 *   - the axis baseline `<line>` stroke (W1356),
 *   - the tick label `text-anchor="middle"` (W1289),
 *   - the surrounding `<div className="stats-card">` wrapper (W1601),
 *
 * but NO test asserts the SVG container's own className. A refactor that
 * (a) drops the `stats-svg` class to bypass shared SVG box-sizing, or
 * (b) renames it to a chart-specific token like `stats-hour-svg`, or
 * (c) silently appends a modifier such as `stats-svg stats-svg--wide`,
 * would silently regress the chart's CSS-controlled max-width / display
 * behavior — and could cascade into the export-pipeline (which selects
 * `.stats-svg` for serialization) without tripping any current assertion.
 *
 * Pin the SVG container's exact `class` attribute string so any silent
 * className edit fails loudly, forcing the change to ship with an
 * explicit visual-regression review.
 */
describe("StatsPage hour-of-day chart container className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1891: stats-hour-chart SVG container has exact className 'stats-svg'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // The chart container is the SVG element advertising
    // `data-testid="stats-hour-chart"`. Read its `class` attribute as a
    // raw string — SVG elements expose `.className` as an
    // `SVGAnimatedString`, so `getAttribute("class")` is the canonical
    // way to compare the literal class list with exact equality.
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.getAttribute("class")).toBe("stats-svg");
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2384 — The activity line-chart container element (the `<svg>` carrying
 * `data-testid="stats-line-chart"` returned by the `LineChart` component
 * inside `StatsPage.tsx` around L369) is the SVG hook that holds the
 * sparkline path, per-day circles, and the "today" / "<range> ago" axis
 * labels. It is rendered with a single literal `className="stats-svg"` —
 * a shared CSS class that other Stats SVGs (`stats-bar-chart`,
 * `stats-pie-chart`, `stats-export-pie`, etc.) explicitly opt into
 * because the export pipeline selects `.stats-svg` for serialization
 * and the page's responsive `max-width` rules hang off the same hook.
 *
 * Sibling pins on this same `<svg data-testid="stats-line-chart">`:
 *   - W1236 (StatsPage.test.tsx) pins `role="img"` + the
 *     `aria-label="Activity over last 14d"` text and the dot count.
 *   - W1293 (StatsLineChartPathStroke.test.tsx) pins the inner `<path>`
 *     stroke colour `#60a5fa` and `fill="none"`.
 *   - W1388 (StatsLineChartDotRadius.test.tsx) pins the per-day circle
 *     radius `r="2.5"`.
 *   - W2068 (StatsLineChartNoId.test.tsx) pins absence of an `id`.
 *   - W2117 (StatsLineChartNoStyle.test.tsx) pins absence of inline `style`.
 *   - W2276 (StatsLineChartNoTabindex.test.tsx) pins absence of `tabindex`.
 *   - W2338 (StatsLineChartPreserveAspectRatio.test.tsx) pins absence of
 *     `preserveAspectRatio`.
 *
 * What none of those cover is the exact `class` attribute string on the
 * line-chart SVG itself. The hour-chart sibling already pins this via
 * W1891 (StatsHourChartContainerClass.test.tsx); the line-chart needs
 * its own pin because a className regression on one chart would NOT
 * trip the other chart's assertion. A refactor that
 *   (a) drops the `stats-svg` class to bypass shared SVG box-sizing,
 *   (b) renames it to a chart-specific token like `stats-line-svg`, or
 *   (c) silently appends a modifier such as `stats-svg stats-line--wide`,
 * would silently regress the chart's CSS-controlled max-width / display
 * behavior — and would cascade into the SVG export pipeline (which
 * selects `.stats-svg` for serialization) without tripping any current
 * assertion. Pin the SVG container's exact `class` attribute string so
 * any silent className edit fails loudly, forcing the change to ship
 * with an explicit visual-regression review.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W1891 / W2068 / W2117 / W2276 / W2338 pattern so the test
 * shares the `src/pages/Stats` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("StatsPage line-chart SVG container className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2384: stats-line-chart SVG container has exact className 'stats-svg'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // The chart container is the SVG element advertising
    // `data-testid="stats-line-chart"`. Read its `class` attribute as a
    // raw string — SVG elements expose `.className` as an
    // `SVGAnimatedString`, so `getAttribute("class")` is the canonical
    // way to compare the literal class list with exact equality.
    const chart = screen.getByTestId("stats-line-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.getAttribute("class")).toBe("stats-svg");
  });
});

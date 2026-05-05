import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2369 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the `HourChart` component
 * inside `StatsPage.tsx`) declares `role="img"` so assistive technology
 * exposes the chart as a single named graphic rather than walking the
 * 24 individual `<rect>` bars and tick `<text>` labels as anonymous
 * decorative shapes.
 *
 * Existing hour-chart container coverage already pins:
 *   - the SVG tagName (`StatsHourChartContainerClass.test.tsx`),
 *   - the exact className `stats-svg` (W1891),
 *   - the absence of `tabindex` (W2277),
 *   - the absence of an `id` attribute (W2046-style identity pin),
 *   - the absence of an inline `style` attribute,
 *   - the `data-peak-hour` / `data-total` data attributes,
 *   - the axis baseline `<line>` stroke (W1356),
 *   - the tick label `text-anchor="middle"` (W1289),
 *
 * but NO test asserts the SVG container's `role="img"` attribute.
 * A refactor that
 *   (a) drops the role (so SR walks the SVG's primitive shape children),
 *   (b) replaces it with `role="graphics-document"` or `role="figure"`,
 *   (c) flips it to `role="presentation"` to mute the aria-label entirely,
 * would silently regress the chart's accessible identity without tripping
 * any current assertion — the `aria-label` text would still render, but a
 * non-img role can prevent screen readers from announcing the chart at
 * all, breaking the parity with sibling stats charts (`stats-line-chart`,
 * `stats-export-pie`, `stats-export-bar`) which all advertise the same
 * `role="img"` contract.
 *
 * Pin the SVG container's exact `role` attribute so any silent role
 * edit fails loudly, forcing the change to ship with an explicit a11y
 * review.
 */
describe("StatsPage hour-of-day chart container role", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2369: stats-hour-chart SVG container has role=\"img\"", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // The chart container is the SVG element advertising
    // `data-testid="stats-hour-chart"`. SVG elements don't have an
    // implicit `role`, so `getAttribute("role")` is the canonical way
    // to read the explicit author-supplied value.
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.getAttribute("role")).toBe("img");
  });
});

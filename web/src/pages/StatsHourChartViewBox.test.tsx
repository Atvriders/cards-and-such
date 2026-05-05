import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2520 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the `HourChart` component
 * inside `StatsPage.tsx`) is rendered with a `viewBox` attribute derived
 * from the component's `w`/`h` defaults (`w=320`, `h=140`), producing the
 * literal string `"0 0 320 140"`. The `viewBox` is what makes the SVG
 * intrinsically responsive: it lets CSS scale the chart fluidly while
 * preserving aspect ratio, and it's what downstream consumers (e.g. the
 * export-as-SVG pipeline that serializes `.stats-svg` nodes) rely on for
 * a portable, self-contained vector image.
 *
 * Existing hour-chart coverage already pins:
 *   - the SVG tagName,
 *   - the exact className `stats-svg` (W1891),
 *   - the `role="img"` attribute (W2369),
 *   - the `data-peak-hour` / `data-total` data attributes
 *     (StatsPage.test.tsx),
 *   - the absence of `id` (W2081), `style` (W2116), and `tabindex` (W2277),
 *
 * but NO test asserts the chart's `viewBox`. A refactor that (a) drops
 * the `viewBox` in favor of fixed `width`/`height` attributes (breaking
 * fluid scaling), (b) silently changes the coordinate space to e.g.
 * `"0 0 640 280"` for a "high-DPI" rebake (which would invalidate every
 * other absolute-coordinate assertion in the hour-chart suite), or
 * (c) reorders the components to `"0 0 140 320"` (swapping width/height),
 * would all pass every existing assertion silently while producing a
 * visually broken or distorted chart.
 *
 * Pin the SVG container's exact `viewBox` string so any silent coordinate-
 * space edit fails loudly, forcing the change to ship with an explicit
 * visual-regression review.
 */
describe("StatsPage hour-of-day chart container viewBox", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2520: stats-hour-chart SVG container has exact viewBox '0 0 320 140'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // The chart container is the SVG element advertising
    // `data-testid="stats-hour-chart"`. Read `viewBox` as a raw attribute
    // string — SVG `viewBox` is exposed as an `SVGAnimatedRect` on the
    // element, so `getAttribute("viewBox")` is the canonical way to
    // compare the literal source string with exact equality.
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.getAttribute("viewBox")).toBe("0 0 320 140");
  });
});

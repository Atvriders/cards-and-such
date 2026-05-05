import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2338 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook) MUST NOT carry a
 * `preserveAspectRatio` attribute. The element is rendered by the
 * `LineChart` component at StatsPage.tsx:369 with only
 * `viewBox`, `className="stats-svg"`, `role="img"`, `aria-label`, and
 * `data-testid` — there is no `preserveAspectRatio` and the chart
 * relies on the SVG default ("xMidYMid meet") to letterbox uniformly.
 *
 * Sibling pins on this same `<svg data-testid="stats-line-chart">`:
 *   - W1236 (StatsPage.test.tsx) pins role/aria-label and dot count.
 *   - W1293 (StatsLineChartPathStroke.test.tsx) pins the inner
 *     `<path>` stroke colour `#60a5fa` and `fill="none"`.
 *   - W1388 (StatsLineChartDotRadius.test.tsx) pins the circle radius.
 *   - W2068 (StatsLineChartNoId.test.tsx) pins absence of `id`.
 *   - StatsLineChartNoStyle / NoTabindex pin absence of `style` /
 *     `tabindex`.
 *
 * What none of those cover is the ABSENCE of a `preserveAspectRatio`
 * attribute on the chart SVG itself. The contrast with PlayPage's
 * info-popover time-trend SVG (W1500) is deliberate: that one DOES set
 * `preserveAspectRatio="none"` so its sparkline stretches edge-to-edge.
 * The Stats LineChart instead uses the SVG default (uniform meet) so
 * the chart maintains its 320×140 aspect and letterboxes when its
 * container is wider — adding `preserveAspectRatio="none"` here would
 * silently:
 *   1. Stretch the path/dots non-uniformly when the `.stats-svg`
 *      container reflows to a different aspect, distorting the
 *      visual story (a flat trend would tilt diagonally).
 *   2. Break the implicit alignment between the chart's `viewBox`
 *      origin and the static `<text>` legends ("{rangeLabel} ago" /
 *      "today"), which assume uniform scaling to position correctly.
 *   3. Couple the chart to a non-default SVG behaviour without
 *      advertising it in CSS or component props, making the next
 *      refactor's intent harder to recover.
 *
 * One focused assertion: the chart SVG MUST NOT carry a
 * `preserveAspectRatio` attribute. If a future change deliberately
 * needs one, it should add the attribute AND update this pin in the
 * same commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2068 / W1293 sibling-file pattern so the test shares
 * the `src/pages/Stats` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no preserveAspectRatio attribute (W2338)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry a preserveAspectRatio attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const chart = screen.getByTestId("stats-line-chart");

    // Sanity: confirm we resolved the chart SVG itself, not some
    // wrapper, so the assertion below cannot pass vacuously after a
    // future restructure that moved the data-testid onto a parent.
    expect(chart.tagName).toBe("svg");
    expect(chart.getAttribute("role")).toBe("img");

    // The actual contract: no `preserveAspectRatio` attribute on the
    // chart SVG. Use `hasAttribute` rather than checking for a
    // specific string — an empty `preserveAspectRatio=""` would still
    // be a (broken) public surface that downstream consumers or
    // visual-regression baselines could come to depend on.
    expect(chart.hasAttribute("preserveAspectRatio")).toBe(false);
  });
});

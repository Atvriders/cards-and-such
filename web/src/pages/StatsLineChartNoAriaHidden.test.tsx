import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2664 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook) MUST NOT carry an
 * `aria-hidden` attribute. The element is rendered by the `LineChart`
 * component at StatsPage.tsx:369 and is anchored for tests by its
 * `data-testid`, for assistive tech by `role="img"` + `aria-label`,
 * and for styling by `className="stats-svg"`.
 *
 * Sibling pins on this same `<svg data-testid="stats-line-chart">`:
 *   - W1236 (StatsPage.test.tsx) pins role/aria-label and dot count.
 *   - W1293 (StatsLineChartPathStroke.test.tsx) pins the inner
 *     `<path>` stroke colour `#60a5fa` and `fill="none"`.
 *   - W2068 (StatsLineChartNoId.test.tsx) pins the absence of `id`.
 *   - W2276 (StatsLineChartNoTabindex.test.tsx) pins absence of
 *     `tabindex`.
 *   - StatsLineChartNoStyle.test.tsx pins absence of inline style.
 *   - StatsLineChartDotRadius.test.tsx pins the circle radius.
 *
 * What none of those cover is the ABSENCE of an `aria-hidden`
 * attribute on the chart SVG itself. A future refactor that introduced
 * e.g. `aria-hidden="true"` would silently:
 *   1. Remove the chart from the accessibility tree entirely, hiding
 *      its `role="img"` + `aria-label` from screen readers and
 *      defeating the deliberate labelling those sibling pins enforce.
 *   2. Make the chart inaccessible to assistive tech while still
 *      visible to sighted users — a WCAG 1.3.1 / 4.1.2 regression for
 *      a graphic that exists specifically to communicate the user's
 *      activity trend over time.
 *   3. Conflict with the surrounding section's heading structure: the
 *      chart belongs to a labelled "Activity" card, and hiding only
 *      the chart would leave the heading announcing content that AT
 *      cannot reach.
 *   4. An explicit `aria-hidden="false"` is also undesirable here —
 *      it commits to a redundant attribute that future code might
 *      come to rely on; the implicit (attribute-absent) default is the
 *      contract.
 *
 * One focused assertion: the chart SVG MUST NOT carry an `aria-hidden`
 * attribute (of any value). If a future change deliberately needs the
 * chart hidden from the accessibility tree, it should add the
 * attribute AND update this pin in the same commit, making the
 * trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2068 / W2276 pattern so the test shares the
 * `src/pages/Stats` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no aria-hidden attribute (W2664)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry an aria-hidden attribute", () => {
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

    // The actual contract: no `aria-hidden` attribute on the chart SVG.
    // Use `hasAttribute` rather than checking for a specific value —
    // any `aria-hidden` (including `aria-hidden="false"` and
    // `aria-hidden="true"`) would be a public-surface change that
    // future code could come to depend on, so the pin guards the
    // attribute's presence.
    expect(chart.hasAttribute("aria-hidden")).toBe(false);
  });
});

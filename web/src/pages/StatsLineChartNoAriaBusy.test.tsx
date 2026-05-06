import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2672 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook) MUST NOT carry an
 * `aria-busy` attribute. The element is rendered by the `LineChart`
 * component at StatsPage.tsx and is anchored for tests by its
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
 *   - W2664 (StatsLineChartNoAriaHidden.test.tsx) pins absence of
 *     `aria-hidden`.
 *   - StatsLineChartNoStyle.test.tsx pins absence of inline style.
 *   - StatsLineChartDotRadius.test.tsx pins the circle radius.
 *
 * What none of those cover is the ABSENCE of an `aria-busy` attribute
 * on the chart SVG itself. The chart is rendered synchronously from
 * already-loaded localStorage state — there is no asynchronous fetch,
 * no streaming data source, and no loading skeleton swap — so an
 * `aria-busy` attribute would be semantically wrong regardless of its
 * value. A future refactor that introduced e.g. `aria-busy="true"`
 * (perhaps copy-pasted from a genuinely-async chart elsewhere in the
 * app) would silently:
 *   1. Cause assistive tech to announce the chart as "busy / loading"
 *      indefinitely, even though its content is fully and immediately
 *      available, misleading screen-reader users into waiting for
 *      content that has already rendered.
 *   2. Suppress AT updates to the chart's accessible name/value while
 *      the attribute is set, breaking the labelling contract enforced
 *      by W1236.
 *   3. An explicit `aria-busy="false"` is also undesirable here — it
 *      commits to a redundant attribute that future code might come
 *      to depend on; the implicit (attribute-absent) default is the
 *      contract.
 *
 * One focused assertion: the chart SVG MUST NOT carry an `aria-busy`
 * attribute (of any value). If a future change introduces genuine
 * async loading for this chart, it should add the attribute AND
 * update this pin in the same commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2068 / W2276 / W2664 pattern so the test shares the
 * `src/pages/Stats` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no aria-busy attribute (W2672)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry an aria-busy attribute", () => {
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

    // The actual contract: no `aria-busy` attribute on the chart SVG.
    // Use `hasAttribute` rather than checking for a specific value —
    // any `aria-busy` (including `aria-busy="false"` and
    // `aria-busy="true"`) would be a public-surface change that
    // future code could come to depend on, so the pin guards the
    // attribute's presence.
    expect(chart.hasAttribute("aria-busy")).toBe(false);
  });
});

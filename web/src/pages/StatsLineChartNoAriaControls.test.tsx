import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2676 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook) MUST NOT carry an
 * `aria-controls` attribute. The element is rendered by the
 * `LineChart` component at StatsPage.tsx and is anchored for tests by
 * its `data-testid`, for assistive tech by `role="img"` +
 * `aria-label`, and for styling by `className="stats-svg"`.
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
 *   - W2672 (StatsLineChartNoAriaBusy.test.tsx) pins absence of
 *     `aria-busy`.
 *   - StatsLineChartNoStyle.test.tsx pins absence of inline style.
 *   - StatsLineChartDotRadius.test.tsx pins the circle radius.
 *
 * What none of those cover is the ABSENCE of an `aria-controls`
 * attribute on the chart SVG itself. `aria-controls` declares an
 * authoring contract that the labelled element controls the state or
 * presence of one or more other elements (referenced by id). The
 * line-chart SVG here is a passive presentational `role="img"` —
 * users cannot interact with it, it does not toggle, expand, filter,
 * or otherwise drive any other region of the page. There is no
 * "controlled" element, and therefore no legitimate id list that
 * `aria-controls` could reference.
 *
 * Adding `aria-controls` to this SVG would silently:
 *   1. Lie to assistive tech about the chart's interactivity model,
 *      causing screen readers to announce a non-existent control
 *      relationship and prompting users to attempt interactions that
 *      the SVG does not actually support.
 *   2. If the referenced id existed but the relationship were stale,
 *      AT users could be navigated to an unrelated region of the
 *      page; if the id were dangling, the attribute would dangle
 *      silently and degrade the page's accessibility tree without any
 *      compile-time signal.
 *   3. Commit the public DOM surface to an attribute whose value
 *      future code could come to depend on — the implicit
 *      (attribute-absent) default is the contract worth pinning.
 *
 * One focused assertion: the chart SVG MUST NOT carry an
 * `aria-controls` attribute (of any value). If a future change makes
 * this chart genuinely interactive in a way that controls another
 * element, it should add the attribute AND update this pin in the
 * same commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2068 / W2276 / W2664 / W2672 pattern so the test
 * shares the `src/pages/Stats` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no aria-controls attribute (W2676)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry an aria-controls attribute", () => {
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

    // The actual contract: no `aria-controls` attribute on the chart
    // SVG. Use `hasAttribute` rather than checking for a specific
    // value — any `aria-controls` (including an empty string) would
    // be a public-surface change that future code could come to
    // depend on, so the pin guards the attribute's presence.
    expect(chart.hasAttribute("aria-controls")).toBe(false);
  });
});

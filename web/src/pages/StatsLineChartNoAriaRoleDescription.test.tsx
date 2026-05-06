import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2698 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook) MUST NOT carry an
 * `aria-roledescription` attribute. The element is rendered by the
 * `LineChart` component at StatsPage.tsx and is anchored for tests
 * by its `data-testid`, for assistive tech by `role="img"` +
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
 *   - StatsLineChartNoAriaControls / NoAriaDescribedBy /
 *     NoAriaDisabled pin absences of those respective attributes.
 *   - StatsLineChartNoStyle.test.tsx pins absence of inline style.
 *
 * What none of those cover is the ABSENCE of an
 * `aria-roledescription` attribute on the chart SVG itself. The
 * existing accessible name comes from `aria-label="Activity over
 * last <range>"` paired with `role="img"` (W1236). Layering an
 * `aria-roledescription` (e.g. "line chart", "trend chart",
 * "sparkline") on top would silently:
 *   1. Override the implicit role announcement for AT users in
 *      ways that vary by screen reader, replacing the well-known
 *      "image" / "graphic" announcement with a custom string that
 *      assistive tech may translate inconsistently or not at all.
 *   2. Couple the chart's accessible-role surface to free-form
 *      copy that is not currently part of the contract enforced
 *      by W1236, encouraging drift between label text and the
 *      role-description copy.
 *   3. Make the SVG's accessibility surface depend on an attribute
 *      that some screen readers honour and others ignore, hurting
 *      cross-AT consistency without a corresponding accessible
 *      benefit, since the `aria-label` already describes the
 *      content.
 *
 * One focused assertion: the chart SVG MUST NOT carry an
 * `aria-roledescription` attribute (of any value, including the
 * empty string). If a future change deliberately introduces a
 * custom role description for this chart, it should update this
 * pin in the same commit so the trade-off is explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following
 * the established W2068 / W2276 / W2664 / W2672 pattern so the
 * test shares the `src/pages/Stats` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no aria-roledescription attribute (W2698)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry an aria-roledescription attribute", () => {
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

    // The actual contract: no `aria-roledescription` attribute on
    // the chart SVG. Use `hasAttribute` rather than checking for a
    // specific value — any `aria-roledescription` (including the
    // empty string) would be a public-surface change that future
    // code could come to depend on, so the pin guards the
    // attribute's presence.
    expect(chart.hasAttribute("aria-roledescription")).toBe(false);
  });
});

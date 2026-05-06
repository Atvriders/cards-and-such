import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2678 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook) MUST NOT carry an
 * `aria-disabled` attribute. The element is rendered by the
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
 *   - StatsLineChartNoStyle.test.tsx pins absence of inline style.
 *   - StatsLineChartDotRadius.test.tsx pins the circle radius.
 *
 * What none of those cover is the ABSENCE of an `aria-disabled`
 * attribute on the chart SVG itself. The chart is a presentational
 * data visualisation: it has no interactive controls, no focusable
 * descendants (W2276 pins `tabindex` absence; the SVG is also
 * `focusable="false"` per W2317), and no in-app affordances that
 * could meaningfully be "disabled". An `aria-disabled` attribute on
 * the chart SVG would silently:
 *   1. Mislead screen-reader users into believing the chart is an
 *      interactive control in a disabled state (e.g. a greyed-out
 *      button), even though it is purely informational content with
 *      `role="img"`. ARIA `aria-disabled` is defined for
 *      widget/composite roles — applying it to `role="img"` is a
 *      semantic mismatch the spec explicitly discourages.
 *   2. In some assistive technologies, suppress or alter
 *      announcement of the accessible name/value (the `aria-label`
 *      contract enforced by W1236), since "disabled" content is
 *      often skipped or de-emphasised in AT navigation.
 *   3. An explicit `aria-disabled="false"` is also undesirable here
 *      — it commits to a redundant attribute that future code might
 *      come to depend on; the implicit (attribute-absent) default
 *      is the contract.
 *
 * One focused assertion: the chart SVG MUST NOT carry an
 * `aria-disabled` attribute (of any value). If a future change
 * genuinely makes the chart an interactive widget that can be
 * disabled, it should add the attribute AND update this pin in the
 * same commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following
 * the established W2068 / W2276 / W2664 / W2672 pattern so the
 * test shares the `src/pages/Stats` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no aria-disabled attribute (W2678)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry an aria-disabled attribute", () => {
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

    // The actual contract: no `aria-disabled` attribute on the
    // chart SVG. Use `hasAttribute` rather than checking for a
    // specific value — any `aria-disabled` (including
    // `aria-disabled="false"` and `aria-disabled="true"`) would be
    // a public-surface change that future code could come to depend
    // on, so the pin guards the attribute's presence.
    expect(chart.hasAttribute("aria-disabled")).toBe(false);
  });
});

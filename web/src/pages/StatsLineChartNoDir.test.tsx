import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2723 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook) MUST NOT carry a
 * `dir` attribute. The element is rendered by the `LineChart`
 * component and is anchored for tests by its `data-testid`, for
 * assistive tech by `role="img"` + `aria-label`, and for styling by
 * `className="stats-svg"`.
 *
 * Sibling pins on this same `<svg data-testid="stats-line-chart">`:
 *   - W1236 (StatsPage.test.tsx) pins role/aria-label and dot count.
 *   - W2068 (StatsLineChartNoId.test.tsx) pins absence of `id`.
 *   - W2276 (StatsLineChartNoTabindex.test.tsx) pins absence of
 *     `tabindex`.
 *   - W2664 (StatsLineChartNoAriaHidden.test.tsx) pins absence of
 *     `aria-hidden`.
 *   - W2668 (StatsLineChartNoAriaDescribedBy.test.tsx) pins absence
 *     of `aria-describedby`.
 *   - StatsLineChartNoStyle.test.tsx pins absence of inline style.
 *
 * What none of those cover is the ABSENCE of a `dir` attribute on
 * the chart SVG itself. A future refactor that introduced e.g.
 * `dir="ltr"` or `dir="rtl"` on the chart SVG would silently:
 *   1. Override the inherited document/page direction for this one
 *      sub-tree, decoupling the chart from any future RTL-locale
 *      effort that flips the page via `<html dir="rtl">`.
 *   2. Become a public-surface contract that downstream CSS
 *      (`[dir="rtl"] .stats-svg { ... }`), screen readers, and
 *      bidirectional text shaping inside `<text>` children would
 *      come to depend on, making later removal a breaking change.
 *   3. Mask real bidi bugs in any `<text>` labels or `<tspan>`
 *      children that may be added later, because a hard-coded
 *      `dir` short-circuits the inherited algorithm.
 *   4. Diverge the chart's directionality contract from the
 *      surrounding StatsPage layout, which today simply inherits
 *      direction from the document root — a deliberate minimalism.
 *
 * One focused assertion: the chart SVG MUST NOT carry a `dir`
 * attribute (of any value, including "auto"). If a future change
 * deliberately needs to set chart direction, it should add the
 * attribute AND update this pin in the same commit, making the
 * trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following
 * the established W2068 / W2276 / W2664 / W2668 pattern so the test
 * shares the `src/pages/Stats` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no dir attribute (W2723)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry a dir attribute", () => {
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

    // The actual contract: no `dir` attribute on the chart SVG.
    // Use `hasAttribute` rather than checking for a specific value —
    // any `dir` (including "auto" or an empty string) would be a
    // public-surface change that future code could come to depend
    // on, so the pin guards the attribute's presence.
    expect(chart.hasAttribute("dir")).toBe(false);
  });
});

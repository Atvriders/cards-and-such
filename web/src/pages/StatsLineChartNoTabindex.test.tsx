import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2276 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook) MUST NOT carry a
 * `tabindex` attribute. The element is rendered by the `LineChart`
 * component at StatsPage.tsx:369 and is anchored for tests by its
 * `data-testid`, for assistive tech by `role="img"` + `aria-label`,
 * and for styling by `className="stats-svg"` — none of those rely on
 * the SVG being part of the keyboard tab order.
 *
 * Sibling pins on this same `<svg data-testid="stats-line-chart">`:
 *   - W1236 (StatsPage.test.tsx) pins role/aria-label and dot count.
 *   - W1293 (StatsLineChartPathStroke.test.tsx) pins the inner
 *     `<path>` stroke colour `#60a5fa` and `fill="none"`.
 *   - W2068 (StatsLineChartNoId.test.tsx) pins the absence of `id`.
 *   - StatsLineChartNoStyle.test.tsx pins the absence of inline style.
 *   - StatsLineChartDotRadius.test.tsx pins the circle radius.
 *
 * What none of those cover is the ABSENCE of a `tabindex` attribute on
 * the chart SVG itself. A future refactor that introduced e.g.
 * `tabIndex={0}` would silently:
 *   1. Insert the chart into the keyboard tab order between the
 *      surrounding controls/links, lengthening the tab path on a page
 *      that already has many interactive elements.
 *   2. Promise focus styling that this codebase has not implemented —
 *      the `.stats-svg` class carries no `:focus`/`:focus-visible`
 *      treatment, so a focused-but-invisible-focus state would be a
 *      regression in keyboard usability.
 *   3. Imply interactivity the SVG does not actually have. The chart
 *      is a static illustrative graphic; advertising it as focusable
 *      would mislead screen reader users into expecting actions.
 *   4. A negative `tabindex="-1"` is similarly undesirable here —
 *      it would commit to programmatic focus targeting from elsewhere
 *      on the page, coupling sibling code to an undeclared contract.
 *
 * One focused assertion: the chart SVG MUST NOT carry a `tabindex`
 * attribute (of any value). If a future change deliberately needs the
 * chart in the tab order, it should add `tabIndex` AND update this pin
 * in the same commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2068 / LobbyChipStripNoTabindex pattern so the test
 * shares the `src/pages/Stats` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no tabindex attribute (W2276)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry a tabindex attribute", () => {
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

    // The actual contract: no `tabindex` attribute on the chart SVG.
    // Use `hasAttribute` rather than checking for a specific value —
    // any `tabindex` (including `tabindex="-1"` and `tabindex="0"`)
    // would be a public-surface change that future code could come to
    // depend on, so the pin guards the attribute's presence.
    expect(chart.hasAttribute("tabindex")).toBe(false);
  });
});

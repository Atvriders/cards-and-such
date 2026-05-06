import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2668 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook) MUST NOT carry an
 * `aria-describedby` attribute. The element is rendered by the
 * `LineChart` component at StatsPage.tsx:369 and is anchored for tests
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
 *   - StatsLineChartNoStyle.test.tsx pins absence of inline style.
 *   - StatsLineChartDotRadius.test.tsx pins the circle radius.
 *
 * What none of those cover is the ABSENCE of an `aria-describedby`
 * attribute on the chart SVG itself. A future refactor that introduced
 * e.g. `aria-describedby="some-id"` would silently:
 *   1. Couple the chart SVG to a referenced element by id, creating an
 *      invisible cross-DOM dependency that breaks the moment the
 *      referenced node is renamed, conditionally rendered, or moved.
 *   2. Layer an extra screen-reader announcement on top of the existing
 *      `aria-label="Activity over last <range>"` contract pinned by
 *      W1236, potentially producing duplicated or contradictory
 *      verbalisation depending on the AT.
 *   3. If the referenced id does not actually exist in the DOM (a very
 *      easy regression in a list/range-driven page where ids change
 *      with the selected range), produce a dangling IDREF — a WCAG
 *      4.1.2 (Name, Role, Value) failure that lints typically miss.
 *   4. Commit the chart's accessible-description surface to a stable
 *      public contract; today the chart relies solely on its
 *      `aria-label`, and that minimalism is the contract.
 *
 * One focused assertion: the chart SVG MUST NOT carry an
 * `aria-describedby` attribute (of any value). If a future change
 * deliberately needs to add a description reference, it should add the
 * attribute AND update this pin in the same commit, making the
 * trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2068 / W2276 / W2664 pattern so the test shares the
 * `src/pages/Stats` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no aria-describedby attribute (W2668)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry an aria-describedby attribute", () => {
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

    // The actual contract: no `aria-describedby` attribute on the
    // chart SVG. Use `hasAttribute` rather than checking for a specific
    // value — any `aria-describedby` (including an empty string) would
    // be a public-surface change that future code could come to depend
    // on, so the pin guards the attribute's presence.
    expect(chart.hasAttribute("aria-describedby")).toBe(false);
  });
});

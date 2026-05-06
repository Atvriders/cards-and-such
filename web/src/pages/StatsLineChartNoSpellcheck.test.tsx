import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2735 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook) MUST NOT carry a
 * `spellcheck` attribute. The element is rendered by the `LineChart`
 * component at StatsPage.tsx and intentionally only declares `viewBox`,
 * `className="stats-svg"`, `role`, `aria-label`, and the
 * `data-testid` — the chart contains NO user-editable text content, so
 * any spell-checking hint at this layer is meaningless at best and a
 * footgun at worst.
 *
 * Sibling pins on this same `<svg data-testid="stats-line-chart">`:
 *   - W1236 (StatsPage.test.tsx) pins role/aria-label and dot count.
 *   - W1293 (StatsLineChartPathStroke.test.tsx) pins the inner `<path>`
 *     stroke colour `#60a5fa` and `fill="none"`.
 *   - W2068 (StatsLineChartNoId.test.tsx) pins absence of an `id`.
 *   - W2117 (StatsLineChartNoStyle.test.tsx) pins absence of an inline
 *     `style` attribute.
 *   - W2696 (StatsLineChartNoLang.test.tsx) pins absence of `lang`.
 *   - StatsLineChartDotRadius.test.tsx pins the circle radius.
 *
 * What none of those cover is the ABSENCE of a `spellcheck` attribute
 * on the chart SVG itself. A future refactor that introduced
 * `spellcheck="true"` (or even `spellcheck="false"`) here would silently:
 *   1. Lie about the surface — `spellcheck` is a global HTML hint
 *      meaningful only on editable text hosts (inputs, textareas,
 *      contenteditable). On a presentational `<svg>` it is a no-op
 *      that nevertheless ships extra bytes and invites future authors
 *      to assume there is editable text underneath.
 *   2. Drift out of parity with the sibling chart SVGs
 *      (StatsCatHeatmapNoSpellcheck, the hour-of-day chart, etc.) which
 *      already establish the "no spellcheck on Stats chart SVGs"
 *      contract for the page.
 *   3. Risk crawler/AT confusion: some assistive tech treats unexpected
 *      global attributes as a hint that the subtree is interactive,
 *      which would mis-describe a purely decorative chart.
 *
 * One focused assertion: the chart SVG MUST NOT carry a `spellcheck`
 * attribute. If a future change deliberately needs one, it should add
 * the new `spellcheck` AND update this pin in the same commit, making
 * the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2696 / W2117 / W2068 sibling-file pattern so the test
 * shares the `src/pages/Stats` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no spellcheck attribute (W2735)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry a spellcheck attribute", () => {
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

    // The actual contract: no `spellcheck` attribute on the chart SVG.
    // Use `hasAttribute` rather than checking `.spellcheck` — an empty
    // `spellcheck=""` (which the HTML spec coerces to "true") would
    // still be a public surface that mis-signals editability on a
    // presentational chart.
    expect(chart.hasAttribute("spellcheck")).toBe(false);
  });
});

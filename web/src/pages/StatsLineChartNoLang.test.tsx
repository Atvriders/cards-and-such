import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2696 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook) MUST NOT carry a `lang`
 * attribute. The element is rendered by the `LineChart` component at
 * StatsPage.tsx and intentionally only declares `viewBox`,
 * `className="stats-svg"`, `role`, `aria-label`, and the
 * `data-testid` — natural-language scoping is owned by the document
 * `<html lang>` declaration, NOT by per-SVG overrides.
 *
 * Sibling pins on this same `<svg data-testid="stats-line-chart">`:
 *   - W1236 (StatsPage.test.tsx) pins role/aria-label and dot count.
 *   - W1293 (StatsLineChartPathStroke.test.tsx) pins the inner
 *     `<path>` stroke colour `#60a5fa` and `fill="none"`.
 *   - W2068 (StatsLineChartNoId.test.tsx) pins absence of an `id`.
 *   - W2117 (StatsLineChartNoStyle.test.tsx) pins absence of an inline
 *     `style` attribute.
 *   - StatsLineChartDotRadius.test.tsx pins the circle radius.
 *
 * What none of those cover is the ABSENCE of a `lang` attribute on the
 * chart SVG itself. A future refactor that introduced `lang="en"` (or
 * any other value) here would silently:
 *   1. Fragment the document language scope: assistive technologies
 *      walking the DOM would treat the SVG subtree as a separate
 *      language island, potentially switching voice/pronunciation
 *      mid-page even though the chart contains no localized text
 *      content of its own.
 *   2. Drift out of sync with the real document `<html lang>` whenever
 *      the application's i18n layer switches locale, since the inline
 *      override would be hard-coded at render time.
 *   3. Break the contract that decorative chart SVGs inherit language
 *      from their ancestor — the same contract relied on by the sibling
 *      pie/heatmap chart pins (e.g. StatsCatHeatmapNoLang,
 *      StatsCardGridNoLang) for consistency across the Stats page.
 *
 * One focused assertion: the chart SVG MUST NOT carry a `lang`
 * attribute. If a future change deliberately needs one, it should add
 * the new `lang` AND update this pin in the same commit, making the
 * trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2117 / W2068 sibling-file pattern so the test shares the
 * `src/pages/Stats` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no lang attribute (W2696)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry a lang attribute", () => {
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

    // The actual contract: no `lang` attribute on the chart SVG. Use
    // `hasAttribute` rather than checking `.lang` — an empty `lang=""`
    // would still be a public surface that fragments the document
    // language scope and confuses assistive technologies.
    expect(chart.hasAttribute("lang")).toBe(false);
  });
});

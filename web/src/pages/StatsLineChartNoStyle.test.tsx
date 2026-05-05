import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2117 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook) MUST NOT carry an
 * inline `style` attribute. The element is rendered by the `LineChart`
 * component at StatsPage.tsx:369 and intentionally only declares
 * `viewBox`, `className="stats-svg"`, `role`, `aria-label`, and the
 * `data-testid` — visual presentation is owned by the `.stats-svg`
 * stylesheet rule, NOT by inline styles.
 *
 * Sibling pins on this same `<svg data-testid="stats-line-chart">`:
 *   - W1236 (StatsPage.test.tsx) pins role/aria-label and dot count.
 *   - W1293 (StatsLineChartPathStroke.test.tsx) pins the inner
 *     `<path>` stroke colour `#60a5fa` and `fill="none"`.
 *   - W2068 (StatsLineChartNoId.test.tsx) pins absence of an `id`.
 *   - StatsLineChartDotRadius.test.tsx pins the circle radius.
 *
 * What none of those cover is the ABSENCE of an inline `style`
 * attribute on the chart SVG itself. A future refactor that introduced
 * `style={{...}}` here would silently:
 *   1. Override the `.stats-svg` stylesheet contract that themes and
 *      future dark-mode tweaks rely on, since inline styles win the
 *      cascade and bypass user-agent / theme overrides.
 *   2. Re-introduce ad-hoc presentational coupling that the existing
 *      className-based approach was chosen specifically to avoid,
 *      forcing every test that asserts on the chart's appearance to
 *      know about the inline values too.
 *   3. Defeat CSP `style-src` policies that disallow inline styles —
 *      an inline `style` attribute on this SVG would either get
 *      stripped (breaking the chart) or force the policy to be
 *      relaxed application-wide.
 *
 * One focused assertion: the chart SVG MUST NOT carry an inline
 * `style` attribute. If a future change deliberately needs one, it
 * should add the new `style` AND update this pin in the same commit,
 * making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2068 / LobbyChipStripNoStyle pattern so the test shares
 * the `src/pages/Stats` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no inline style attribute (W2117)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry a style attribute", () => {
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

    // The actual contract: no inline `style` attribute on the chart
    // SVG. Use `hasAttribute` rather than checking the parsed
    // `.style.cssText` — an empty `style=""` would still be a public
    // surface that bypasses the `.stats-svg` stylesheet contract and
    // CSP `style-src` policies.
    expect(chart.hasAttribute("style")).toBe(false);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2116 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the `HourChart` component
 * inside `StatsPage.tsx`) MUST NOT carry an inline `style` attribute. Its
 * visual presentation is owned entirely by the `.stats-svg` CSS class plus
 * SVG-native presentation attributes (`viewBox`, `<line stroke=...>`,
 * `text-anchor`, etc.), not by any per-render `style={...}` prop.
 *
 * Sibling pins on this same `stats-hour-chart` SVG container:
 *   - StatsPage.test.tsx pins the `data-testid` itself, plus the
 *     `data-peak-hour` / `data-total` data attributes.
 *   - W1891 / StatsHourChartContainerClass.test.tsx pins the exact
 *     `className="stats-svg"` hook.
 *   - W2081 / StatsHourChartNoId.test.tsx pins the ABSENCE of an `id`.
 *   - W1356 / StatsHourBaselineStroke.test.tsx pins the baseline stroke.
 *   - W1289 / StatsHourLabelAnchor.test.tsx pins `text-anchor="middle"`.
 *
 * What none of those cover is the ABSENCE of an inline `style` attribute
 * on the chart's outer SVG element. A future refactor that introduced
 * e.g. `style={{ width: "100%" }}` for fluid sizing, or a JS-driven
 * `style={{ transform: ... }}` for animation, would silently:
 *   1. Bypass the established `.stats-svg` stylesheet contract, making
 *      theme/dark-mode/print overrides in CSS impossible to apply
 *      without `!important` workarounds.
 *   2. Couple the chart render output to per-render measurement logic,
 *      reintroducing layout-thrash patterns the current `viewBox`-only
 *      design specifically avoids by relying on intrinsic SVG sizing.
 *   3. Defeat CSP `style-src` policies that disallow inline styles —
 *      the deployment is free to adopt those today precisely because
 *      this SVG carries no inline style.
 *
 * One focused assertion: the `stats-hour-chart` SVG MUST NOT carry a
 * `style` attribute. If a future change deliberately needs inline style
 * (e.g., a JS-driven highlight transform), it should add the new
 * attribute AND update this pin in the same commit, making the trade-off
 * explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2081 / W1891 / W1356 pattern so the test shares the
 * `src/pages/StatsHour` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("StatsPage hour-of-day chart container has no inline style attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2116: stats-hour-chart SVG container has no style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // The chart container is the SVG element advertising
    // `data-testid="stats-hour-chart"`. Use `hasAttribute("style")`
    // rather than inspecting `.style.cssText` — an empty `style=""`
    // would still be a (broken) public surface that future code or
    // CSP-violation reporters could come to depend on, and DOM
    // `.style` reflection would silently mask its presence.
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.hasAttribute("style")).toBe(false);
  });
});

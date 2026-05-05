import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2465 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook, rendered by `LineChart`
 * at StatsPage.tsx:369) MUST NOT carry a `focusable` attribute.
 *
 * Existing pins on this same `<svg>`:
 *   - W1236 (StatsPage.test.tsx) — role="img" + aria-label="Activity over last 14d".
 *   - W2338 (StatsLineChartPreserveAspectRatio.test.tsx) — absence of preserveAspectRatio.
 *   - W2384 (StatsLineChartContainerClass.test.tsx) — className="stats-svg".
 *   - W1293 (StatsLineChartPathStroke.test.tsx) — inner <path> stroke/fill.
 *   - W1388 (StatsLineChartDotRadius.test.tsx) — per-day dot r="2.5".
 *   - W2426 (StatsLineChartDotFill.test.tsx) — dot fill="#60a5fa".
 *   - W2443 (StatsLineChartPathStrokeWidth.test.tsx) — path stroke-width="2".
 *   - W2068 (StatsLineChartNoId.test.tsx) — absence of id.
 *   - StatsLineChartNoStyle.test.tsx — absence of inline style.
 *   - W2276 (StatsLineChartNoTabindex.test.tsx) — absence of tabindex.
 *
 * What none of those cover is the ABSENCE of the `focusable` attribute
 * on the chart SVG. The legacy IE/SVG `focusable` attribute (values
 * `"true"` / `"false"` / `"auto"`) controls whether an SVG element is
 * part of the tab order in legacy/edge user agents — it is independent
 * of `tabindex` and is treated by some assistive tech as a hint about
 * interactivity. A future refactor that introduced e.g. `focusable="true"`
 * would silently:
 *   1. Inject the static illustrative chart into the keyboard tab order
 *      on legacy renderers, contradicting the existing W2276 contract
 *      that the chart is OUT of the tab order.
 *   2. Promise focus affordances the codebase has not built — the
 *      `.stats-svg` class carries no `:focus`/`:focus-visible` styling,
 *      so a focused-but-invisible-focus state would be a regression.
 *   3. Imply interactivity to assistive tech that the SVG does not
 *      actually have, misleading users about what the chart can do.
 * Conversely an explicit `focusable="false"` is also undesirable here —
 * the JSX deliberately does not commit to that value, and pinning its
 * absence keeps the rendered attribute surface minimal so future code
 * cannot start depending on a value the source did not write.
 *
 * One focused assertion: the chart SVG MUST NOT carry a `focusable`
 * attribute (of any value). If a future change deliberately needs to
 * declare focusability, it should add the attribute AND update this pin
 * in the same commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2068 / W2276 / W2338 pattern so the test shares the
 * `src/pages/Stats` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no focusable attribute (W2465)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry a focusable attribute", () => {
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

    // The actual contract: no `focusable` attribute on the chart SVG.
    // Use `hasAttribute` rather than checking for a specific value —
    // any `focusable` value (including `"false"`, `"true"`, and `"auto"`)
    // would be a public-surface change that future code could come to
    // depend on, so the pin guards the attribute's presence.
    expect(chart.hasAttribute("focusable")).toBe(false);
  });
});

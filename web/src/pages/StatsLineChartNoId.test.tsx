import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2068 — the StatsPage activity LineChart `<svg>` (resolved via the
 * stable `data-testid="stats-line-chart"` hook) MUST NOT carry an
 * `id` attribute. The element is rendered by the `LineChart` component
 * at StatsPage.tsx:369 and is anchored for tests by its `data-testid`,
 * for assistive tech by `role="img"` + `aria-label`, and for styling
 * by `className="stats-svg"` — none of those depend on an `id`.
 *
 * Sibling pins on this same `<svg data-testid="stats-line-chart">`:
 *   - W1236 (StatsPage.test.tsx) pins role/aria-label and dot count.
 *   - W1293 (StatsLineChartPathStroke.test.tsx) pins the inner
 *     `<path>` stroke colour `#60a5fa` and `fill="none"`.
 *   - StatsLineChartDotRadius.test.tsx pins the circle radius.
 *
 * What none of those cover is the ABSENCE of an `id` attribute on the
 * chart SVG itself. A future refactor that introduced e.g.
 * `id="stats-line-chart"` would silently:
 *   1. Create a stable URL fragment target (`/stats#stats-line-chart`)
 *      that external links and bookmarks could come to depend on,
 *      making it an undeclared part of the public contract.
 *   2. Enable `aria-controls` / `aria-labelledby` from elsewhere on the
 *      page to point at the SVG, coupling sibling components to an
 *      attribute this codebase has deliberately not advertised.
 *   3. Risk colliding with the StatsPage's exported SVG copy or any
 *      future second chart instance — duplicate ids break
 *      `getElementById`, fragment scrolling, and `<use href="#…">`.
 *
 * One focused assertion: the chart SVG MUST NOT carry an `id`
 * attribute. If a future change deliberately needs one, it should add
 * the new `id` AND update this pin in the same commit, making the
 * trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W1293 / LobbyChipStripNoId pattern so the test shares
 * the `src/pages/Stats` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("StatsPage — line-chart SVG has no id attribute (W2068)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry an id attribute", () => {
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

    // The actual contract: no `id` attribute on the chart SVG.
    // Use `hasAttribute` rather than checking for an empty string —
    // an `id=""` would still be a (broken) public surface that future
    // code could come to depend on.
    expect(chart.hasAttribute("id")).toBe(false);
  });
});

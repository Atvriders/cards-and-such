import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2725 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the `HourChart` component
 * inside `StatsPage.tsx`) intentionally omits a `dir` attribute so that
 * text directionality is inherited from the document / host application
 * shell. The chart renders short numeric tick labels (hours like `0`,
 * `6`, `12`, `18`, `23`) plus an `aria-label` whose textual orientation
 * is owned by the surrounding Stats page locale, which is in turn owned
 * by the document `<html dir>` (or the closest ancestor with `dir`).
 *
 * Pinning a `dir` attribute onto the chart root would (a) override the
 * user-agent or document-level direction for screen readers and bidi
 * algorithms walking up the dir inheritance chain, (b) hard-code an
 * LTR/RTL assumption that would mis-render the aria-label and any
 * future user-facing strings in the opposite script, and (c) duplicate
 * state that the surrounding shell already owns. It would also diverge
 * from the sibling chart containers (`stats-cat-heatmap` — pinned by
 * W2717, `stats-week-chart`, `stats-export-pie`, etc.) which all
 * follow the same dir-free identity convention.
 *
 * Existing hour-chart coverage pins:
 *   - the `data-testid="stats-hour-chart"` (StatsPage.test.tsx),
 *   - the absence of `id` (StatsHourChartNoId / W2081),
 *   - the absence of `style`, `tabindex`, `lang`, and various aria-*
 *     state attributes (StatsHourChartNo* siblings),
 *   - the `viewBox` (StatsHourChartViewBox), `role="img"`
 *     (StatsHourChartRole), container className (W1891),
 *
 * but NO test asserts the chart's _absence_ of a `dir` attribute. A
 * refactor that hardcodes inline direction (e.g. `dir="ltr"` copy-pasted
 * from a print-export styling tweak, or a styled-components migration
 * that auto-injects `dir`) would silently regress the dir-free identity
 * convention and quietly break bidi rendering for RTL host shells
 * without tripping any current assertion.
 *
 * Pin the missing `dir` so any silent dir leak fails loudly, forcing
 * the change to ship with an explicit DOM-identity / i18n review.
 */
describe("StatsPage hour-of-day chart container missing dir", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2725: stats-hour-chart SVG container has no dir attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // The chart container is the SVG element advertising
    // `data-testid="stats-hour-chart"`. Use `hasAttribute("dir")` rather
    // than reading `.dir` — SVG elements expose `.dir` via the DOM
    // string reflection and may surface inherited / default values,
    // but `hasAttribute` is the canonical DOM-level check for true
    // attribute presence on the element itself.
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.hasAttribute("dir")).toBe(false);
  });
});

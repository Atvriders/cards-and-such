import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2694 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the `HourChart` component
 * inside `StatsPage.tsx`) is a pure presentational chart whose textual
 * content (numeric hour labels "0".."23" and an aria-label like "Hour of
 * day distribution") is not natural-language prose. It deliberately
 * carries NO `lang` attribute, because:
 *
 *   1. The chart contains numeric tick labels, not words. Tagging it
 *      with `lang="en"` (or any BCP-47 tag) would mislead screen readers
 *      and translation tools into treating numeric tick text as
 *      translatable English content, breaking the chart for users on
 *      auto-translate browsers (Chrome, Edge translate features).
 *   2. The hosting `<html lang>` already supplies the document language
 *      for the surrounding aria-label text; a redundant `lang` on the
 *      SVG would invite divergence (e.g. an i18n migration that flips
 *      the document `lang` but forgets the per-chart override).
 *   3. Sibling chart SVGs (`stats-week-chart`, `stats-cat-heatmap`,
 *      `stats-export-pie`, etc.) follow the same convention of carrying
 *      no `lang` attribute, and a silent `lang` leak on this one chart
 *      would diverge from that codified pattern.
 *
 * Existing hour-chart coverage pins:
 *   - the `data-testid="stats-hour-chart"` (StatsPage.test.tsx),
 *   - the `aria-label` text and `role="img"` (StatsHourChartRole),
 *   - the absent `id` attribute (W2081 / StatsHourChartNoId),
 *   - the absent `style` attribute (StatsHourChartNoStyle),
 *   - the absent `tabindex` attribute (StatsHourChartNoTabindex),
 *   - the absent `aria-busy/controls/describedby/disabled/hidden/
 *     labelledby` (sibling NoAria* tests),
 *
 * but NO test asserts the chart's _absence_ of a `lang` attribute. A
 * refactor that introduces a localized chart subtitle, or a copy-paste
 * from a localized component that auto-stamps `lang="en"` on every SVG
 * root, would silently regress this convention without tripping any
 * current assertion.
 *
 * Pin the missing `lang` so any silent `lang` injection fails loudly,
 * forcing the change to ship with an explicit i18n review.
 */
describe("StatsPage hour-of-day chart container missing lang", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2694: stats-hour-chart SVG container has no lang attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // The chart container is the SVG element advertising
    // `data-testid="stats-hour-chart"`. Use `hasAttribute("lang")`
    // rather than reading a property — SVG elements have no DOM
    // `.lang` reflection, so `hasAttribute` is the canonical
    // attribute-presence check.
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.hasAttribute("lang")).toBe(false);
  });
});

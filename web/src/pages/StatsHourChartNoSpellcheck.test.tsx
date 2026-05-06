import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2733 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the `HourChart` component
 * inside `StatsPage.tsx`) is a pure data-visualization element. Its
 * visible content is a fixed set of numeric tick labels ("0", "6", "12",
 * "18", "23") and a programmatically generated aria-label. None of that
 * text is user-editable and the SVG never receives an editing caret.
 *
 * The browser's `spellcheck` attribute is only meaningful in editable
 * contexts (`contenteditable`, `<input>`, `<textarea>`); stamping it on
 * a non-editable chart root is misleading on three fronts:
 *
 *   1. It implies editability that the chart does not support, confusing
 *      assistive-tech that surfaces editability cues to users.
 *   2. It costs a layout-time attribute lookup in engines that probe
 *      `spellcheck` during text-rendering.
 *   3. It invites spell-checkers to walk through numeric tick labels,
 *      which is wasted work and can produce nonsense red underlines on
 *      engines that ignore the editable-context restriction.
 *
 * Sibling chart roots (`stats-cat-heatmap` per W2721, etc.) follow the
 * same convention of carrying no `spellcheck` attribute. Existing
 * hour-chart coverage pins the testid, role, aria-label, viewBox, and
 * the absence of `id`, `style`, `tabindex`, `lang`, `dir`, plus the
 * absent `aria-busy/controls/describedby/disabled/hidden/labelledby/
 * roledescription` siblings — but NO test asserts the chart's _absence_
 * of a `spellcheck` attribute. A future refactor that blanket-applies
 * global text-input attributes to chart containers (or copies a
 * `spellcheck="false"` from a sibling editable form field) would
 * silently regress this convention without tripping any current
 * assertion.
 *
 * Pin the missing `spellcheck` so any silent injection fails loudly,
 * forcing the change to ship with an explicit review.
 */
describe("StatsPage hour-of-day chart container missing spellcheck", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2733: stats-hour-chart SVG container has no spellcheck attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // The chart container is the SVG element advertising
    // `data-testid="stats-hour-chart"`. Use `hasAttribute("spellcheck")`
    // rather than reading a property — SVG elements have no DOM
    // `.spellcheck` reflection, so `hasAttribute` is the canonical
    // attribute-presence check.
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.hasAttribute("spellcheck")).toBe(false);
  });
});

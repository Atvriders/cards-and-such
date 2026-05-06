import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2731 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the `HourChart` component
 * inside `StatsPage.tsx`) must NOT declare the global `hidden` HTML
 * attribute. The SVG is a meaningful, named graphic exposed to assistive
 * technology via `role="img"` plus an `aria-label` summarizing the peak
 * hour and play total, and it is intended to be visually displayed at
 * all times the Stats page is rendered. A `hidden` attribute (boolean
 * presence — including `hidden=""`, `hidden="hidden"`, or
 * `hidden="until-found"`) would cause the user agent to suppress
 * rendering AND remove the subtree from the accessibility tree, making
 * the chart simultaneously invisible and unreadable to screen readers
 * — directly contradicting both the visible card layout and the
 * `role="img"` + `aria-label` contract.
 *
 * Existing hour-chart container coverage already pins:
 *   - `role="img"` (W2369),
 *   - the SVG tagName + `stats-svg` className,
 *   - the absence of `tabindex` (W2277),
 *   - the absence of an `id` attribute (W2... Stats hour chart no id),
 *   - the absence of an inline `style` attribute,
 *   - the absence of `aria-hidden` (W2666),
 *   - the absence of `aria-busy`, `aria-controls`, `aria-describedby`,
 *     `aria-disabled`, `aria-labelledby`, `aria-roledescription`,
 *   - the absence of `dir` and `lang`,
 *   - the `viewBox`,
 *
 * but NO test asserts the SVG container does not carry the global
 * `hidden` attribute. A refactor that toggles chart visibility via a
 * `hidden` flag (e.g. a "skeleton-while-loading" helper that mirrors
 * other dashboards), or one that introduces `hidden="until-found"` to
 * defer offscreen rendering, could silently hide the chart entirely
 * without tripping any current assertion — the `aria-label` text and
 * `role="img"` would still be present in the DOM but the chart would
 * be both invisible and dropped from the accessibility tree.
 *
 * Pin the absence of `hidden` on the chart container so any silent
 * visibility-suppression fails loudly, forcing the change to ship with
 * an explicit visibility/a11y review.
 */
describe("StatsPage hour-of-day chart container hidden attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2731: stats-hour-chart SVG container has no hidden attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // The chart container is the SVG element advertising
    // `data-testid="stats-hour-chart"`. `hasAttribute` is the canonical
    // way to assert the attribute is fully absent (vs. present-but-empty
    // — `hidden=""` — or present with any value, all of which trigger
    // the boolean-attribute semantics that suppress rendering).
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.hasAttribute("hidden")).toBe(false);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2684 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the `HourChart` component
 * inside `StatsPage.tsx`) must NOT declare `aria-labelledby`. The SVG
 * already exposes itself to assistive technology via `role="img"` plus
 * an inline `aria-label` that summarizes the peak hour and play total,
 * so an `aria-labelledby` pointing at another element would override
 * (and potentially corrupt) the carefully-composed AT name.
 *
 * Existing hour-chart container coverage already pins:
 *   - `role="img"` (W2369),
 *   - the SVG tagName + `stats-svg` className,
 *   - the absence of `tabindex` (W2277),
 *   - the absence of an `id` attribute,
 *   - the absence of an inline `style` attribute,
 *   - the absence of `aria-hidden` (W2666),
 *   - the absence of `aria-describedby` (W2670),
 *   - the absence of `aria-controls`,
 *   - the absence of `aria-busy`,
 *   - the `data-peak-hour` / `data-total` data attributes,
 *   - the axis baseline `<line>` stroke (W1356),
 *   - the tick label `text-anchor="middle"` (W1289),
 *
 * but NO test asserts the SVG container does not carry an
 * `aria-labelledby` attribute. A refactor that wires up a visible chart
 * caption/heading and naively connects it via `aria-labelledby`, or one
 * that mirrors a sibling chart that DOES carry a label-target, could
 * silently add `aria-labelledby` pointing at a missing or wrong id and
 * the chart's AT name would silently change (or break, surfacing as
 * `aria-labelledby="…undefined"` in the DOM) without tripping any
 * current assertion.
 *
 * Pin the absence of `aria-labelledby` on the chart container so any
 * such drift fails loudly, forcing the change to ship with an explicit
 * a11y review.
 */
describe("StatsPage hour-of-day chart container aria-labelledby absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2684: stats-hour-chart SVG container has no aria-labelledby attribute", () => {
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
    // or present-pointing-at-a-missing-id, both of which can corrupt the
    // AT name computation by overriding the inline `aria-label`).
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.hasAttribute("aria-labelledby")).toBe(false);
  });
});

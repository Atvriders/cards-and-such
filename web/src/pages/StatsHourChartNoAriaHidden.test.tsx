import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2666 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the `HourChart` component
 * inside `StatsPage.tsx`) must NOT declare `aria-hidden`. The SVG is a
 * meaningful named graphic exposed to assistive technology via
 * `role="img"` plus an `aria-label` summarizing the peak hour and play
 * total, so an `aria-hidden="true"` (or any `aria-hidden` value at all,
 * including "false" which still hints removal in some legacy UAs) would
 * silently strip the chart from the accessibility tree, contradicting
 * the `role="img"` + label contract.
 *
 * Existing hour-chart container coverage already pins:
 *   - `role="img"` (W2369),
 *   - the SVG tagName + `stats-svg` className,
 *   - the absence of `tabindex` (W2277),
 *   - the absence of an `id` attribute,
 *   - the absence of an inline `style` attribute,
 *   - the `data-peak-hour` / `data-total` data attributes,
 *   - the axis baseline `<line>` stroke (W1356),
 *   - the tick label `text-anchor="middle"` (W1289),
 *
 * but NO test asserts the SVG container does not carry an `aria-hidden`
 * attribute. A refactor that wraps the chart in a decorative-by-default
 * helper, or one that mirrors a sibling chart that genuinely IS
 * decorative, could silently add `aria-hidden="true"` and the chart
 * would vanish from screen readers without tripping any current
 * assertion — the `aria-label` text would still be present in the DOM
 * but the AT would skip the entire subtree.
 *
 * Pin the absence of `aria-hidden` on the chart container so any silent
 * decorative-flagging fails loudly, forcing the change to ship with an
 * explicit a11y review.
 */
describe("StatsPage hour-of-day chart container aria-hidden absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2666: stats-hour-chart SVG container has no aria-hidden attribute", () => {
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
    // or present-with-"false", both of which can mute AT exposure).
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.hasAttribute("aria-hidden")).toBe(false);
  });
});

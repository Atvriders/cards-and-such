import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2674 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the inline `HourChart`
 * helper inside `StatsPage.tsx`) must NOT declare an `aria-busy`
 * attribute. The SVG renders synchronously from already-resolved local
 * stats — there is no async fetch, no skeleton/loading state, and no
 * progressive render — so advertising `aria-busy` (regardless of value)
 * would be a lie to assistive technology and would cause some screen
 * readers to suppress label announcements until the (never-arriving)
 * "ready" transition fires.
 *
 * Existing hour-chart container coverage already pins:
 *   - `role="img"` (W2369),
 *   - the SVG tagName + `stats-svg` className,
 *   - the absence of `tabindex` (W2277),
 *   - the absence of an `id` attribute,
 *   - the absence of an inline `style` attribute,
 *   - the absence of `aria-hidden` (W2666),
 *   - the absence of `aria-describedby`,
 *   - the `data-peak-hour` / `data-total` data attributes,
 *   - the axis baseline `<line>` stroke (W1356),
 *   - the tick label `text-anchor="middle"` (W1289),
 *
 * but NO test asserts the SVG container does not carry an `aria-busy`
 * attribute. A refactor that introduces a generic chart wrapper sharing
 * loading semantics with future async charts could silently propagate
 * `aria-busy="true"` (or `aria-busy="false"`, which is also non-default
 * and announced by some AT) without tripping any current assertion.
 *
 * Pin the absence of `aria-busy` on the chart container so any silent
 * loading-flag leak fails loudly, forcing the change to either remove
 * the misleading attribute or wire up a real loading state with an
 * accompanying live-region announcement.
 */
describe("StatsPage hour-of-day chart container aria-busy absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2674: stats-hour-chart SVG container has no aria-busy attribute", () => {
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
    // or present-with-"false", both of which are non-default values that
    // some assistive technologies still surface to the user).
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.hasAttribute("aria-busy")).toBe(false);
  });
});

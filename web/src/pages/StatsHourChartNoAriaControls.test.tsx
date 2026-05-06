import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2680 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the inline `HourChart`
 * helper inside `StatsPage.tsx`) must NOT declare an `aria-controls`
 * attribute. The SVG is a static, non-interactive presentation of
 * already-resolved local stats — it does not own, toggle, expand,
 * collapse, or otherwise drive the state of any other element on the
 * page. There is no popup, listbox, dialog, tab panel, disclosure
 * region, or live region whose visibility/contents the chart governs.
 *
 * Existing hour-chart container coverage already pins:
 *   - `role="img"` (W2369),
 *   - the SVG tagName + `stats-svg` className,
 *   - the absence of `tabindex` (W2277),
 *   - the absence of an `id` attribute,
 *   - the absence of an inline `style` attribute,
 *   - the absence of `aria-hidden` (W2666),
 *   - the absence of `aria-describedby`,
 *   - the absence of `aria-busy` (W2674),
 *   - the `data-peak-hour` / `data-total` data attributes,
 *   - the axis baseline `<line>` stroke (W1356),
 *   - the tick label `text-anchor="middle"` (W1289),
 *
 * but NO test asserts the SVG container does not carry an
 * `aria-controls` attribute. A refactor that wraps the chart in a
 * filter/zoom toolkit (e.g. a "show details" disclosure, a tooltip
 * region, or a synced peak-hour callout) might mechanically wire
 * `aria-controls="..."` onto the SVG itself instead of onto the
 * triggering button — a common authoring mistake — silently pointing
 * screen readers at a target that may not exist or may not behave as
 * a controlled region. ARIA 1.2 requires the IDREF list in
 * `aria-controls` to resolve to real elements; broken or spurious
 * controls are a WCAG 4.1.2 (Name, Role, Value) violation.
 *
 * Pin the absence of `aria-controls` on the chart container so any
 * silent controls-relationship leak fails loudly, forcing the change
 * to either remove the misleading attribute or move it to the actual
 * interactive trigger element with a verified IDREF target.
 */
describe("StatsPage hour-of-day chart container aria-controls absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2680: stats-hour-chart SVG container has no aria-controls attribute", () => {
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
    // or present-with-a-bogus-IDREF, both of which would still be
    // surfaced as a "controls" relationship by assistive technology).
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.hasAttribute("aria-controls")).toBe(false);
  });
});

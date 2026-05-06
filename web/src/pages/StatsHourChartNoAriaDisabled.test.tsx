import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2682 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the inline `HourChart`
 * helper inside `StatsPage.tsx`) must NOT declare an `aria-disabled`
 * attribute. The SVG is a static role="img" data visualization — it is
 * not an interactive control, has no associated activation behavior,
 * and ARIA only defines `aria-disabled` on widgets/composite roles where
 * a "perceivable but not operable" state is meaningful. Advertising
 * `aria-disabled` (regardless of value) on a non-interactive image
 * conflicts with WAI-ARIA 1.2 §6.6.1 ("aria-disabled is not supported
 * on `img`") and causes some screen readers to either ignore the chart
 * label entirely or announce a misleading "dimmed/disabled" state on
 * what is in fact a fully rendered, fully readable visualization.
 *
 * Existing hour-chart container coverage already pins:
 *   - `role="img"` (W2369),
 *   - the SVG tagName + `stats-svg` className,
 *   - the absence of `tabindex` (W2277),
 *   - the absence of an `id` attribute,
 *   - the absence of an inline `style` attribute,
 *   - the absence of `aria-hidden` (W2666),
 *   - the absence of `aria-describedby` (W2670),
 *   - the absence of `aria-busy` (W2674),
 *   - the absence of `aria-controls` (W2680),
 *
 * but NO test asserts the SVG container does not carry an `aria-disabled`
 * attribute. The sibling `stats-line-chart` container already has its
 * own `aria-disabled`-absence pin (StatsLineChartNoAriaDisabled.test.tsx);
 * the hour chart deserves the same protection so a future refactor that
 * threads a shared "chart is disabled while data is reloading" flag (or
 * a styled-component utility that splats every aria-* prop onto the
 * underlying SVG) cannot silently propagate `aria-disabled="true"` (or
 * even the default-equivalent `aria-disabled="false"`, which is still a
 * non-default value some assistive technologies surface) onto the
 * non-interactive chart container without tripping a test.
 *
 * Pin the absence of `aria-disabled` on the chart container so any
 * silent disabled-flag leak fails loudly, forcing the change to either
 * drop the inappropriate attribute or move the disabled semantics to a
 * proper interactive wrapper element.
 */
describe("StatsPage hour-of-day chart container aria-disabled absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2682: stats-hour-chart SVG container has no aria-disabled attribute", () => {
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
    expect(chart.hasAttribute("aria-disabled")).toBe(false);
  });
});

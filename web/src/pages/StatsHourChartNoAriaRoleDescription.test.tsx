import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2700 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the inline `HourChart`
 * component inside `StatsPage.tsx`) must NOT declare
 * `aria-roledescription`.
 *
 * The SVG is exposed to assistive technology via `role="img"` plus an
 * `aria-label` that already summarizes the peak hour and total play
 * count. `aria-roledescription` overrides the localized role string AT
 * announces (e.g. "image"), so adding one here would silently change
 * the announced role for every screen-reader user — and worse, since
 * `aria-roledescription` is NOT translated by the user agent, it would
 * also bypass the user's locale.
 *
 * Existing hour-chart container coverage already pins:
 *   - `role="img"` (W2369),
 *   - the SVG tagName + `stats-svg` className,
 *   - the absence of `tabindex` (W2277),
 *   - the absence of an `id` attribute,
 *   - the absence of an inline `style` attribute (W2116),
 *   - the absence of `aria-hidden` (W2666),
 *   - the absence of `aria-describedby` (W2670),
 *   - the absence of `lang` (W2694),
 *   - the exact `viewBox` "0 0 320 140" (W2520),
 *   - the `data-peak-hour` / `data-total` data attributes,
 *   - the axis baseline `<line>` stroke (W1356),
 *   - the tick label `text-anchor="middle"` (W1289),
 *
 * but NO test asserts the SVG container does not carry an
 * `aria-roledescription` attribute. A refactor that hand-rolls a
 * "Hourly Plays Histogram" custom role string, or one that mirrors a
 * sibling chart that DOES carry `aria-roledescription`, could silently
 * graft an untranslated role description onto every AT announcement
 * without tripping any current assertion.
 *
 * Pin the absence of `aria-roledescription` on the chart container so
 * any such drift fails loudly, forcing the change to ship with an
 * explicit a11y / i18n review.
 */
describe("StatsPage hour-of-day chart container aria-roledescription absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2700: stats-hour-chart SVG container has no aria-roledescription attribute", () => {
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
    // or present-with-a-stale-string, either of which would silently
    // override the AT-announced role for every screen-reader user).
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.hasAttribute("aria-roledescription")).toBe(false);
  });
});

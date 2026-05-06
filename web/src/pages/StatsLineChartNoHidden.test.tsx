import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2741 — The activity LineChart container element on the StatsPage
 * (the `<svg>` carrying `data-testid="stats-line-chart"` rendered by
 * the `LineChart` component inside `StatsPage.tsx`) MUST NOT declare
 * the global `hidden` HTML attribute.
 *
 * The SVG is a meaningful, named graphic exposed to assistive
 * technology via `role="img"` plus an `aria-label` summarizing the
 * activity trend, and it is intended to be visually displayed at all
 * times the Stats page is rendered. A `hidden` attribute (boolean
 * presence — including `hidden=""`, `hidden="hidden"`, or
 * `hidden="until-found"`) would cause the user agent to suppress
 * rendering AND remove the subtree from the accessibility tree,
 * making the chart simultaneously invisible and unreadable to screen
 * readers — directly contradicting both the visible card layout and
 * the `role="img"` + `aria-label` contract.
 *
 * Existing line-chart container coverage already pins:
 *   - W1236 (StatsPage.test.tsx) — role/aria-label and dot count.
 *   - W1293 (StatsLineChartPathStroke.test.tsx) — inner `<path>`
 *     stroke colour and `fill="none"`.
 *   - W2068 (StatsLineChartNoId.test.tsx) — absence of `id`.
 *   - W2276 (StatsLineChartNoTabindex.test.tsx) — absence of
 *     `tabindex`.
 *   - StatsLineChartNoStyle.test.tsx — absence of inline style.
 *   - StatsLineChartDotRadius.test.tsx — circle radius.
 *   - W2664 (StatsLineChartNoAriaHidden.test.tsx) — absence of
 *     `aria-hidden`.
 *   - StatsLineChartNoAriaBusy / NoAriaControls / NoAriaDescribedBy /
 *     NoAriaDisabled / NoAriaRoleDescription / NoDir / NoLang /
 *     NoSpellcheck — absence of those WAI-ARIA / global attributes.
 *
 * Crucially, no test asserts the SVG container does not carry the
 * global `hidden` attribute. The sibling `aria-hidden` pin (W2664)
 * covers ONLY the WAI-ARIA `aria-hidden` attribute — `hidden` is a
 * different HTML global attribute with even stronger consequences
 * (the user agent removes the element from the visual layout AND the
 * accessibility tree). A refactor that toggles chart visibility via a
 * `hidden` flag (e.g. a "skeleton-while-loading" wrapper that mirrors
 * the hour-of-day chart pattern) or one that adopts
 * `hidden="until-found"` for deferred rendering could silently hide
 * the chart entirely without tripping any current assertion — the
 * `role="img"` and `aria-label` text would still be present in the
 * DOM but the chart would be invisible AND dropped from the
 * accessibility tree.
 *
 * Pin the absence of `hidden` on the chart container so any silent
 * visibility-suppression fails loudly, forcing the change to ship
 * with an explicit visibility / a11y review (and to update this pin
 * in the same commit, making the trade-off explicit).
 *
 * Lives in a NEW SIBLING file following the established W2068 /
 * W2276 / W2664 pattern so the test shares the `src/pages/Stats`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("StatsPage — line-chart SVG has no hidden attribute (W2741)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the stats-line-chart <svg> does NOT carry a hidden attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Resolve the chart container by its stable data-testid hook.
    const chart = screen.getByTestId("stats-line-chart");

    // Sanity: confirm we resolved the chart SVG itself, not some
    // wrapper, so the assertion below cannot pass vacuously after a
    // future restructure that moved the data-testid onto a parent.
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.getAttribute("role")).toBe("img");

    // The actual contract: no `hidden` attribute on the chart SVG.
    // `hasAttribute` is the canonical way to assert the attribute is
    // fully absent (vs. present-but-empty — `hidden=""` — or present
    // with any value, all of which trigger the boolean-attribute
    // semantics that suppress rendering and accessibility-tree
    // exposure).
    expect(chart.hasAttribute("hidden")).toBe(false);
  });
});

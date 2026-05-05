import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2277 — The hour-of-day chart container element (the `<svg>` carrying
 * `data-testid="stats-hour-chart"` returned by the `HourChart` component
 * inside `StatsPage.tsx`) is a presentation-only `role="img"` SVG. It is
 * NOT an interactive control: it has no click handlers, no keyboard
 * handlers, no focusable descendants, and the `<g>` bar groups inside it
 * are decorative SVG groups. Accordingly the chart container deliberately
 * carries NO `tabindex` attribute because:
 *
 *   1. SVG elements are not in the tab order by default, and adding a
 *      `tabindex` (e.g. `tabindex="0"`) would put a non-interactive
 *      decoration into the keyboard tab sequence, polluting the tab
 *      ring on the Stats page with a focusable graphic that has no
 *      keyboard affordance — a known WCAG keyboard-trap / surprise-focus
 *      anti-pattern.
 *   2. Sibling decorative chart containers on the same page follow the
 *      same no-tabindex identity convention (the cat heatmap, the card
 *      grid, the activity sparkline, the personal-records list, etc.,
 *      each have `StatsXxxNoTabindex.test.tsx` pins). A silent tabindex
 *      leak on the hour-of-day chart alone would diverge from that
 *      page-wide accessibility convention.
 *   3. The chart export pipeline serializes the SVG verbatim via the
 *      `.stats-svg` selector — a stray `tabindex` attribute would leak
 *      into the exported SVG file, where it is meaningless and
 *      potentially confusing to downstream consumers.
 *
 * Existing hour-chart coverage pins the `data-testid`, `role="img"`,
 * `aria-label`, `data-peak-hour`, `data-total`, the exact `className`,
 * the axis baseline stroke, the tick-label `text-anchor`, and the
 * absence of `id` and `style` attributes — but NO test asserts the
 * chart's _absence_ of a `tabindex` attribute. A refactor that adds
 * `tabIndex={0}` to make the chart "keyboard-discoverable" (a common
 * but misguided accessibility tweak), or a copy-paste from an
 * interactive chart elsewhere in the codebase, would silently regress
 * the no-tabindex convention without tripping any current assertion.
 *
 * Pin the missing `tabindex` so any silent leak fails loudly, forcing
 * the change to ship with an explicit accessibility review.
 */
describe("StatsPage hour-of-day chart container missing tabindex", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2277: stats-hour-chart SVG container has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // The chart container is the SVG element advertising
    // `data-testid="stats-hour-chart"`. Use `hasAttribute("tabindex")`
    // rather than reading `.tabIndex` — DOM elements expose `.tabIndex`
    // as a numeric property that defaults to -1 when unset, but
    // `hasAttribute` is the canonical DOM-level check for true
    // attribute presence on the rendered element.
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    expect(chart.hasAttribute("tabindex")).toBe(false);
  });
});

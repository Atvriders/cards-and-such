import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2702 — The category x day-of-week heatmap on StatsPage is a plain
 * `role="img"` static summary with a fixed `aria-label` describing the
 * "Plays by category and day of week, last 30 days" view. Sibling pins
 * already lock the absence of `aria-busy` (W2652), `aria-relevant` (W2688),
 * `aria-controls`, `aria-describedby`, `aria-disabled`, and `aria-labelledby`
 * on this element; this test pins the absence of `aria-roledescription`.
 *
 * `aria-roledescription` overrides the AT-spoken role string for an element
 * (e.g. AT might say "graphic" for `role="img"`; setting
 * `aria-roledescription="heatmap"` would force AT to instead announce
 * "heatmap"). For this chart that override would be actively harmful:
 *
 *   - The element is already labelled by `aria-label` with a full natural-
 *     language description of what it shows. A bespoke role-description
 *     string ("heatmap", "grid", "table", etc.) is jargon that screen-reader
 *     users typically do not benefit from when the underlying role is
 *     already a familiar `img`.
 *   - `aria-roledescription` is required by ARIA to be a localized string
 *     and the rest of the StatsPage chrome ships untranslated user-facing
 *     copy in English; quietly hard-coding an English role-description here
 *     would be inconsistent and would never be picked up by any future i18n
 *     pipeline that targets `aria-label`/visible text.
 *   - Some AT implementations announce `aria-roledescription` on EVERY
 *     focus/hover event of every descendant cell, which would turn the
 *     31-cell (7 days x several categories) grid into a verbose, repetitive
 *     announcement instead of a single image summary.
 *
 * Pin `aria-roledescription` absence on the heatmap root so an accidental
 * "let's call it a heatmap to AT" tweak fails here before it ships.
 */
describe("StatsPage cat heatmap aria-roledescription absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2702: stats-cat-heatmap root has no aria-roledescription attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-roledescription")).toBe(false);
  });
});

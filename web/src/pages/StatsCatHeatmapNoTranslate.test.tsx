import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2812 — The category x day-of-week heatmap chart root, identified by
 * `data-testid="stats-cat-heatmap"`, is a data-visualization container
 * whose visible cells are numeric play counts and short header labels
 * generated programmatically from category metadata. The HTML `translate`
 * attribute is intended to mark text content as translatable (or not) by
 * browser/extension translation tooling. Pinning `translate="yes"` on a
 * chart root would invite Chrome/Edge auto-translate (and tools like
 * Google Translate) to mutate the rendered category labels and tick
 * markers — re-flowing them, replacing them with longer strings, and
 * potentially breaking SVG layout calculations downstream. Pinning
 * `translate="no"` is equally undesirable here: the StatsPage chrome
 * already opts into the user-agent default, and adding an opinionated
 * value to a chart root would diverge from sibling cards (`stats-hour`,
 * `stats-line-chart`, the pie wrap) and create a noisy mixed-mode page.
 * Pin the absence of the `translate` attribute on the heatmap root so a
 * future refactor that blindly applies global text attributes to chart
 * containers fails here before it ships.
 */
describe("StatsPage cat heatmap translate absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2812: stats-cat-heatmap root has no translate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("translate")).toBe(false);
  });
});

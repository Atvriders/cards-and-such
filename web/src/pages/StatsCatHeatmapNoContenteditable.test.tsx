import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2815 — The category x day-of-week heatmap chart root, identified by
 * `data-testid="stats-cat-heatmap"`, is a read-only data-visualization
 * surface: its DOM is generated from aggregated play-count statistics,
 * its visible glyphs are short numeric labels and category headers, and
 * users have no business mutating any of that text in-place. The HTML
 * `contenteditable` attribute would turn the chart root (or any descendant
 * that inherits it) into an editable region — text would gain a caret,
 * keyboard input would be intercepted by the browser's editing host,
 * IME composition events would fire, undo/redo state would be tracked,
 * and accessibility tools would announce the element as "editable", all
 * for a chart that is conceptually a snapshot. Worse, an inherited
 * `contenteditable` would let a stray click-and-drag scribble corrupted
 * digits into the cells without any state mutation propagating back to
 * the underlying stats store, making the UI lie. Pin the absence of the
 * `contenteditable` attribute on the heatmap root so a future refactor
 * that mass-applies editing affordances (e.g. wrapping the page in a
 * notes-style editor wrapper) cannot silently hand the chart to the
 * browser's editing host.
 */
describe("StatsPage cat heatmap contenteditable absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2815: stats-cat-heatmap root has no contenteditable attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("contenteditable")).toBe(false);
  });
});

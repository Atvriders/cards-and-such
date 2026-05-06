import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2721 — The category x day-of-week heatmap chart root, identified by
 * `data-testid="stats-cat-heatmap"`, is a pure data-visualization element:
 * its visible content is composed of numeric play counts and short header
 * labels that are not user-editable text and never receive an editing
 * caret. The browser's `spellcheck` attribute only meaningfully applies
 * to editable contexts (`contenteditable`, `<input>`, `<textarea>`), so
 * pinning `spellcheck="true"` or `spellcheck="false"` onto a non-editable
 * chart root is misleading: it suggests editability that doesn't exist,
 * costs a layout-time attribute lookup in some engines, and would force
 * spell-checking heuristics to walk through programmatically generated
 * category names that may be in any locale. Pin the absence of the
 * `spellcheck` attribute on the heatmap root so a future refactor that
 * blindly applies global text-input attributes to chart containers fails
 * here before it ships.
 */
describe("StatsPage cat heatmap spellcheck absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2721: stats-cat-heatmap root has no spellcheck attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("spellcheck")).toBe(false);
  });
});

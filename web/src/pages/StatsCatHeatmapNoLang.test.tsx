import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2692 — The category × day-of-week heatmap chart root, identified by
 * `data-testid="stats-cat-heatmap"`, is composed entirely of language-
 * neutral content: the rendered cells are numeric play counts and the row
 * / column headers are short category names and weekday abbreviations that
 * are already covered by the document-level `<html lang>` set by the host
 * application shell. Pinning a `lang` attribute onto the chart root would
 * (a) override that document-level locale for accessibility tools that walk
 * up the lang inheritance chain, (b) imply the chart contains a single
 * authored natural language when in fact category names are user-supplied
 * and may be in any locale, and (c) duplicate state that the shell already
 * owns. Pin the absence of `lang` on the heatmap root so a future refactor
 * that hardcodes an inline locale (e.g. `lang="en"`) fails here before it
 * ships and quietly breaks i18n for non-English category labels.
 */
describe("StatsPage cat heatmap lang absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2692: stats-cat-heatmap root has no lang attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("lang")).toBe(false);
  });
});

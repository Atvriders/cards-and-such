import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2087: StatsPage's "Export all charts" button in the page-head export
 * actions row is addressed by `data-testid="stats-export-all"` and by the
 * `.stats-export-all` className — it intentionally does NOT carry an `id`
 * attribute. The sibling test W2070 (StatsExportBtnNoId) pins the same
 * absence-of-id contract for the per-chart `.stats-export-btn` controls,
 * but the page-head export-all button is a separate JSX element and is
 * not covered by that assertion. Existing tests on this button pin its
 * className, data-testid, title, type, click behaviour and rendered
 * tooltip text — but no test pins the absence of an `id`. A refactor
 * that adds `id="stats-export-all"` (matching the testid) would silently
 * collide with any future page-level anchor of the same id and bypass
 * every current assertion. Pin `hasAttribute("id")` to `false` so any
 * future id injection on this button is caught immediately.
 */
describe("StatsPage page-head — stats-export-all button no id attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2087: stats-export-all button lacks an id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-all");
    expect(btn.hasAttribute("id")).toBe(false);
  });
});

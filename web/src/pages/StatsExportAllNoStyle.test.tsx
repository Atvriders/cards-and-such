import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2173: StatsPage's "Export all charts" button in the page-head export
 * actions row is addressed by `data-testid="stats-export-all"` and styled
 * exclusively via the `.btn`, `.btn-ghost` and `.stats-export-all`
 * classNames — it intentionally does NOT carry an inline `style`
 * attribute. Existing sibling tests pin its className (W*), id-absence
 * (W2087), title, type, click behaviour and the combined-SVG export
 * payload (W950), but no test pins the absence of an inline `style`
 * attribute on this specific button. A refactor that drops in
 * `style={{ marginRight: 8 }}` (or any other inline override) would
 * silently bypass the stylesheet contract and slip past every current
 * assertion. Pin `hasAttribute("style")` to `false` so any future inline
 * style injection on this button is caught immediately.
 */
describe("StatsPage page-head — stats-export-all button no style attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2173: stats-export-all button lacks an inline style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-all");
    expect(btn.hasAttribute("style")).toBe(false);
  });
});

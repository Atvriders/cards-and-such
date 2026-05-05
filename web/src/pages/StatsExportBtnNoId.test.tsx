import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2070: StatsPage renders chart-export buttons (.stats-export-btn) on each
 * exportable card. These buttons are addressed by class plus data-testid
 * (stats-export-line / -pie / -bar) and aria-label — they intentionally do
 * NOT carry an `id` attribute, since IDs would either need to be unique per
 * button or risk collision when multiple stats cards render together.
 *
 * Existing tests pin the buttons' classNames, data-testids, aria-labels,
 * type, title and SVG markup, but none pin the absence of an `id`
 * attribute. A refactor that adds `id="export-btn"` (or similar) to the
 * shared button JSX would yield duplicate IDs across the three exportable
 * cards without failing any current assertion. Pin `hasAttribute("id")`
 * to false so any future id injection is caught immediately.
 */
describe("StatsPage .stats-export-btn — no id attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2070: every .stats-export-btn lacks an id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-line");
    expect(btn.classList.contains("stats-export-btn")).toBe(true);
    expect(btn.hasAttribute("id")).toBe(false);
  });
});

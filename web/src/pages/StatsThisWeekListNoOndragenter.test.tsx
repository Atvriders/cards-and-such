import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3194: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `ondragenter`
 * inline event handler attribute, if present, would attach a drag-and-drop
 * handler to this presentational weekly summary list. The list is not intended
 * to be a drop target — it summarises stats for the current week and does not
 * participate in any drag-and-drop interaction. Leaving `ondragenter` present
 * would expose a string-based handler in DOM serialization and could enable
 * unintended drag interactions or be flagged by inline-handler CSP audits.
 * A wide array of other this-week-list attribute absences are already pinned
 * (id, role, style, tabindex, ARIA, cite, and various event handlers), but no
 * test pins `ondragenter` absence on `stats-this-week-list`. Pinning it here
 * ensures any future change that accidentally attaches an `ondragenter`
 * handler to this list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ondragenter attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3194: stats-this-week-list ul has no ondragenter attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondragenter")).toBe(false);
    expect(ul.getAttribute("ondragenter")).toBeNull();
  });
});

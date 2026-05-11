import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3150: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `onfocusin`
 * inline event handler attribute, if present, would attach a JavaScript handler
 * that fires whenever any descendant element receives focus — a powerful hook
 * that is irrelevant to this presentational weekly summary list and that could
 * be abused to leak focus events, run inline scripts, or interfere with
 * keyboard navigation flows. The sibling `stats-prev-week` ul already has many
 * inline event-handler absences pinned, and a wide array of other
 * stats-this-week-list attribute absences are pinned (id, role, style,
 * tabindex, ARIA, cite, etc.), but no test pins `onfocusin` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an inline `onfocusin` handler to this list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onfocusin attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3150: stats-this-week-list ul has no onfocusin attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onfocusin")).toBe(false);
    expect(ul.getAttribute("onfocusin")).toBeNull();
  });
});

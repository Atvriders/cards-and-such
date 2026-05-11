import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onsignaturerequestabort` attribute is not a standard HTML event handler
 * attribute and has no defined semantics on a <ul>. Leaving it present would
 * still be exposed via DOM serialization and could be misinterpreted by tools,
 * crawlers, or future refactors. A wide array of other this-week-list
 * attribute absences are pinned (id, role, style, tabindex, ARIA, cite, etc.),
 * but no test pins `onsignaturerequestabort` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an `onsignaturerequestabort` handler to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onsignaturerequestabort attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onsignaturerequestabort attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsignaturerequestabort")).toBe(false);
    expect(ul.getAttribute("onsignaturerequestabort")).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The legacy
 * `onmouseout` inline event-handler attribute would, if present, register a
 * mouseout listener via HTML attribute parsing, executing arbitrary code
 * pulled from the attribute string. On a presentational weekly summary ul
 * this would be both semantically inappropriate and a latent XSS / injection
 * risk if any future refactor ever sourced its value from user data. A wide
 * array of this-week-list attribute absences are already pinned (id, role,
 * style, tabindex, ARIA, cite, etc.), but no test pins `onmouseout` absence
 * on `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an inline onmouseout handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onmouseout attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onmouseout attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmouseout")).toBe(false);
    expect(ul.getAttribute("onmouseout")).toBeNull();
  });
});

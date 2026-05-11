import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3012: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `cellspacing` attribute is a legacy presentational table attribute that was
 * only ever meaningful on <table> elements (and even there it is obsolete in
 * HTML5 in favor of CSS `border-spacing`). On a <ul> the attribute carries no
 * defined semantics, but leaving it present would still be exposed via DOM
 * serialization and could mislead future refactors that try to interpret it
 * as table-like spacing metadata. A wide array of other this-week-list
 * attribute absences are already pinned (id, role, style, tabindex, ARIA,
 * cite, etc.), but no test pins `cellspacing` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches a `cellspacing` value to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — cellspacing attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3012: stats-this-week-list ul has no cellspacing attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("cellspacing")).toBe(false);
    expect(ul.getAttribute("cellspacing")).toBeNull();
  });
});

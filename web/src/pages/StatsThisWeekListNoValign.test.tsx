import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3028: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `valign`
 * attribute is a deprecated legacy presentational attribute that only ever applied
 * to table-related elements (<col>, <colgroup>, <tbody>, <td>, <tfoot>, <th>,
 * <thead>, <tr>) in HTML 4, and is non-conforming and ignored in HTML5. On a
 * <ul> the attribute has no defined semantics whatsoever, but leaving it present
 * would still be exposed via DOM serialization and could confuse legacy tooling,
 * crawlers, or future refactors that try to interpret it as vertical alignment.
 * A wide array of other this-week-list attribute absences are pinned (id, role,
 * style, tabindex, ARIA, cite, etc.), but no test pins `valign` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches a `valign` to this presentational weekly summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — valign attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3028: stats-this-week-list ul has no valign attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("valign")).toBe(false);
    expect(ul.getAttribute("valign")).toBeNull();
  });
});

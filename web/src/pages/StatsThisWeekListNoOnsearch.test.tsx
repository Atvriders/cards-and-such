import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `onsearch`
 * event handler attribute is only meaningful on <input type="search"> elements,
 * where it fires when the user submits a search by pressing Enter or clicking
 * the clear button. On a <ul> the attribute carries no defined semantics, but
 * leaving it present would still be exposed via DOM serialization and could
 * mislead assistive technology, crawlers, or future refactors that try to
 * interpret it as a search handler. A wide array of other this-week-list
 * attribute absences are pinned (id, role, style, tabindex, ARIA, cite, etc.),
 * but no test pins `onsearch` absence on `stats-this-week-list`. Pinning it
 * here ensures any future change that accidentally attaches an `onsearch`
 * handler to this presentational weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onsearch attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onsearch attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsearch")).toBe(false);
    expect(ul.getAttribute("onsearch")).toBeNull();
  });
});

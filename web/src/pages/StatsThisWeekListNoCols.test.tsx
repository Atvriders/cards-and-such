import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2955: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `cols`
 * attribute is only meaningful on <textarea> and <frameset> elements, where it
 * specifies a visible character width or column layout. On a <ul> the attribute
 * carries no defined semantics, but leaving it present would still be exposed
 * via DOM serialization and could mislead assistive technology, crawlers, or
 * future refactors that try to interpret it as a layout hint. A wide array of
 * other this-week-list attribute absences are pinned (id, role, style, tabindex,
 * cite, ARIA, etc.), but no test pins `cols` absence on `stats-this-week-list`.
 * Pinning it here ensures any future change that accidentally attaches a `cols`
 * value to this presentational weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — cols attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2955: stats-this-week-list ul has no cols attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("cols")).toBe(false);
    expect(ul.getAttribute("cols")).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2959: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `rows`
 * attribute is only meaningful on <textarea> and <frameset> elements, where it
 * controls the visible row count or row layout. On a <ul> the attribute carries
 * no defined semantics, but leaving it present would still be exposed via DOM
 * serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as a row count. The sibling
 * `stats-prev-week` ul already has its `rows` absence pinned, and a wide array
 * of other this-week-list attribute absences are pinned (id, role, style,
 * tabindex, ARIA, cite, cols, etc.), but no test pins `rows` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches a `rows` count to this presentational weekly summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — rows attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2959: stats-this-week-list ul has no rows attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("rows")).toBe(false);
    expect(ul.getAttribute("rows")).toBeNull();
  });
});

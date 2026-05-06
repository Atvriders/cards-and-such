import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2941: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `pattern`
 * attribute is only meaningful on <input> elements, where it specifies a regular
 * expression the input's value is checked against during form validation. On a
 * <ul> the attribute carries no defined semantics, but leaving it present would
 * still be exposed via DOM serialization and could mislead assistive technology,
 * validators, or future refactors that try to interpret it as a constraint. A
 * wide array of other this-week-list attribute absences are pinned (id, role,
 * style, tabindex, cite, min, step, ARIA, etc.), but no test pins `pattern`
 * absence on `stats-this-week-list`. Pinning it here ensures any future change
 * that accidentally attaches a `pattern` regex to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — pattern attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2941: stats-this-week-list ul has no pattern attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("pattern")).toBe(false);
    expect(ul.getAttribute("pattern")).toBeNull();
  });
});

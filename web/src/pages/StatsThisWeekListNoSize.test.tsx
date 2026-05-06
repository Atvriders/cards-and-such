import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2944: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `size`
 * attribute is only meaningful on a small set of form-related elements
 * (<input>, <select>, and historically <hr>/<font>), where it controls the
 * visible character/option width or rule thickness. On a <ul> the attribute
 * carries no defined semantics, but leaving it present would still be exposed
 * via DOM serialization and could mislead assistive technology, CSS authors,
 * or future refactors that try to interpret it as a select-style sizing hint.
 * Many other this-week-list attribute absences are already pinned (id, role,
 * style, tabindex, ARIA, cite, etc.), but no test pins `size` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches a `size` value to this presentational weekly summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — size attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2944: stats-this-week-list ul has no size attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("size")).toBe(false);
    expect(ul.getAttribute("size")).toBeNull();
  });
});

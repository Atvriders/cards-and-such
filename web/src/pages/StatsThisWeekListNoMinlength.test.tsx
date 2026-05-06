import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2950: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `minlength` attribute is only meaningful on form text controls — namely
 * <input type="text|search|url|tel|email|password"> and <textarea> — where it
 * sets the minimum number of characters the user must enter for the control to
 * satisfy validation. On a <ul> the attribute has no defined semantics
 * whatsoever, and leaving one present would still be exposed via DOM
 * serialization and could mislead future refactors that try to interpret this
 * presentational weekly summary list as some kind of length-bounded text
 * container. A wide array of other this-week-list attribute absences are
 * already pinned (id, role, style, tabindex, ARIA, cite, maxlength, etc.), but
 * no test pins `minlength` absence on `stats-this-week-list`. Pinning it here
 * ensures any future change that accidentally attaches a `minlength` value to
 * this purely presentational <ul> is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — minlength attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2950: stats-this-week-list ul has no minlength attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("minlength")).toBe(false);
    expect(ul.getAttribute("minlength")).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3038: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `classid`
 * attribute is a legacy attribute historically used on <object> elements to
 * identify an ActiveX class or similar embedded component. It has no defined
 * semantics on a <ul> and is not part of any modern HTML standard for list
 * elements. Leaving it present (even accidentally) would still be exposed via
 * DOM serialization and could confuse legacy parsers, security scanners, or
 * future refactors that try to interpret it as an object class identifier.
 * Numerous sibling attribute absences are already pinned on this ul (id, role,
 * style, tabindex, ARIA, cite, etc.), but no test pins `classid` absence.
 * Pinning it here ensures any future change that accidentally attaches a
 * `classid` to this presentational weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — classid attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3038: stats-this-week-list ul has no classid attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("classid")).toBe(false);
    expect(ul.getAttribute("classid")).toBeNull();
  });
});

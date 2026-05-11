import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `oninvalid` attribute is an event handler content attribute defined for
 * form-associated elements (<input>, <select>, <textarea>, etc.) and fires
 * when constraint validation fails. On a <ul> the attribute has no defined
 * behavior, but if present it would still be parsed by browsers as an inline
 * event handler, creating a needless XSS sink and confusing future readers.
 * Sibling attribute absences on this list are already pinned (id, role,
 * style, tabindex, ARIA, cite, etc.); this test extends that coverage to
 * `oninvalid` so any future change that accidentally attaches an inline
 * invalid handler to this presentational weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — oninvalid attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no oninvalid attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oninvalid")).toBe(false);
    expect(ul.getAttribute("oninvalid")).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3165: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `onpaste`
 * attribute is an inline event handler that would fire whenever a paste event is
 * dispatched on the element. A presentational <ul> summarising weekly stats has
 * no user-editable content and no business handling paste events; an inline
 * `onpaste` here would either be dead code or, worse, an injected handler
 * executing attacker-controlled script. A broad set of other this-week-list
 * attribute absences are already pinned (id, role, style, tabindex, cite, ARIA,
 * etc.), but no test currently pins `onpaste` absence on `stats-this-week-list`.
 * Pinning it here ensures any future change that accidentally attaches an
 * `onpaste` handler to this presentational weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpaste attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3165: stats-this-week-list ul has no onpaste attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpaste")).toBe(false);
    expect(ul.getAttribute("onpaste")).toBeNull();
  });
});

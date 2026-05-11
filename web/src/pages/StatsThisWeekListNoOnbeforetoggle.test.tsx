import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3233: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onbeforetoggle` event handler attribute is only meaningful on elements that
 * support the toggle event such as <dialog> (with popover) and elements bearing
 * the `popover` attribute; it fires before such an element transitions between
 * open and closed states. On a presentational <ul> the attribute carries no
 * defined semantics, but leaving it present would still be exposed via DOM
 * serialization and could execute arbitrary script if a future refactor or
 * regression accidentally attached one, or mislead tooling that scans for
 * inline event handlers. Many sibling attribute absences are already pinned
 * on this ul (id, role, style, tabindex, ARIA, cite, and numerous event
 * handlers), but no test pins `onbeforetoggle` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an inline `onbeforetoggle` handler to this weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onbeforetoggle attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3233: stats-this-week-list ul has no onbeforetoggle attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforetoggle")).toBe(false);
    expect(ul.getAttribute("onbeforetoggle")).toBeNull();
  });
});

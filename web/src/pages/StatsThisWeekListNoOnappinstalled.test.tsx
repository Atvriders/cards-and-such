import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3302: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onappinstalled` event handler attribute is an IDL attribute defined on
 * <body> elements (via the WindowEventHandlers mixin) and fires when the
 * page's web app is installed. On a <ul> it carries no defined semantics
 * and should never be present, but leaving it accessible via attribute
 * serialization could mislead refactors or static analyzers that try to
 * interpret it as a real event handler. A wide array of other this-week-list
 * attribute absences are already pinned (id, role, style, tabindex, ARIA,
 * cite, and many event handlers), but no test pins `onappinstalled`
 * absence on `stats-this-week-list`. Pinning it here ensures any future
 * change that accidentally attaches an `onappinstalled` handler to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onappinstalled attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3302: stats-this-week-list ul has no onappinstalled attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onappinstalled")).toBe(false);
    expect(ul.getAttribute("onappinstalled")).toBeNull();
  });
});

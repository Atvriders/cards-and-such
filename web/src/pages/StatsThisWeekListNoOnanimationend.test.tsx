import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3257: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onanimationend` attribute is a global event handler content attribute that,
 * when present, registers an inline JavaScript handler invoked at the end of a
 * CSS animation on the element. On this presentational weekly summary <ul> no
 * animation handler is needed; allowing one to slip in would introduce an
 * inline-script execution path that bypasses the React event system, fights
 * any future Content-Security-Policy that forbids inline handlers, and risks
 * shadowing the structured event wiring used elsewhere in the app. A wide
 * array of other this-week-list attribute absences are already pinned (id,
 * role, style, tabindex, ARIA, cite, and many event handlers), but no test
 * pins `onanimationend` absence on `stats-this-week-list`. Pinning it here
 * ensures any future change that accidentally attaches an inline
 * `onanimationend` handler to this list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onanimationend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3257: stats-this-week-list ul has no onanimationend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onanimationend")).toBe(false);
    expect(ul.getAttribute("onanimationend")).toBeNull();
  });
});

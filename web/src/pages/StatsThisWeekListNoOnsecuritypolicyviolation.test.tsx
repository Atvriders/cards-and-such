import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3317: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onsecuritypolicyviolation` attribute is an event handler content attribute
 * that fires when a Content Security Policy violation is reported for the
 * element. It is only meaningful as a global event handler and, when set as an
 * inline attribute, registers an inline event listener that bypasses CSP's
 * unsafe-inline protections for script execution semantics. A plain
 * presentational <ul> has no legitimate need for an inline CSP-violation
 * handler, and attaching one would both pollute the DOM with executable
 * inline script content and provide a side channel for observing CSP reports
 * scoped to this element. Many sibling attribute absences are already pinned
 * on this ul (cite via W2904, plus id, role, style, tabindex, ARIA, and a
 * range of other event handlers), but no test pins
 * `onsecuritypolicyviolation` absence. Pinning it here ensures any future
 * change that accidentally attaches an inline CSP-violation handler to this
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onsecuritypolicyviolation attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3317: stats-this-week-list ul has no onsecuritypolicyviolation attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsecuritypolicyviolation")).toBe(false);
    expect(ul.getAttribute("onsecuritypolicyviolation")).toBeNull();
  });
});

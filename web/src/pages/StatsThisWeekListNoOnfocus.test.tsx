import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3113: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `onfocus`
 * attribute is an inline event handler that would execute arbitrary JavaScript
 * when the element (or a descendant, via focus bubbling considerations) receives
 * focus. Attaching an inline `onfocus` handler to a presentational <ul> would
 * conflate event wiring with markup, bypass React's synthetic event system,
 * and — more importantly — provide a vector for stored-XSS-style attribute
 * injection if user-controlled data ever leaked into props. The sibling
 * `stats-prev-week` ul already has analogous inline event-handler absences
 * pinned, and many other this-week-list attribute absences are pinned
 * (cite, id, role, style, tabindex, ARIA, etc.), but no test pins `onfocus`
 * absence on `stats-this-week-list`. Pinning it here ensures any future
 * change that accidentally attaches an inline `onfocus` handler to this
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onfocus attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3113: stats-this-week-list ul has no onfocus attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onfocus")).toBe(false);
    expect(ul.getAttribute("onfocus")).toBeNull();
  });
});

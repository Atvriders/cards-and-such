import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onsubmit` event handler attribute is only meaningful on <form> elements,
 * where it fires when the form is submitted. On a <ul> the attribute carries
 * no defined semantics, but leaving it present would still register as an
 * inline event handler in DOM serialization, presenting both a needless
 * attack surface (inline-handler CSP violations, XSS sink) and a misleading
 * signal to future refactors that try to interpret this presentational list
 * as a form. A wide array of other this-week-list attribute absences are
 * already pinned (cite, id, role, style, tabindex, ARIA, etc.), but no test
 * pins `onsubmit` absence on `stats-this-week-list`. Pinning it here ensures
 * any future change that accidentally attaches an inline `onsubmit` handler
 * to this weekly summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onsubmit attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onsubmit attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onsubmit")).toBe(false);
    expect(ul.getAttribute("onsubmit")).toBeNull();
  });
});

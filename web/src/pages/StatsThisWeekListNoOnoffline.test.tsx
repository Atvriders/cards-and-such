import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3290: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `onoffline`
 * attribute is a global event handler attribute defined only on <body> (and
 * conceptually on Window), firing when the browser loses network connectivity.
 * On a <ul> it has no defined semantics, but if it were ever present as an
 * inline HTML attribute it would register a window-level handler from a
 * presentational list element — a surprising side effect for a weekly stats
 * summary. A wide array of other this-week-list attribute absences are already
 * pinned (id, role, style, tabindex, ARIA, cite, and many event handlers), but
 * no test pins `onoffline` absence on `stats-this-week-list`. Pinning it here
 * ensures any future change that accidentally attaches an `onoffline` handler
 * to this presentational weekly summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onoffline attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3290: stats-this-week-list ul has no onoffline attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onoffline")).toBe(false);
    expect(ul.getAttribute("onoffline")).toBeNull();
  });
});

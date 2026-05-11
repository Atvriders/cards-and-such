import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3221: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onpointerenter` attribute, when present, registers an inline event handler
 * that fires when a pointing device enters the element's bounds. On a
 * presentational weekly summary list there is no interaction model that
 * justifies a pointer-enter handler — attaching one would silently introduce
 * hover-driven side effects, complicate keyboard/assistive-tech parity, and
 * expand the surface area for event-handler injection regressions. A wide
 * array of other this-week-list attribute absences are pinned (id, role,
 * style, tabindex, ARIA, cite, etc.), but no test pins `onpointerenter`
 * absence on `stats-this-week-list`. Pinning it here ensures any future
 * change that accidentally attaches an inline pointer-enter handler to this
 * presentational list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpointerenter attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3221: stats-this-week-list ul has no onpointerenter attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerenter")).toBe(false);
    expect(ul.getAttribute("onpointerenter")).toBeNull();
  });
});

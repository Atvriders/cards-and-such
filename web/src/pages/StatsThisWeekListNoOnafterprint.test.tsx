import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3308: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onafterprint` attribute is an event handler content attribute defined only
 * on <body> (per the HTML Living Standard's "Window event handlers" section),
 * where it fires the corresponding event on the Window object after the user
 * agent has finished printing. On a <ul> the attribute has no defined
 * semantics and any handler string set there would not be invoked by the
 * print pipeline, but leaving it present would still be exposed via DOM
 * serialization and could mislead assistive technology, future refactors,
 * or static analyzers that try to interpret it as a real lifecycle hook.
 * A wide array of other this-week-list attribute absences are already pinned
 * (id, role, style, tabindex, ARIA, cite, etc.), but no test pins
 * `onafterprint` absence on `stats-this-week-list`. Pinning it here ensures
 * any future change that accidentally attaches an `onafterprint` handler to
 * this presentational weekly summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onafterprint attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3308: stats-this-week-list ul has no onafterprint attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onafterprint")).toBe(false);
    expect(ul.getAttribute("onafterprint")).toBeNull();
  });
});

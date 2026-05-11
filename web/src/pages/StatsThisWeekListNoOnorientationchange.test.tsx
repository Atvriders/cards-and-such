import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pin: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onorientationchange` attribute is a legacy inline event handler that fires
 * when the device orientation changes; it has no defined meaning on a <ul>
 * element and is deprecated in favor of the `orientationchange` event on
 * `window` (itself superseded by the Screen Orientation API). Leaving such an
 * inline handler attribute on a presentational list would constitute an
 * inline-script attack surface for CSP, could trigger unexpected behavior on
 * mobile rotation, and would mislead future refactors. This test pins that
 * `onorientationchange` is absent from `stats-this-week-list` so any future
 * change that accidentally attaches such a handler is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onorientationchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onorientationchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onorientationchange")).toBe(false);
    expect(ul.getAttribute("onorientationchange")).toBeNull();
  });
});

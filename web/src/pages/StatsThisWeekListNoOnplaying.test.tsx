import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onplaying` attribute is an event handler content attribute defined for
 * media elements (<audio>, <video>) that fires when media playback starts
 * after being paused. On a <ul> it has no defined semantics, but if present
 * it would still be parsed by the browser as an event handler and could
 * execute arbitrary JavaScript - making accidental presence a potential XSS
 * sink. A wide array of other this-week-list attribute absences are already
 * pinned (id, role, style, tabindex, ARIA, cite, etc.), but no test pins
 * `onplaying` absence on `stats-this-week-list`. Pinning it here ensures any
 * future change that accidentally attaches an `onplaying` handler to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onplaying attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onplaying attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onplaying")).toBe(false);
    expect(ul.getAttribute("onplaying")).toBeNull();
  });
});

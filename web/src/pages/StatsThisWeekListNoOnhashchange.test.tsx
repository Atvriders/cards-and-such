import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3275: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain presentational <ul> with className "stats-week-list".
 * The HTML `onhashchange` attribute is an event handler content attribute that
 * is only meaningful on <body> (and <frameset>) elements, where it wires up a
 * handler for the window's `hashchange` event. On a <ul> the attribute has no
 * defined semantics, but if it were present the browser would still register
 * the inline handler string against the element's owner window, leaking script
 * execution surface and inviting confusion with React's synthetic event system.
 * A wide array of other this-week-list event-handler absences are already
 * pinned (onclick, onload, onerror, onmessage, etc.), but no test pins
 * `onhashchange` absence on `stats-this-week-list`. Pinning it here ensures
 * any future change that accidentally attaches an inline `onhashchange`
 * handler to this presentational weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onhashchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3275: stats-this-week-list ul has no onhashchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onhashchange")).toBe(false);
    expect(ul.getAttribute("onhashchange")).toBeNull();
  });
});

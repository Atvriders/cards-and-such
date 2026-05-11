import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onwebkitfullscreenerror` IDL attribute is a WebKit-prefixed event handler
 * for fullscreen API errors; it is only meaningful on elements that may
 * enter fullscreen and dispatch the corresponding error event. On a static
 * presentational <ul> there is no defined semantics for this handler, and
 * leaving it present would silently bind WebKit-specific JS to a list that
 * has no fullscreen affordance. A wide array of other attribute absences
 * are already pinned on this list (id, role, style, tabindex, ARIA, cite,
 * etc.); pinning `onwebkitfullscreenerror` absence here ensures any future
 * change that accidentally attaches such a handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onwebkitfullscreenerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onwebkitfullscreenerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwebkitfullscreenerror")).toBe(false);
    expect(ul.getAttribute("onwebkitfullscreenerror")).toBeNull();
  });
});

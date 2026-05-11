import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3263: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `ontransitionstart` content attribute is an HTML event-handler attribute that
 * fires when a CSS transition begins on the element. On a presentational
 * weekly summary list it carries no defined behavior, but if it were attached
 * it would silently introduce an inline event handler that bypasses React's
 * synthetic event system, dodges our normal listener wiring, and could mask
 * accidental serialization of executable strings into the DOM. A wide array
 * of other this-week-list attribute absences are already pinned (id, role,
 * style, tabindex, ARIA, cite, etc.), but no test pins `ontransitionstart`
 * absence on `stats-this-week-list`. Pinning it here ensures any future
 * change that accidentally attaches an `ontransitionstart` handler to this
 * presentational ul is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ontransitionstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3263: stats-this-week-list ul has no ontransitionstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontransitionstart")).toBe(false);
    expect(ul.getAttribute("ontransitionstart")).toBeNull();
  });
});

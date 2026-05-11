import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3254: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onanimationstart` attribute is an inline event handler that fires when a CSS
 * animation begins on the element. On a presentational weekly summary list it
 * carries no intended behavior, but leaving such an inline handler present
 * would attach executable JavaScript directly to the DOM node, bypassing
 * React's synthetic event system and creating a potential XSS / CSP vector if
 * its value were ever derived from untrusted state. Sibling on*-handler
 * absences (onanimationend, onanimationiteration, onclick, etc.) are pinned
 * across the stats lists, but no test pins `onanimationstart` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an `onanimationstart` inline handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onanimationstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3254: stats-this-week-list ul has no onanimationstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onanimationstart")).toBe(false);
    expect(ul.getAttribute("onanimationstart")).toBeNull();
  });
});

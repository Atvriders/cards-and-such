import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3188: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `ondragstart` attribute is an inline event handler that fires when a user
 * begins dragging the element (or one of its descendants). On a presentational
 * weekly summary list it serves no purpose, and inline event handlers in
 * general bypass React's synthetic event system, sidestep CSP `script-src`
 * controls, and become a vector for XSS when their string payloads are derived
 * from untrusted data. A wide array of other inline DnD/event handler
 * absences are already pinned on neighboring elements, but no test pins
 * `ondragstart` absence on `stats-this-week-list`. Pinning it here ensures any
 * future change that accidentally attaches an inline `ondragstart` handler to
 * this list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ondragstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3188: stats-this-week-list ul has no ondragstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondragstart")).toBe(false);
    expect(ul.getAttribute("ondragstart")).toBeNull();
  });
});

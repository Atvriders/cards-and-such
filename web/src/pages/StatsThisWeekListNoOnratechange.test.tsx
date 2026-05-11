import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onratechange` attribute is an inline event handler that fires when the
 * playback rate of a media element changes; it is only meaningful on <audio>
 * and <video> elements. On a <ul> it would either be silently ignored or, if
 * present as an inline handler string, would register a global event listener
 * that could execute arbitrary JavaScript — a clear injection / XSS hazard for
 * a presentational summary list. A wide array of other this-week-list
 * attribute absences are already pinned (id, role, style, tabindex, ARIA,
 * cite, etc.), but no test pins `onratechange` absence. Pinning it here
 * ensures any future change that accidentally attaches an `onratechange`
 * handler to this weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onratechange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onratechange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onratechange")).toBe(false);
    expect(ul.getAttribute("onratechange")).toBeNull();
  });
});

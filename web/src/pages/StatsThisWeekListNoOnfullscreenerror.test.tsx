import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3251: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onfullscreenerror` attribute is a global event-handler content attribute
 * that fires when an element fails to transition into fullscreen mode. On a
 * presentational weekly summary list there is no fullscreen interaction to
 * report on, and attaching an inline handler via this attribute would both
 * couple presentation to imperative DOM-level scripting and risk silently
 * swallowing genuine fullscreen errors elsewhere in the tree. The sibling
 * `stats-prev-week` ul already has analogous event-handler absences pinned,
 * and a wide array of other this-week-list attribute absences are pinned
 * (id, role, style, tabindex, cite, ARIA, etc.), but no test pins
 * `onfullscreenerror` absence on `stats-this-week-list`. Pinning it here
 * ensures any future change that accidentally attaches an inline
 * `onfullscreenerror` handler to this list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onfullscreenerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3251: stats-this-week-list ul has no onfullscreenerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onfullscreenerror")).toBe(false);
    expect(ul.getAttribute("onfullscreenerror")).toBeNull();
  });
});

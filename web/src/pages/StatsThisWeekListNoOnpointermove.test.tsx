import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3215: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onpointermove` attribute is a pointer event handler attribute that fires
 * repeatedly as a pointer moves over an element. On this presentational
 * weekly-summary list it would serve no purpose and, if set as a string-valued
 * HTML attribute, would either be silently ignored or — worse — interpreted as
 * inline JavaScript by the browser's HTML parser, opening an unnecessary
 * surface for XSS, performance regressions from per-pixel pointer-move
 * handlers, or surprising side effects during refactors. A wide array of other
 * this-week-list attribute absences are pinned (cite, id, role, style,
 * tabindex, ARIA, other pointer events, etc.), but no test pins `onpointermove`
 * absence on `stats-this-week-list`. Pinning it here ensures any future change
 * that accidentally attaches an inline `onpointermove` handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpointermove attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3215: stats-this-week-list ul has no onpointermove attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointermove")).toBe(false);
    expect(ul.getAttribute("onpointermove")).toBeNull();
  });
});

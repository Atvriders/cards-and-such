import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3164: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `oncontextmenu` attribute is an inline event handler for the browser
 * contextmenu event; attaching it as a string attribute to a presentational
 * weekly summary list would inline-script DOM logic against this passive
 * element, contradicting the project's React-handler-only convention and
 * opening avenues for accidental script execution in serialized contexts.
 * The sibling `stats-prev-week` ul already has many event-handler attribute
 * absences pinned, and `stats-this-week-list` has a wide array of other
 * attribute absences pinned (id, role, style, tabindex, ARIA, cite, etc.),
 * but no test pins `oncontextmenu` absence on `stats-this-week-list`. Pinning
 * it here ensures any future change that accidentally attaches an inline
 * `oncontextmenu` handler to this list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — oncontextmenu attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3164: stats-this-week-list ul has no oncontextmenu attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncontextmenu")).toBe(false);
    expect(ul.getAttribute("oncontextmenu")).toBeNull();
  });
});

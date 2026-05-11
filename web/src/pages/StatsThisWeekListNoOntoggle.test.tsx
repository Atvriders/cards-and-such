import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3236: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain <ul> with
 * className "stats-week-list". The HTML `ontoggle` event handler attribute is
 * only meaningful on <details> elements, where it fires when the element's
 * open state changes. On a <ul> the attribute carries no defined semantics,
 * but leaving it present would still be exposed via DOM serialization and —
 * because `on*` attributes register inline event handlers — would represent a
 * script-injection surface even on an element that cannot fire the event. The
 * sibling `stats-prev-week` ul already has its `ontoggle` absence pinned
 * (W3235), and a wide array of other this-week-list attribute absences are
 * pinned (id, role, style, tabindex, cite, ARIA, etc.), but no test pins
 * `ontoggle` absence on `stats-this-week-list`. Pinning it here ensures any
 * future change that accidentally attaches an `ontoggle` handler to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ontoggle attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3236: stats-this-week-list ul has no ontoggle attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontoggle")).toBe(false);
    expect(ul.getAttribute("ontoggle")).toBeNull();
  });
});

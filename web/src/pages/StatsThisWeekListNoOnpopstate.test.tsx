import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3278: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `onpopstate`
 * attribute is a window-level event handler content attribute — when set as an
 * HTML attribute on an arbitrary element it has no defined behavior, but a
 * stringified handler attached to a DOM node still surfaces via serialization
 * and can be evaluated in unexpected contexts (XSS sinks, snapshot diffs,
 * accessibility tooling). The sibling `stats-prev-week` ul already pins a
 * range of window-event-handler absences, and `stats-this-week-list` pins
 * many sibling attributes (cite, id, role, style, tabindex, ARIA, onhashchange,
 * etc.), but no test pins `onpopstate` absence on this ul. Pinning it here
 * ensures any future change that accidentally attaches an `onpopstate` handler
 * to this presentational weekly summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpopstate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3278: stats-this-week-list ul has no onpopstate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpopstate")).toBe(false);
    expect(ul.getAttribute("onpopstate")).toBeNull();
  });
});

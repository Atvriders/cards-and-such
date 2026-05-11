import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3170: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `oninput`
 * attribute is an event-handler content attribute that, when present on any
 * element, registers an inline JavaScript listener that fires whenever the user
 * agent dispatches an `input` event at that element (typically from descendant
 * form controls bubbling up). On a presentational <ul> summarising weekly stats
 * there are no editable descendants and no defined semantics for `oninput`,
 * but leaving such an attribute present would still introduce an inline event
 * handler executed in the page's scripting context — a CSP-violating, XSS-prone
 * footgun. The sibling `stats-prev-week` ul already has its `oninput` absence
 * pinned, and a wide array of other this-week-list attribute absences are
 * pinned (id, role, style, tabindex, ARIA, cite, etc.), but no test pins
 * `oninput` absence on `stats-this-week-list`. Pinning it here ensures any
 * future change that accidentally attaches an inline `oninput` handler to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — oninput attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3170: stats-this-week-list ul has no oninput attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oninput")).toBe(false);
    expect(ul.getAttribute("oninput")).toBeNull();
  });
});

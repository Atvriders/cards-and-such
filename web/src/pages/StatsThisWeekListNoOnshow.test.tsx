import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3239: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `onshow`
 * attribute was historically associated with the <menuitem> element (now removed
 * from the HTML standard) and has no defined semantics on a <ul>. If present, it
 * would still be parsed as an event-handler content attribute by browsers and
 * would expose an inline script execution surface, which is exactly the kind of
 * thing CSP and code review want to keep off presentational summary lists. A
 * broad array of other this-week-list attribute absences are pinned (id, role,
 * style, tabindex, cite, ARIA, etc.), but no test pins `onshow` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an `onshow` handler to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onshow attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3239: stats-this-week-list ul has no onshow attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onshow")).toBe(false);
    expect(ul.getAttribute("onshow")).toBeNull();
  });
});

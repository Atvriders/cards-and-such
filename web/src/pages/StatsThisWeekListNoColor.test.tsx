import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3120: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `color`
 * attribute is a long-deprecated presentational attribute that was historically
 * only meaningful on a handful of elements (e.g. <font>, <hr> in old HTML4) and
 * has no defined semantics on a <ul>. Modern color styling belongs in CSS, not
 * in DOM attributes. Leaving `color` present on this presentational weekly
 * summary list would still be exposed via DOM serialization and could mislead
 * assistive technology, crawlers, or future refactors that try to interpret it
 * as a styling hint. A wide array of other this-week-list attribute absences
 * are pinned (id, role, style, tabindex, cite, ARIA, etc.), but no test pins
 * `color` absence on `stats-this-week-list`. Pinning it here ensures any future
 * change that accidentally attaches a `color` value to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — color attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3120: stats-this-week-list ul has no color attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("color")).toBe(false);
    expect(ul.getAttribute("color")).toBeNull();
  });
});

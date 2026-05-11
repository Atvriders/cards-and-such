import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3075: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `vspace`
 * attribute is an obsolete presentational attribute that was historically valid
 * only on <img>, <object>, and <applet> elements to add vertical whitespace
 * around them. It has no defined meaning on a <ul>, is non-conforming in modern
 * HTML, and is ignored by all current browsers in favor of CSS margin. Even on
 * elements where it was once valid, the HTML Living Standard marks it obsolete.
 * Leaving it present on a presentational weekly summary list would still appear
 * in DOM serialization and could mislead future refactors, validators, or
 * tooling that flags obsolete attributes. The sibling `stats-prev-week` ul has
 * many presentational/obsolete attribute absences pinned, and a wide array of
 * other this-week-list attribute absences are pinned (id, role, style, tabindex,
 * ARIA, cite, etc.), but no test pins `vspace` absence on `stats-this-week-list`.
 * Pinning it here ensures any future change that accidentally attaches a
 * `vspace` value to this list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — vspace attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3075: stats-this-week-list ul has no vspace attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("vspace")).toBe(false);
    expect(ul.getAttribute("vspace")).toBeNull();
  });
});

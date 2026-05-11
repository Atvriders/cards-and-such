import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3066: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `link`
 * attribute is not a defined attribute on <ul> elements — it historically
 * appeared on <body> as a non-standard color hint for unvisited links and has
 * no meaning on a list. Leaving a `link` attribute on this presentational
 * weekly summary ul would still be exposed via DOM serialization and could
 * mislead assistive technology, crawlers, or future refactors that try to
 * interpret it as link metadata. A wide array of other this-week-list
 * attribute absences are pinned (id, role, style, tabindex, ARIA, cite, etc.),
 * but no test pins `link` absence on `stats-this-week-list`. Pinning it here
 * ensures any future change that accidentally attaches a `link` attribute to
 * this list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — link attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3066: stats-this-week-list ul has no link attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("link")).toBe(false);
    expect(ul.getAttribute("link")).toBeNull();
  });
});

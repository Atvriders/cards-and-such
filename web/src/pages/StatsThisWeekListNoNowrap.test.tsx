import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3022: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The legacy HTML
 * `nowrap` attribute was historically used on table cells (<td>, <th>) to
 * suppress automatic line wrapping, and was never defined for <ul> elements.
 * It has been obsolete since HTML4 and removed entirely from the HTML5
 * specification — modern wrapping behavior is controlled exclusively through
 * the CSS `white-space` property. Leaving `nowrap` on a <ul> would have no
 * defined effect, but would still appear in DOM serialization and could
 * mislead future refactors or assistive technology that try to interpret it.
 * A wide array of other this-week-list attribute absences are already pinned
 * (id, role, style, tabindex, ARIA, cite, summary, frame, rules, cellpadding,
 * cellspacing, etc.), but no test pins `nowrap` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches a legacy `nowrap` attribute to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — nowrap attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3022: stats-this-week-list ul has no nowrap attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("nowrap")).toBe(false);
    expect(ul.getAttribute("nowrap")).toBeNull();
  });
});

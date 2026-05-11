import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3042: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `codetype`
 * attribute is a legacy/obsolete HTML attribute that historically appeared on
 * <object> elements to declare the MIME type of code referenced by `classid`.
 * It has no defined meaning on a <ul> element, and leaving it present would
 * still be exposed via DOM serialization and could mislead crawlers, linters,
 * or future refactors that try to interpret it. A wide array of other
 * this-week-list attribute absences are pinned (id, role, style, tabindex,
 * ARIA, cite, etc.), but no test pins `codetype` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches a `codetype` to this presentational weekly summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — codetype attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3042: stats-this-week-list ul has no codetype attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("codetype")).toBe(false);
    expect(ul.getAttribute("codetype")).toBeNull();
  });
});

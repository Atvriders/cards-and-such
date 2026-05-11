import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3004: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `axis`
 * attribute was a deprecated legacy table attribute (only ever defined on <td>
 * and <th> in HTML 4) used to categorize a cell into conceptual row/column
 * groups for accessibility. It has been removed from the HTML specification
 * entirely and carries no defined semantics on a <ul> element. Although browsers
 * will tolerate the attribute, leaving it present would still be exposed via
 * DOM serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as table-cell categorization. Many other
 * attribute absences are already pinned on `stats-this-week-list` (id, role,
 * style, tabindex, cite, ARIA, etc.), but no test pins `axis` absence on this
 * ul. Pinning it here ensures any future change that accidentally attaches an
 * `axis` value to this presentational weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — axis attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3004: stats-this-week-list ul has no axis attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("axis")).toBe(false);
    expect(ul.getAttribute("axis")).toBeNull();
  });
});

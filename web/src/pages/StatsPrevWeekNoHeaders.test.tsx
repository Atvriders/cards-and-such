import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2908: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `headers` attribute is
 * defined for table cell elements (<td> and <th>) and associates a cell with
 * one or more header cells by id. It has no defined meaning on a <ul> and
 * would be silently ignored by browsers and assistive tech, but its presence
 * would falsely imply this list is part of a tabular data structure with
 * column or row headers — when in fact it is a presentational summary list
 * (Prior plays / Prior wins / Prior avg time). Sibling contracts already pin
 * the absence of many ARIA, structural, and link-related attributes on this
 * <ul>, but no existing test pins the absence of `headers`. Pinning this
 * absence prevents a future refactor from accidentally adding a misplaced
 * `headers` attribute that would semantically misrepresent the list as a
 * data-table cell.
 */
describe("StatsPage stats-prev-week ul — headers attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2908: stats-prev-week ul has no headers attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("headers")).toBe(false);
    expect(ul.getAttribute("headers")).toBeNull();
  });
});

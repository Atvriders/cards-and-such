import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2906: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain, static
 * <ul> summarising the three read-only "this week" stats rows
 * (plays / wins / average time). The `headers` HTML attribute is only
 * meaningful on table cell elements (<td> and <th>) where it associates
 * a data cell with one or more header cells via their IDs. Placing a
 * `headers` attribute on a <ul> is invalid HTML, has no rendered effect,
 * and would mislead a future maintainer (or a pattern-matching codemod)
 * into believing the list participates in a tabular header/cell
 * relationship. Sibling pins already cover the absence of many ARIA
 * state attributes, structural attributes, and link-only attributes on
 * this same <ul>, but no existing test pins the absence of a `headers`
 * attribute. Pinning it now ensures a future refactor that accidentally
 * bolts a `headers` attribute onto the list (for example via a misapplied
 * spread of table-cell props) is caught in review.
 */
describe("StatsPage stats-this-week-list ul — headers attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2906: stats-this-week-list ul has no headers attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("headers")).toBe(false);
    expect(ul.getAttribute("headers")).toBeNull();
  });
});

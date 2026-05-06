import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2890: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is rendered as a plain, static
 * <ul> summarising the three read-only "this week" stats rows
 * (plays / wins / average time). It is purely informational and is not
 * a navigable hyperlink — `href` is an HTML attribute exclusively
 * meaningful on <a>, <area>, <link>, and <base> elements. Placing an
 * `href` on a <ul> is invalid HTML, has no rendered effect, and would
 * suggest to a future maintainer (or a pattern-matching codemod) that
 * the list itself is a link target. Sibling pins already cover the
 * absence of many ARIA state attributes and structural attributes on
 * this same <ul>, but no existing test pins the absence of an `href`
 * attribute. Pinning it now ensures a future refactor that accidentally
 * bolts an `href` onto the list (for example via a misapplied spread
 * of anchor props) is caught in review.
 */
describe("StatsPage stats-this-week-list ul — href attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2890: stats-this-week-list ul has no href attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("href")).toBe(false);
    expect(ul.getAttribute("href")).toBeNull();
  });
});

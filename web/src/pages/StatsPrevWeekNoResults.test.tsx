import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3096: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `results` attribute is
 * only defined on <input type="search"> elements (a non-standard WebKit hint
 * for the number of past search queries to display). On a <ul> the attribute
 * carries no defined semantics, but leaving it present would still be exposed
 * via DOM serialization and could mislead assistive technology, crawlers, or
 * future refactors that try to interpret it. Sibling tests already pin the
 * absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad
 * array of ARIA / global attributes on this <ul>, but none pin the absence of
 * `results`. Pinning it here ensures any future change that accidentally
 * attaches a `results` attribute to this presentational summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — results attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3096: stats-prev-week ul has no results attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("results")).toBe(false);
    expect(ul.getAttribute("results")).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3002: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `abbr` attribute is only
 * meaningful on <th> elements inside a table, where it supplies an
 * abbreviated label for the header cell used by assistive technology. On a
 * <ul> the attribute carries no defined semantics, but leaving it present
 * would still be exposed via DOM serialization and could mislead assistive
 * technology, crawlers, or future refactors that try to interpret it as an
 * abbreviation. Sibling tests already pin the absence of `id`, `role`,
 * `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA / global
 * attributes on this <ul>, but none pin the absence of `abbr`. Pinning it
 * here ensures any future change that accidentally attaches an `abbr` value
 * to this presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — abbr attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3002: stats-prev-week ul has no abbr attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("abbr")).toBe(false);
    expect(ul.getAttribute("abbr")).toBeNull();
  });
});

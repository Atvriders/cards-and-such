import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3016: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `rules` attribute is a
 * legacy <table>-only attribute (with values like "none", "groups", "rows",
 * "cols", "all") that controls which interior borders of a table are drawn.
 * It has no defined semantics on a <ul> element and is obsolete even on
 * tables in HTML5 (CSS `border` styles supersede it). Leaving it present on
 * this presentational summary list would still be exposed via DOM
 * serialization and could confuse assistive technology, crawlers, or future
 * refactors that try to interpret it as table-rule metadata. Sibling tests
 * already pin the absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`,
 * and a broad array of ARIA / global attributes on this <ul>, but none pin
 * the absence of `rules`. Pinning it here ensures any future change that
 * accidentally attaches a `rules` value to this list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — rules attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3016: stats-prev-week ul has no rules attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("rules")).toBe(false);
    expect(ul.getAttribute("rules")).toBeNull();
  });
});

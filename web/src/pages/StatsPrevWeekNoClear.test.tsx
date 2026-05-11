import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3030: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `clear` attribute is a
 * deprecated presentational attribute (originally on <br>) used to control
 * float clearing; it has no defined semantics on a <ul> and is obsolete in
 * HTML5 in favor of CSS `clear`. Leaving it present would still serialize
 * into the DOM and could mislead linters, crawlers, or future refactors that
 * try to interpret it. Sibling tests already pin the absence of `id`, `role`,
 * `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA / global
 * attributes on this <ul>, but none pin the absence of `clear`. Pinning it
 * here ensures any future change that accidentally attaches a `clear`
 * attribute to this presentational summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — clear attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3030: stats-prev-week ul has no clear attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("clear")).toBe(false);
    expect(ul.getAttribute("clear")).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3010: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `cellpadding` attribute is
 * a legacy presentational attribute only ever meaningful on <table> elements,
 * where it controlled the space between cell borders and cell content prior to
 * being removed in HTML5 in favor of CSS padding. On a <ul> the attribute has
 * no defined semantics and would not be honored by browsers, but leaving it
 * present would still be exposed via DOM serialization and could confuse
 * assistive technology, snapshot diffs, or future refactors that try to
 * interpret this presentational summary list as table-like markup. Sibling
 * tests already pin the absence of `id`, `role`, `style`, `tabindex`, `is`,
 * `cite`, and a broad array of ARIA / global attributes on this <ul>, but none
 * pin the absence of `cellpadding`. Pinning it here ensures any future change
 * that accidentally attaches a `cellpadding` value to this <ul> is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — cellpadding attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3010: stats-prev-week ul has no cellpadding attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("cellpadding")).toBe(false);
    expect(ul.getAttribute("cellpadding")).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3020: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `nohref` attribute is a
 * deprecated HTML attribute historically associated with <area> elements in
 * image maps to mark areas as having no associated hyperlink. It has no
 * defined semantics on <ul> and is not a valid HTML attribute on list
 * elements. Sibling tests pin the absence of `cite`, `id`, `role`, `style`,
 * `tabindex`, `is`, and many ARIA / global attributes on this <ul>, but none
 * pin the absence of `nohref`. Pinning it here ensures any future change
 * that accidentally attaches `nohref` to this presentational summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — nohref attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3020: stats-prev-week ul has no nohref attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("nohref")).toBe(false);
    expect(ul.getAttribute("nohref")).toBeNull();
  });
});

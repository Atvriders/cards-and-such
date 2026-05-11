import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3006: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `bgcolor` attribute is an
 * obsolete presentational attribute that was historically valid only on
 * <body>, <table>, <td>, <th>, and <tr> elements. It has been removed from
 * the HTML specification and styling should be expressed via CSS instead. On
 * a <ul> the attribute has never carried defined semantics, but if left
 * present it would still be exposed via DOM serialization and could trip up
 * legacy parsers, linters, or downstream tooling that special-cases obsolete
 * presentational attributes. Sibling tests already pin the absence of `id`,
 * `role`, `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA /
 * global attributes on this <ul>, but none pin the absence of `bgcolor`.
 * Pinning it here ensures any future change that accidentally attaches a
 * `bgcolor` value to this presentational summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — bgcolor attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3006: stats-prev-week ul has no bgcolor attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("bgcolor")).toBe(false);
    expect(ul.getAttribute("bgcolor")).toBeNull();
  });
});

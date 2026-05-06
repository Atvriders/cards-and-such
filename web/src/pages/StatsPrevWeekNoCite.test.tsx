import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2902: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `cite` attribute is only
 * meaningful on <blockquote>, <q>, <ins>, and <del> elements, where it points
 * at a URL identifying the source of a quotation or change. On a <ul> the
 * attribute carries no defined semantics, but leaving it present would still
 * be exposed via DOM serialization and could mislead assistive technology,
 * crawlers, or future refactors that try to interpret it as a citation source.
 * Sibling tests already pin the absence of `id`, `role`, `style`, `tabindex`,
 * `is`, and a broad array of ARIA / global attributes on this <ul>, but none
 * pin the absence of `cite`. Pinning it here ensures any future change that
 * accidentally attaches a `cite` URL to this presentational summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — cite attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2902: stats-prev-week ul has no cite attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("cite")).toBe(false);
    expect(ul.getAttribute("cite")).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3114: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `color` attribute is a
 * legacy presentational attribute that was only ever valid on <basefont>,
 * <font>, and <hr> elements, and is obsolete in HTML5. On a <ul> it carries
 * no defined semantics: browsers will not apply it as a foreground color, and
 * leaving it present would still be exposed via DOM serialization and could
 * mislead crawlers, assistive technology, or future refactors that try to
 * interpret it as a styling hint. Sibling tests already pin the absence of
 * `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA
 * / global attributes on this <ul>, but none pin the absence of `color`.
 * Pinning it here ensures any future change that accidentally attaches a
 * `color` value to this presentational summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — color attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3114: stats-prev-week ul has no color attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("color")).toBe(false);
    expect(ul.getAttribute("color")).toBeNull();
  });
});

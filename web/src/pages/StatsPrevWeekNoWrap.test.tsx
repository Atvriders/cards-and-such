import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2954: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `wrap` attribute is only
 * meaningful on <textarea> elements, where it controls how line breaks are
 * encoded in submitted form data ("soft" vs "hard"). On a <ul> the attribute
 * carries no defined semantics, but leaving it present would still be exposed
 * via DOM serialization and could mislead assistive technology, crawlers, or
 * future refactors that try to interpret it as a wrapping hint. Sibling tests
 * already pin the absence of `cite`, `headers`, `id`, `role`, `style`,
 * `tabindex`, `is`, and a broad array of ARIA / global attributes on this
 * <ul>, but none pin the absence of `wrap`. Pinning it here ensures any future
 * change that accidentally attaches a `wrap` value to this presentational
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — wrap attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2954: stats-prev-week ul has no wrap attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("wrap")).toBe(false);
    expect(ul.getAttribute("wrap")).toBeNull();
  });
});

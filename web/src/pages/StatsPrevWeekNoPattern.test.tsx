import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2942: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `pattern` attribute is only
 * meaningful on <input> elements, where it specifies a regular expression the
 * value must match for form validation. On a <ul> the attribute carries no
 * defined semantics, but leaving it present would still be exposed via DOM
 * serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as a validation constraint. Sibling tests
 * already pin the absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`,
 * and a broad array of ARIA / global attributes on this <ul>, but none pin the
 * absence of `pattern`. Pinning it here ensures any future change that
 * accidentally attaches a `pattern` regex to this presentational summary list
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — pattern attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2942: stats-prev-week ul has no pattern attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("pattern")).toBe(false);
    expect(ul.getAttribute("pattern")).toBeNull();
  });
});

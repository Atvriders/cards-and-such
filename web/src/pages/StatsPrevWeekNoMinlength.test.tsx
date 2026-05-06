import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2952: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `minlength` attribute is
 * only meaningful on form controls such as <input> and <textarea>, where it
 * sets the minimum number of characters a user must enter. On a <ul> the
 * attribute carries no defined semantics, but leaving it present would still
 * be exposed via DOM serialization and could confuse assistive technology,
 * crawlers, or future refactors that try to interpret it as a length
 * constraint. Sibling tests already pin the absence of `id`, `role`, `style`,
 * `tabindex`, `is`, `cite`, `maxlength`, and a broad array of ARIA / global
 * attributes on this <ul>, but none pin the absence of `minlength`. Pinning
 * it here ensures any future change that accidentally attaches a `minlength`
 * to this presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — minlength attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2952: stats-prev-week ul has no minlength attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("minlength")).toBe(false);
    expect(ul.getAttribute("minlength")).toBeNull();
  });
});

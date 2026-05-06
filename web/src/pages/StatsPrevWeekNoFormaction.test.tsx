import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2932: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `formaction` attribute is
 * only meaningful on submit-button form controls (<button type="submit"> and
 * <input type="submit"|"image">), where it overrides the parent form's
 * `action` URL for that specific submission. On a presentational <ul> the
 * attribute carries no defined semantics, but leaving it present would still
 * be exposed via DOM serialization and could mislead assistive technology,
 * crawlers, or future refactors that try to interpret it as a form-submission
 * target. Sibling tests already pin the absence of `id`, `role`, `style`,
 * `tabindex`, `cite`, and a broad array of ARIA / global attributes on this
 * <ul>, but none pin the absence of `formaction`. Pinning it here ensures any
 * future change that accidentally attaches a `formaction` URL to this
 * presentational summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — formaction attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2932: stats-prev-week ul has no formaction attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("formaction")).toBe(false);
    expect(ul.getAttribute("formaction")).toBeNull();
  });
});

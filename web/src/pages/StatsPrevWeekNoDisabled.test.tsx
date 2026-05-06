import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2910: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `disabled` attribute is
 * a form-control attribute (valid on form elements such as <button>,
 * <input>, <select>, <textarea>, <option>, <fieldset>) and has no defined
 * meaning on a <ul>. While browsers will not visually or semantically
 * disable a non-form element via `disabled`, adding the attribute would
 * still surface in the DOM, can be queried by CSS selectors
 * (`ul[disabled]`), and could mislead future maintainers or assistive
 * tooling about the intended interactivity of this read-only summary list.
 * Sibling structural contracts already pin the absence of `id`, `role`,
 * `tabindex`, inline `style`, and a wide range of ARIA attributes on this
 * <ul>, but no existing test pins the absence of `disabled`. Pinning this
 * ensures any future refactor that attempts to mark the list as disabled
 * is reviewed deliberately rather than slipping in silently.
 */
describe("StatsPage stats-prev-week ul — disabled attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2910: stats-prev-week ul has no disabled attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("disabled")).toBe(false);
    expect(ul.getAttribute("disabled")).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2796: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is a non-interactive <ul> summarising three read-only stats rows
 * (Prior plays / Prior wins / Prior avg time). It is not a form control,
 * editable widget, grid cell, or other element for which `aria-readonly`
 * has any meaningful semantic. Sibling pins already cover the absence of
 * `id`, `role`, `style`, `tabindex`, `aria-label`, `aria-labelledby`,
 * `aria-describedby`, `aria-controls`, `aria-hidden`, `aria-busy`,
 * `aria-pressed`, and `aria-current`, but no existing test pins the
 * absence of an `aria-readonly` attribute on this <ul>. Adding
 * `aria-readonly` to a plain list would mislead assistive technology by
 * suggesting the element is an editable widget that has been locked,
 * potentially confusing screen-reader users into believing the prior-week
 * stats are a form they cannot modify rather than a static summary.
 * Pinning the absence of `aria-readonly` ensures any future refactor that
 * attempts to bolt editable-widget semantics onto this static summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — aria-readonly attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2796: stats-prev-week ul has no aria-readonly attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-readonly")).toBe(false);
    expect(ul.getAttribute("aria-readonly")).toBeNull();
  });
});

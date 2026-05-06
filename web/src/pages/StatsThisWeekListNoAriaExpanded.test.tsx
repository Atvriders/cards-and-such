import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2790: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is a plain, fully-rendered <ul>
 * summarising the three read-only "this week" stats rows (plays / wins /
 * average time). It is a static summary list — not a disclosure widget,
 * combobox, treeitem, button, listbox, menuitem, or any other element
 * that expands or collapses an associated region of content. Sibling
 * pins already cover the absence of `id`, `role`, `style`, `tabindex`,
 * `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`,
 * `aria-hidden`, `aria-haspopup`, `aria-current`, `aria-pressed`,
 * `aria-selected`, `aria-checked`, `aria-busy`, `aria-modal`,
 * `aria-role-description`, plus the exact class string, ul tag, and
 * child counts — but no existing test pins the absence of an
 * `aria-expanded` attribute on this <ul>. Adding `aria-expanded` here
 * would mislead screen readers into announcing this static summary list
 * as a collapsible disclosure widget that can be toggled open/closed,
 * producing a confusing and incorrect interaction model. Pinning the
 * absence of `aria-expanded` ensures any future refactor that attempts
 * to project a disclosure semantic onto this read-only summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — aria-expanded attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2790: stats-this-week-list ul has no aria-expanded attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-expanded")).toBe(false);
    expect(ul.getAttribute("aria-expanded")).toBeNull();
  });
});

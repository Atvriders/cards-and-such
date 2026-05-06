import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2758: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is a plain, fully-rendered <ul>
 * summarising the three read-only "this week" stats rows (plays / wins /
 * average time). It is a static summary list — not a listbox, tablist,
 * grid, or any other composite widget that supports selectable
 * descendants. Sibling pins already cover the absence of `id`, `role`,
 * `style`, `tabindex`, `aria-label`, `aria-labelledby`, `aria-describedby`,
 * `aria-controls`, `aria-hidden`, `aria-busy`, and
 * `aria-roledescription` on this same <ul>, but no existing test pins
 * the absence of an `aria-selected` attribute. `aria-selected` is only
 * meaningful on widgets such as listbox options, gridcells, tabs, rows,
 * and treeitems; placing it on a plain summary <ul> is a misuse that
 * confuses assistive technology by implying the list itself is a
 * selectable item within some larger selection container. Pinning the
 * absence ensures a future refactor that attempts to bolt on
 * `aria-selected` to this static list is caught in review.
 */
describe("StatsPage stats-this-week-list ul — aria-selected attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2758: stats-this-week-list ul has no aria-selected attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-selected")).toBe(false);
    expect(ul.getAttribute("aria-selected")).toBeNull();
  });
});

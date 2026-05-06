import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2760: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is a non-interactive <ul> summarising three read-only stats rows
 * (Prior plays / Prior wins / Prior avg time). It is not part of a
 * single-selection widget such as a tab, option, gridcell, row, or
 * treeitem, so it must NOT advertise a selected/unselected state via
 * `aria-selected`. Sibling pins already cover the absence of `id`,
 * `role`, `style`, `tabindex`, `aria-label`, `aria-labelledby`,
 * `aria-describedby`, `aria-controls`, `aria-hidden`, `aria-busy`, and
 * `aria-pressed`, but no existing test pins the absence of an
 * `aria-selected` attribute on this <ul>. Adding `aria-selected` would
 * misleadingly signal to assistive technology that the list is a
 * selectable widget with selection state, causing screen readers to
 * announce a confusing "selected/not selected" state for a static
 * summary list. Pinning the absence of `aria-selected` ensures any
 * future refactor that attempts to mark this static list with
 * selection semantics is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — aria-selected attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2760: stats-prev-week ul has no aria-selected attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-selected")).toBe(false);
    expect(ul.getAttribute("aria-selected")).toBeNull();
  });
});

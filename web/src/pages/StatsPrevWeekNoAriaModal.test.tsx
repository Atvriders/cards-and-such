import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2778: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev" and contains three read-only
 * summary rows. It is a static summary block — it is NOT a modal dialog
 * and carries no dialog/alertdialog semantics. Sibling pins already cover
 * the absence of `id`, `role`, `style`, `tabindex`, `aria-label`,
 * `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-hidden`,
 * `aria-haspopup`, `aria-pressed`, `aria-current`, `aria-busy`,
 * `aria-selected`, and `aria-roledescription`, plus the exact class string
 * and child counts. No existing test pins the absence of an `aria-modal`
 * attribute on this <ul>. Adding `aria-modal` (with any value) would
 * incorrectly assert that this static summary list traps focus and behaves
 * as a modal surface, confusing assistive technology — screen readers may
 * announce it as a modal region or otherwise alter the focus behavior of
 * surrounding content. Pinning the absence of `aria-modal` ensures any
 * future refactor that attempts to apply modal semantics to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — aria-modal attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2778: stats-prev-week ul has no aria-modal attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-modal")).toBe(false);
    expect(ul.getAttribute("aria-modal")).toBeNull();
  });
});

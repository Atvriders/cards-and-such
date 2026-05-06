import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2766: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is a non-interactive <ul> summarising three read-only stats rows
 * (Prior plays / Prior wins / Prior avg time). It does NOT open a popup,
 * menu, listbox, tree, grid, or dialog, and it has no associated
 * disclosure widget. Sibling pins already cover the absence of `id`,
 * `role`, `style`, `tabindex`, `aria-label`, `aria-labelledby`,
 * `aria-describedby`, `aria-controls`, `aria-hidden`, `aria-busy`,
 * `aria-pressed`, `aria-selected`, and `aria-role-description`, but no
 * existing test pins the absence of an `aria-haspopup` attribute on this
 * <ul>. Adding `aria-haspopup` would misleadingly signal to assistive
 * technology that activating this static list reveals a popup/menu, which
 * would cause screen readers to announce an interaction affordance the
 * UI does not actually provide. Pinning the absence of `aria-haspopup`
 * ensures any future refactor that accidentally marks this static
 * summary list as a popup trigger is caught at test time rather than
 * confusing AT users in production.
 */
describe("StatsPage stats-prev-week ul — aria-haspopup attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2766: stats-prev-week ul has no aria-haspopup attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-haspopup")).toBe(false);
    expect(ul.getAttribute("aria-haspopup")).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2768: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is a non-interactive <ul>
 * summarising three read-only stats rows (Plays / Wins / Avg time) for
 * the current week. It does NOT open a popup, menu, listbox, tree,
 * grid, or dialog, and it has no associated disclosure widget. Sibling
 * pins already cover the absence of `id`, `role`, `style`, `tabindex`,
 * `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`,
 * and `aria-hidden`, but no existing test pins the absence of an
 * `aria-haspopup` attribute on this <ul>. Adding `aria-haspopup` would
 * misleadingly signal to assistive technology that activating this
 * static list reveals a popup/menu, causing screen readers to announce
 * an interaction affordance the UI does not actually provide. Pinning
 * the absence of `aria-haspopup` ensures any future refactor that
 * accidentally marks this static summary list as a popup trigger (or
 * copies the attribute over from a sibling disclosure pattern) is
 * caught at test time rather than confusing AT users in production.
 */
describe("StatsPage stats-this-week-list ul — aria-haspopup attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2768: stats-this-week-list ul has no aria-haspopup attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-haspopup")).toBe(false);
    expect(ul.getAttribute("aria-haspopup")).toBeNull();
  });
});

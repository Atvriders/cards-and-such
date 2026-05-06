import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2784: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is a non-interactive <ul> summarising three read-only stats rows
 * (Prior plays / Prior wins / Prior avg time). It is not a checkable
 * widget such as a checkbox, menuitemcheckbox, radio, option, treeitem,
 * or switch, so it must NOT advertise a checked/unchecked state via
 * `aria-checked`. Sibling pins already cover the absence of `id`,
 * `role`, `style`, `tabindex`, `aria-label`, `aria-labelledby`,
 * `aria-describedby`, `aria-controls`, `aria-hidden`, `aria-busy`,
 * `aria-pressed`, and `aria-selected`, but no existing test pins the
 * absence of an `aria-checked` attribute on this <ul>. Adding
 * `aria-checked` would misleadingly signal to assistive technology that
 * the list is a tri-state checkable widget, causing screen readers to
 * announce a confusing "checked/unchecked/mixed" state for a static
 * summary list. Pinning the absence of `aria-checked` ensures any
 * future refactor that attempts to mark this static list with checkable
 * semantics is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — aria-checked attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2784: stats-prev-week ul has no aria-checked attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-checked")).toBe(false);
    expect(ul.getAttribute("aria-checked")).toBeNull();
  });
});

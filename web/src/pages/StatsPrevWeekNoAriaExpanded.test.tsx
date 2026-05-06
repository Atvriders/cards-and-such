import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2788: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain, non-interactive <ul> summarising the previous
 * week's plays, wins, and average time. It is not a disclosure widget,
 * combobox, treeitem, or any other expandable control — it has no hidden
 * sub-region whose visibility it gates. Sibling pins already cover the
 * absence of `id`, `role`, `style`, `tabindex`, `aria-label`,
 * `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-hidden`,
 * `aria-haspopup`, `aria-current`, `aria-pressed`, `aria-selected`,
 * `aria-checked`, `aria-busy`, `aria-modal`, `aria-role-description`, plus
 * the exact class string and child counts, but no existing test pins the
 * absence of an `aria-expanded` attribute on this <ul>. Adding
 * `aria-expanded` would mislead screen readers into announcing the static
 * summary list as a collapsible widget that can be toggled, producing a
 * confusing and incorrect interaction model. Pinning the absence of
 * `aria-expanded` ensures any future refactor that attempts to project a
 * disclosure semantic onto this read-only summary is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — aria-expanded attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2788: stats-prev-week ul has no aria-expanded attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-expanded")).toBe(false);
    expect(ul.getAttribute("aria-expanded")).toBeNull();
  });
});

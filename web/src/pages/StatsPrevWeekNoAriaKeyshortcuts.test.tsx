import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2803: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is a static, non-interactive <ul> summarising three read-only baseline
 * metrics (Prior plays / Prior wins / Prior avg time). It is not a focusable
 * widget, does not handle keystrokes, and exposes no keyboard activation
 * affordance. Sibling pins already cover the absence of `id`, `role`,
 * `style`, `tabindex`, `aria-label`, `aria-labelledby`, `aria-describedby`,
 * `aria-controls`, `aria-hidden`, `aria-busy`, `aria-pressed`,
 * `aria-expanded`, `aria-haspopup`, `aria-current`, `aria-checked`,
 * `aria-selected`, `aria-readonly`, `aria-modal`, `aria-role-description`,
 * and `dir`/`hidden`/`spellcheck` — but no existing test pins the absence
 * of an `aria-keyshortcuts` attribute on this <ul>. Adding
 * `aria-keyshortcuts` would falsely advertise to assistive tech that this
 * static summary list responds to a keyboard shortcut, prompting screen
 * readers to announce a non-existent hotkey. Pinning the absence of
 * `aria-keyshortcuts` ensures any future refactor that incorrectly attaches
 * a keyboard-shortcut hint to this passive list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — aria-keyshortcuts attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2803: stats-prev-week ul has no aria-keyshortcuts attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-keyshortcuts")).toBe(false);
    expect(ul.getAttribute("aria-keyshortcuts")).toBeNull();
  });
});

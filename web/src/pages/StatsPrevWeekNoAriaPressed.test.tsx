import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2753: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is a non-interactive <ul> summarising three read-only stats rows
 * (Prior plays / Prior wins / Prior avg time). It is not a toggle button,
 * does not implement a pressed/unpressed state, and the user cannot activate
 * it. Sibling pins already cover the absence of `id`, `role`, `style`,
 * `tabindex`, `aria-label`, `aria-labelledby`, `aria-describedby`,
 * `aria-controls`, `aria-hidden`, and `aria-busy`, but no existing test
 * pins the absence of an `aria-pressed` attribute on this <ul>. Adding
 * `aria-pressed` would misleadingly signal to assistive technology that the
 * list is a toggle button with two states, causing screen readers to
 * announce a confusing "pressed/not pressed" state for a static summary
 * list. Pinning the absence of `aria-pressed` ensures any future refactor
 * that attempts to mark this static list with a toggle-button semantic is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — aria-pressed attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2753: stats-prev-week ul has no aria-pressed attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-pressed")).toBe(false);
    expect(ul.getAttribute("aria-pressed")).toBeNull();
  });
});

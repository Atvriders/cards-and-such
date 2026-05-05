import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2172: StatsPage renders chart-export buttons (.stats-export-btn) on each
 * exportable card. The visual presentation of these buttons is governed
 * entirely by the .stats-export-btn class in CSS — they intentionally do
 * NOT carry an inline `style` attribute. Inline styles would override the
 * stylesheet's hover/focus/dark-mode rules and bypass the design system.
 *
 * Existing tests pin the buttons' classNames, data-testids, aria-labels,
 * type, title, SVG markup and absence of an `id` attribute, but none pin
 * the absence of an inline `style` attribute. A refactor that adds an
 * inline `style={{ ... }}` to the shared button JSX would silently break
 * theme integration without failing any current assertion. Pin
 * `hasAttribute("style")` to false so any future style injection is
 * caught immediately.
 */
describe("StatsPage .stats-export-btn — no inline style", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2172: stats-export-line button lacks an inline style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-export-line");
    expect(btn.classList.contains("stats-export-btn")).toBe(true);
    expect(btn.hasAttribute("style")).toBe(false);
  });
});

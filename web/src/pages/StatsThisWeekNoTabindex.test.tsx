import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2261: StatsPage's "This week" stats card (data-testid="stats-this-week")
 * is rendered as a plain <div> with className "stats-card stats-card--week"
 * and is NOT a focusable element. It contains no interactive controls of
 * its own — the card itself is purely a layout/grouping wrapper around the
 * "This week" heading, the week vs prior-week list, and the inner
 * stats-prev-week breakdown. Sibling absence contracts are already pinned
 * for `id` (W2024) and inline `style` (W2140) on this card, but no
 * existing test pins the absence of a `tabindex` attribute. Adding a
 * `tabindex` (whether 0 to insert the card into the tab order, or -1 to
 * make it programmatically focusable) would change the page's keyboard
 * navigation contract: keyboard users would land on a non-interactive
 * div with no associated action, which is a known accessibility
 * anti-pattern. Pinning the absence of `tabindex` ensures any future
 * refactor that tries to make the card focusable is reviewed
 * deliberately rather than slipping in silently.
 */
describe("StatsPage stats-this-week card — tabindex attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2261: stats-this-week card has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    expect(card.hasAttribute("tabindex")).toBe(false);
    expect(card.getAttribute("tabindex")).toBeNull();
  });
});

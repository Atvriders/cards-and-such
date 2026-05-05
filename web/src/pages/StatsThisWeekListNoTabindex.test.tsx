import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2268: StatsPage's this-week <ul data-testid="stats-this-week-list"> is a
 * presentational list grouping the Plays/Wins/Avg rows for the current week
 * versus the prior week. The <ul> contains only static <li> rows with
 * <span>/<em> children — there is nothing for a keyboard user to interact
 * with at the list level. Adding a `tabindex` (0 to splice the list itself
 * into the tab order, or -1 to make it programmatically focusable) would
 * change the keyboard contract of the page: tab focus would land on a
 * non-interactive <ul> with no associated action, which is the same
 * accessibility anti-pattern that W2261 pins for the surrounding
 * stats-this-week card.
 *
 * Existing this-week-list tests pin tagName (W1605), classes (W1361/W1391),
 * absence of `id` (W1986), absence of inline `style` (W1779), absence of
 * `role` (W1816), and per-row structure — but none lock the absence of a
 * `tabindex` attribute on the <ul> itself. A regression that introduces
 * tabindex="0" or tabindex="-1" on this list would silently pass every
 * current assertion while quietly altering the page's keyboard navigation.
 */
describe("StatsPage stats-this-week — this-week list tabindex attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2268: stats-this-week-list <ul> has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // No tabindex — the list is presentational and not part of the tab order.
    expect(list.hasAttribute("tabindex")).toBe(false);
    expect(list.getAttribute("tabindex")).toBeNull();
  });
});

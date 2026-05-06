import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2751: StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list") is a fully-rendered, always-visible
 * <ul> with className "stats-week-list" summarising the three current-week
 * read-only stats rows (Plays / Wins / Avg time). It is part of the static
 * "this week" stats card and must remain visible to every user at all
 * times — there is no toggle, collapsible behaviour, or progressive
 * disclosure attached to this list. Sibling pins already cover the <ul>
 * tagName (W1318), the exact className (W1361/W1768), the absence of
 * `id` (W1986), `role` (W1816), inline `style` (W2118), `tabindex`
 * (W2268), `aria-label` (W2468), `aria-labelledby`, `aria-describedby`,
 * `aria-controls`, `aria-busy`, `aria-role-description`, `aria-hidden`
 * (W2648), `dir`, and `spellcheck`, but no existing test pins the absence
 * of the HTML `hidden` boolean attribute on this <ul>. Adding `hidden`
 * would completely remove the list from the accessibility tree and the
 * visual layout (browsers apply `display: none`), silently breaking the
 * current-week summary for every user. The matching prev-week list
 * already has its `hidden` absence pinned via W2745; pinning the
 * THIS-week list mirrors that contract and ensures any future refactor
 * that attempts to conditionally hide this list via the boolean
 * attribute is caught and reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — hidden attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2751: stats-this-week-list <ul> has no hidden attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    expect(list.tagName).toBe("UL");
    expect(list.hasAttribute("hidden")).toBe(false);
    expect(list.getAttribute("hidden")).toBeNull();
  });
});

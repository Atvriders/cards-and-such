import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1986: StatsPage's this-week <ul data-testid="stats-this-week-list">
 * intentionally exposes no explicit `id` attribute. The list is located
 * via its data-testid (and via class for styling), never via document.getElementById
 * or a CSS #id selector. Adding an `id` would create a global identifier
 * that risks collision with user-authored markup, would be tempting target
 * for label[for=...] / aria-labelledby coupling that does not match the
 * card's existing aria pattern, and would diverge from every sibling
 * stats-week ul (the prev-week list also has no id).
 *
 * Existing this-week tests pin tagName (W1605), modifier class (W1361/W1391),
 * the absence of role attribute (W1816), child count (W1646), and per-row
 * structure, but none lock the absence of an `id`. A regression that
 * adds id="stats-this-week-list" or any other identifier would silently
 * pass every current assertion while inviting fragile external coupling.
 */
describe("StatsPage stats-this-week — this-week list id attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1986: stats-this-week-list <ul> has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // No id — the list is selectable via data-testid only.
    expect(list.hasAttribute("id")).toBe(false);
    expect(list.getAttribute("id")).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2867: StatsPage's this-week <ul data-testid="stats-this-week-list">
 * intentionally exposes no `itemscope` Microdata attribute. The list is a
 * pure presentational summary of the player's current weekly activity; it
 * is not the root of any schema.org item graph and must not introduce a
 * Microdata scope. Adding `itemscope` would silently turn the <ul> into a
 * Microdata item root, causing structured-data parsers (Google Rich
 * Results, Schema.org validators, social-card crawlers) to extract weekly
 * gameplay numbers and attach them as a typed item — leaking presentational
 * data into the structured-web graph and inviting downstream `itemtype` /
 * `itemprop` regressions.
 *
 * Existing this-week list tests pin tagName (W1605), exact className
 * (W1361/W1391), absence of `id` (W1986), absence of `role` (W1816),
 * absence of every aria-* / global HTML attribute (W1816 family), and the
 * absence of `itemprop` (W2863) — but none lock the absence of `itemscope`
 * itself. A regression that adds `itemscope` would pass every current
 * assertion while opening a Microdata scope on a presentational list.
 */
describe("StatsPage stats-this-week — this-week list itemscope attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2867: stats-this-week-list <ul> has no itemscope attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // No itemscope — the list is purely presentational, not a Microdata root.
    expect(list.hasAttribute("itemscope")).toBe(false);
    expect(list.getAttribute("itemscope")).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2863: StatsPage's this-week <ul data-testid="stats-this-week-list">
 * intentionally exposes no `itemprop` microdata attribute. The list is a
 * pure presentational summary of the player's current weekly activity; it
 * is not part of any schema.org item-scope graph and is never crawled,
 * indexed, or extracted by structured-data consumers. Adding `itemprop`
 * would silently opt the element into Microdata semantics, leak weekly
 * gameplay statistics into Google Rich Results / Search Console, and
 * encourage downstream code to attach `itemscope` / `itemtype` ancestors
 * that do not match the card's plain-card visual contract.
 *
 * Existing this-week list tests pin the tagName (W1605), exact className
 * (W1361/W1391), absence of `id` (W1986), absence of `role` (W1816),
 * absence of every aria-* / global HTML attribute (W1816 family), child
 * counts (W1646), and per-row structure — but none lock the absence of
 * Microdata's `itemprop`. A regression that adds `itemprop="weekStats"`
 * or similar would pass every current assertion while introducing
 * unintended structured-data exposure.
 */
describe("StatsPage stats-this-week — this-week list itemprop attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2863: stats-this-week-list <ul> has no itemprop attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // No itemprop — the list is purely presentational, not Microdata.
    expect(list.hasAttribute("itemprop")).toBe(false);
    expect(list.getAttribute("itemprop")).toBeNull();
  });
});

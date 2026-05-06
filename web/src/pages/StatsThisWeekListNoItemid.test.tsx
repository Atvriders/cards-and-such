import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2879: StatsPage's this-week <ul data-testid="stats-this-week-list">
 * intentionally exposes no `itemid` microdata attribute. The list is a
 * pure presentational summary of the player's current weekly activity; it
 * is not part of any schema.org item-scope graph and has no globally
 * resolvable URI identity. Adding `itemid` would silently opt the element
 * into Microdata semantics, falsely advertise a stable URI for ephemeral
 * weekly stats, and confuse structured-data consumers (Google Rich
 * Results, Search Console, generic crawlers) that expect `itemid` only
 * on `itemscope` elements with stable, dereferenceable identifiers.
 *
 * Sibling tests pin the tagName (W1605), className (W1361/W1391), and
 * absence of `id`, `role`, `itemprop` (W2863), `itemscope`, `itemtype`,
 * and the full aria-* / global HTML attribute family — but none lock the
 * absence of Microdata's `itemid`. A regression that adds
 * `itemid="urn:cards:weekStats"` or similar would pass every existing
 * assertion while leaking a fake stable identity for transient data.
 */
describe("StatsPage stats-this-week — this-week list itemid attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2879: stats-this-week-list <ul> has no itemid attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // No itemid — the list has no globally resolvable Microdata URI.
    expect(list.hasAttribute("itemid")).toBe(false);
    expect(list.getAttribute("itemid")).toBeNull();
  });
});

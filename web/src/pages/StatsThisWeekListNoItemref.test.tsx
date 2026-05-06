import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2877: StatsPage's this-week <ul data-testid="stats-this-week-list">
 * intentionally exposes no `itemref` Microdata attribute. The list is a
 * pure presentational summary of the player's current weekly activity; it
 * is not part of any schema.org item graph and must not stitch additional
 * properties (by id) into a Microdata item via `itemref`. Adding `itemref`
 * would silently associate unrelated DOM nodes with this list under a
 * Microdata vocabulary, causing structured-data parsers (Google Rich
 * Results, Schema.org validators, social-card crawlers) to merge those
 * referenced elements into the weekly summary's property bag — leaking
 * presentational data into the structured-web graph.
 *
 * Existing this-week list tests pin tagName (W1605), exact className
 * (W1361/W1391), absence of `id` (W1986), absence of `role` (W1816),
 * absence of every aria-* / global HTML attribute (W1816 family), absence
 * of `itemprop` (W2863), absence of `itemscope` (W2867), and absence of
 * `itemtype` (W2871) — but none lock the absence of `itemref` itself. A
 * regression that adds an `itemref` token list would pass every current
 * assertion while attaching unrelated nodes as Microdata properties of
 * this presentational list.
 */
describe("StatsPage stats-this-week — this-week list itemref attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2877: stats-this-week-list <ul> has no itemref attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // No itemref — the list is purely presentational, not a Microdata item
    // that aggregates remote properties by id reference.
    expect(list.hasAttribute("itemref")).toBe(false);
    expect(list.getAttribute("itemref")).toBeNull();
  });
});

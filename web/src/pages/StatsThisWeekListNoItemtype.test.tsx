import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2871: StatsPage's this-week <ul data-testid="stats-this-week-list">
 * intentionally exposes no `itemtype` Microdata attribute. The list is a
 * pure presentational summary of the player's current weekly activity; it
 * is not the root of any schema.org item graph and must not declare a
 * Microdata type vocabulary. Adding `itemtype` would silently brand the
 * <ul> as a typed Microdata item, causing structured-data parsers (Google
 * Rich Results, Schema.org validators, social-card crawlers) to extract
 * weekly gameplay numbers and attach them under the declared vocabulary —
 * leaking presentational data into the structured-web graph.
 *
 * Existing this-week list tests pin tagName (W1605), exact className
 * (W1361/W1391), absence of `id` (W1986), absence of `role` (W1816),
 * absence of every aria-* / global HTML attribute (W1816 family), absence
 * of `itemprop` (W2863), and absence of `itemscope` (W2867) — but none
 * lock the absence of `itemtype` itself. A regression that adds an
 * `itemtype` URL would pass every current assertion while declaring a
 * structured-data type on a presentational list.
 */
describe("StatsPage stats-this-week — this-week list itemtype attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2871: stats-this-week-list <ul> has no itemtype attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // No itemtype — the list is purely presentational, not a typed Microdata item.
    expect(list.hasAttribute("itemtype")).toBe(false);
    expect(list.getAttribute("itemtype")).toBeNull();
  });
});

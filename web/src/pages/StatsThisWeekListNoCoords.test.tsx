import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2895: StatsPage's this-week <ul data-testid="stats-this-week-list">
 * intentionally exposes no `coords` attribute. `coords` is a legacy HTML
 * attribute valid only on <area> elements inside an image map; placing it
 * on a <ul> is a non-conforming attribute that browsers silently retain
 * in the DOM but never act on. The this-week list is a plain presentational
 * <ul> summarizing the player's current weekly activity — it is not an
 * image-map area, has no associated <map>, and never participates in any
 * client-side region-targeting interaction.
 *
 * Existing this-week list tests pin the tagName (W1605), exact className
 * (W1361/W1391), absence of `id` (W1986), absence of `role` (W1816),
 * absence of every aria-* attribute (W1816 family), absence of microdata
 * `itemprop` (W2863), absence of `hidden` (W2751), absence of `style`
 * (W2118), absence of anchor-only attributes like `href`/`target`/`rev`,
 * and child counts — but none lock the absence of the legacy image-map
 * `coords` attribute. A regression that adds `coords="0,0,100,100"` would
 * pass every current assertion while introducing a non-conforming HTML
 * attribute that fails strict validators and confuses assistive tech that
 * heuristically inspects unknown attributes.
 */
describe("StatsPage stats-this-week — this-week list coords attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2895: stats-this-week-list <ul> has no coords attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // No coords — `coords` is valid only on <area>, never on <ul>.
    expect(list.hasAttribute("coords")).toBe(false);
    expect(list.getAttribute("coords")).toBeNull();
  });
});

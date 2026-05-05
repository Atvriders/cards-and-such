import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2128: StatsPage's "Top played" categories stats card
 * (data-testid="stats-categories"), which wraps the bar-chart panel and
 * its drill-down details, is currently rendered WITHOUT an inline
 * `style` attribute. Sibling tests pin adjacent contracts on this same
 * node:
 *   - StatsCategoriesCardClass (W1936) pins exact className equality
 *     ("stats-card stats-card--exportable").
 *   - StatsCategoriesCardNoId (W2027) pins absence of `id`.
 *   - StatsCategoriesTitleClass pins the nested h2 typography.
 *   - StatsSectionTopPlayedH2Parent (W1460) pins the "Top played" h2 as
 *     a direct child of this same .stats-card div.
 * However, no existing test pins the absence of an inline `style`
 * attribute on the stats-categories card element itself. Adding inline
 * styles would bypass the `.stats-card` / `.stats-card--exportable`
 * class hooks and CSS variable theming (e.g. `--accent`, dark/light
 * surface tokens) that the rest of the StatsPage cards rely on, leading
 * to specificity wars and broken theme overrides. The current design
 * routes all visual styling through stylesheet rules keyed off the
 * card's classes, keeping the DOM free of presentation. Mirrors
 * LobbyChipStripNoStyle and similar no-style pins. Pin the absence of
 * a `style` attribute so any future inline-style addition is reviewed
 * deliberately.
 */
describe("StatsPage stats-categories card — style attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2128: stats-categories card has no inline style attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-categories");
    expect(card.hasAttribute("style")).toBe(false);
  });
});

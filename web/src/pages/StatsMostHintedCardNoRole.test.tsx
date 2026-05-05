import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2360: StatsPage's "Most-hinted games" card
 * (`<div className="stats-card" data-testid="stats-most-hinted">`) is rendered
 * as a plain styling/layout container with no explicit ARIA `role` attribute
 * — the implicit generic-div semantic is the correct contract because the
 * card is neither a landmark, a region, a group, nor a list root. The list
 * semantics live on the inner `<ul.stats-most-hinted-list>` (W2190 pins its
 * tag and inline-style absence), and the heading semantics live on the
 * nested `<h2>Most-hinted games</h2>` (W1488 pins its parent testid). The
 * outer card wrapper itself is a structural shell.
 *
 * Existing pins on this exact element already cover:
 *   - exact className string `"stats-card"` and tagName=DIV (W1631,
 *     StatsMostHintedWrapClass)
 *   - id-attribute absence (W2028, StatsMostHintedCardNoId)
 *   - style-attribute absence (W2131, StatsMostHintedCardNoStyle)
 *   - tabindex-attribute absence (W2259, StatsMostHintedNoTabindex)
 *
 * What none of those cover is the absence of an explicit `role` attribute.
 * Adding `role="region"`, `role="group"`, or `role="list"` would silently
 * change how assistive tech announces the card AND make the card
 * discoverable via `getByRole("region" | "group" | "list")` in a way that
 * downstream tests (or third-party a11y tooling) could begin to couple to.
 * It would also conflict with the inner <ul>'s implicit `list` role if
 * `role="list"` were applied here. Pin the absence so any future change
 * that adds an explicit role to the most-hinted card div is reviewed
 * deliberately. Mirrors W2345 (stats-this-week card no-role) and the
 * broader no-role contracts on sibling stats cards
 * (StatsAchievementsCardNoRole, StatsActivityNoRole,
 * StatsRecordsByCatCardNoStyle's neighborhood, etc.).
 */
describe("StatsPage stats-most-hinted card — role attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2360: stats-most-hinted card has no explicit role attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    expect(card.hasAttribute("role")).toBe(false);
    expect(card.getAttribute("role")).toBeNull();
  });
});

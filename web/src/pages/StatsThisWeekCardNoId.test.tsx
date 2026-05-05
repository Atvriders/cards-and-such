import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2024: StatsPage's "This week" stats card (data-testid="stats-this-week"),
 * which wraps the current-vs-prior-7-day comparison list and the inner
 * stats-prev-week breakdown, is currently rendered WITHOUT an `id`
 * attribute. Sibling absence-of-id contracts are already pinned for the
 * stats-activity card (W2000), the stats-personal-records card, and for
 * the inner this-week and prev-week <ul> lists (W1986 / sibling W-id),
 * but no existing test pins the absence of an `id` on the stats-this-week
 * card element itself. Many tests locate this node via
 * `screen.getByTestId("stats-this-week")` and then drill into descendants
 * (week list, prev-week list, h2 title, delta spans), yet none assert
 * that the card has no DOM `id`. Adding an `id` would create a stable
 * in-page anchor / fragment target / aria-labelledby handle that
 * downstream code could silently couple to, making later removal a
 * hidden breaking change and diverging from the sibling cards which all
 * route addressing through `data-testid` (for tests) and class hooks
 * (for styling). Pin the absence of an `id` so any future change that
 * adds one is reviewed deliberately.
 */
describe("StatsPage stats-this-week card — id attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2024: stats-this-week card has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    expect(card.hasAttribute("id")).toBe(false);
    expect(card.getAttribute("id")).toBeNull();
  });
});

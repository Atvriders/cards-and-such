import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2345: StatsPage's "This week" stats card (data-testid="stats-this-week")
 * is rendered as a plain <div className="stats-card stats-card--week"> with
 * no explicit ARIA `role` attribute — the implicit generic-div semantic is
 * the correct contract because the card is a styling/layout container, not
 * a landmark, region, group, or list. Sibling absence-of-role contracts
 * exist for the stats-this-week-list <ul> (W1816) and several other inner
 * elements, and absence-of-id (W2024), absence-of-style (W-style),
 * absence-of-tabindex (W-tabindex), and exact className (W1612) are already
 * pinned on the card element itself, but NO existing test pins the absence
 * of an explicit `role` attribute on the stats-this-week card div. Adding
 * `role="region"` or `role="group"` would silently change how assistive
 * tech announces the card and would also make the card discoverable via
 * getByRole("region") / getByRole("group") in a way that downstream tests
 * could couple to. Pin the absence so any future change that adds an
 * explicit role is reviewed deliberately. Mirrors W1816 (this-week list
 * no-role) and the broader no-role contracts on sibling cards.
 */
describe("StatsPage stats-this-week card — role attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2345: stats-this-week card has no explicit role attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    expect(card.hasAttribute("role")).toBe(false);
    expect(card.getAttribute("role")).toBeNull();
  });
});

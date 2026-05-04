import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1305: The "Records" stats card (data-testid `stats-records`) houses the
 * time-spent pie chart. When `topGamesPie` is empty (no perGame data) the
 * card swaps the <PieChart> for a `stats-empty` placeholder reading
 * "No games played yet." Existing coverage pins the matching empty-state
 * copy on the sibling Top-played BAR card (W1159) and on the personal
 * records list (W1145), but no test pins the PIE-chart empty-state's
 * element tagName (<p>) — the canonical paragraph element that the
 * `.stats-empty` CSS hook expects. A regression that swaps the <p> for a
 * <div>/<span> would silently break the StatsPage's typographic rhythm
 * (line-height, margin, color) without tripping the className assertion
 * the bar-chart W1159 test relies on.
 */
describe("StatsPage — pie chart empty-state tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1305: stats-records renders the 'No games played yet.' empty state inside a <p> with class stats-empty when topGamesPie is empty", () => {
    // No stats blob seeded → totals are 0, perGame is {} → topGamesPie === []
    // → the empty branch renders.
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-records");
    const empty = within(card).getByText("No games played yet.");
    // Tag pin: the placeholder must be a paragraph (<p>) — the element the
    // `.stats-empty` rule was authored against. Sibling bar-chart test
    // W1159 only pins the className; this complements it on the pie side.
    expect(empty.tagName).toBe("P");
    expect(empty.className).toBe("stats-empty");
    // The pie chart itself must be absent in the empty branch — the two
    // halves of the card are mutually exclusive.
    expect(within(card).queryByTestId("stats-pie-chart")).toBeNull();
  });
});

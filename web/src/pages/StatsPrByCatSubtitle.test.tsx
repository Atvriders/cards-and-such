import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1296: The "Personal records by category" stats card (data-testid
 * `stats-personal-records-by-category`) renders a chart-label subtitle
 * "Your best time in each category" between its <h2> heading and the
 * per-category list. This subtitle is the user-facing explanation of
 * what the card shows — distinguishing it from the sibling
 * "Personal records" card (which uses the "Top 10 best times across all
 * games" subtitle, pinned by W1193). Existing coverage of this card
 * focuses on the row data (one-PR-per-category mapping in W635) and the
 * card's render order alongside other stats sections; no test pins the
 * subtitle copy itself or its `stats-chart-label` styling hook. A
 * regression that drops, reworded, or restyled this subtitle would
 * silently degrade the card's self-explanatory framing while every
 * data-shape test continues to pass.
 */
describe("StatsPage — personal records by category subtitle", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1296: stats-personal-records-by-category renders 'Your best time in each category' as a stats-chart-label", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records-by-category");
    const subtitle = within(card).getByText(
      "Your best time in each category",
    );
    // Pin the canonical class hook used to style chart-label subtitles
    // consistently across the StatsPage cards.
    expect(subtitle.tagName).toBe("P");
    expect(subtitle.className).toBe("stats-chart-label");
  });
});

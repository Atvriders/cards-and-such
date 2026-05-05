import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1933: StatsPage's `stats-personal-records` card renders a framing subtitle
 * authored as
 *   <p className="stats-chart-label">Top 10 best times across all games</p>
 * immediately below the <h2>Personal records</h2> heading. Existing tests
 * pin the substring text + a `toContain("stats-chart-label")` className
 * match (W1193), the <p> tagName (W1809), and the exact textContent
 * (W1929) — but none of them pin the subtitle paragraph's `className`
 * for *exact* equality.
 *
 * That gap means a regression that *appended* an extra utility class
 * (e.g. `className="stats-chart-label stats-chart-label--legacy"`) or
 * tacked on a stray space (`className="stats-chart-label "`) would still
 * satisfy `toContain` while drifting the subtitle's typography contract.
 * The neighbouring replays-panel subtitle (W1331) and the
 * personal-records-by-category subtitle (W-PrByCat) both already pin
 * exact `className === "stats-chart-label"`; this test extends the same
 * guarantee to the personal-records card so the three subtitles stay
 * lockstep.
 */
describe("StatsPage stats-personal-records — subtitle className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1933: stats-personal-records subtitle paragraph className equals exactly 'stats-chart-label'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records");
    // Locate the subtitle by its canonical copy. There is exactly one
    // such paragraph inside the personal-records card.
    const subtitle = within(card).getByText(
      "Top 10 best times across all games",
    );
    // Sanity: it really is the <p> the other subtitle tests reach for.
    expect(subtitle.tagName).toBe("P");
    // The load-bearing assertion: `className` is the literal string
    // "stats-chart-label" — no extra utility classes, no trailing
    // whitespace, no alternate variant suffix.
    expect(subtitle.className === "stats-chart-label").toBe(true);
  });
});

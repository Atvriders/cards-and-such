import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1621: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> whose third <li> row shows the
 * baseline average-time value. The label copy on that third row is the
 * literal string "Prior avg time" — the "Prior " qualifier is what
 * disambiguates it from the current-week "Avg time" row and signals to
 * readers that the value is a comparison baseline, not the live metric.
 *
 * Existing prev-week tests pin the testid, the <ul> tagName (W1605), the
 * BEM modifier class (W1592), the FIRST row label "Prior plays" (W1606),
 * and the SECOND row label "Prior wins" (W1614), but none lock the THIRD
 * row label copy. A regression that swapped the third-row label to
 * "Avg time" (dropping the qualifier), reordered/duplicated rows, or
 * dropped the avg-time row entirely would still satisfy every existing
 * assertion while making the comparison card incomprehensible. This
 * test pins the load-bearing third-row label copy as "Prior avg time".
 */
describe("StatsPage stats-this-week — prev-week third row label copy", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1621: stats-prev-week third <li> renders 'Prior avg time' label", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    const rows = prior.querySelectorAll("li");
    expect(rows.length).toBeGreaterThanOrEqual(3);
    const thirdRow = rows[2];
    expect(thirdRow).toBeDefined();
    const label = thirdRow!.querySelector("span.stats-week-label");
    expect(label).not.toBeNull();
    expect(label!.textContent).toBe("Prior avg time");
  });
});

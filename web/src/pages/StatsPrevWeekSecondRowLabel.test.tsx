import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1614: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> whose second <li> row shows the
 * baseline wins count. The label copy on that second row is the literal
 * string "Prior wins" — the "Prior " qualifier is what disambiguates it
 * from the current-week "Wins" row and signals to readers that the value
 * is a comparison baseline, not the live metric.
 *
 * Existing prev-week tests pin the testid, the <ul> tagName (W1605), the
 * BEM modifier class (W1592), and the FIRST row label "Prior plays"
 * (W1606), but none lock the SECOND row label copy. A regression that
 * swapped the second-row label to "Wins" (dropping the qualifier),
 * reordered/duplicated rows, or dropped the wins row entirely would
 * still satisfy every existing assertion while making the comparison
 * card incomprehensible. This test pins the load-bearing second-row
 * label copy as "Prior wins".
 */
describe("StatsPage stats-this-week — prev-week second row label copy", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1614: stats-prev-week second <li> renders 'Prior wins' label", () => {
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
    expect(rows.length).toBeGreaterThanOrEqual(2);
    const secondRow = rows[1];
    expect(secondRow).toBeDefined();
    const label = secondRow!.querySelector("span.stats-week-label");
    expect(label).not.toBeNull();
    expect(label!.textContent).toBe("Prior wins");
  });
});

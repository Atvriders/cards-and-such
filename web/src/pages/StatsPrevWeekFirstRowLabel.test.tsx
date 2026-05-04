import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1606: StatsPage's `stats-this-week` card renders a prior-week baseline
 * <ul data-testid="stats-prev-week"> whose first <li> row shows the
 * baseline plays count. The label copy on that first row is the literal
 * string "Prior plays" — the "Prior " qualifier is what disambiguates it
 * from the current-week "Plays" row (W1298) and signals to readers that
 * the value is a comparison baseline, not the live metric.
 *
 * Existing prev-week tests pin the testid (W1416-ish), the <ul> tagName
 * (W1605), and the BEM modifier class (W1592), but none lock the actual
 * label copy on any of the three rows. A regression that swapped the
 * label to "Plays" (dropping the qualifier), reordered the rows so wins
 * came first, or dropped the row entirely would still satisfy every
 * existing assertion while making the comparison card incomprehensible.
 * This test pins the load-bearing first-row label copy as
 * "Prior plays".
 */
describe("StatsPage stats-this-week — prev-week first row label copy", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1606: stats-prev-week first <li> renders 'Prior plays' label", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    const firstRow = prior.querySelector("li");
    expect(firstRow).not.toBeNull();
    const label = firstRow!.querySelector("span.stats-week-label");
    expect(label).not.toBeNull();
    expect(label!.textContent).toBe("Prior plays");
  });
});

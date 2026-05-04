import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1281: StatsPage's `stats-this-week` card renders each week metric value
 * (plays/wins/avg time) inside an <em className="stats-week-value">. The
 * <em> element is load-bearing typography — it gives the value its slanted
 * emphasis even before any CSS rule on the className applies, and ensures
 * the value is semantically distinguished from its <span> label sibling.
 *
 * Existing this-week tests (W717 etc.) assert the formatAvgTime text and
 * the .stats-week-value className, but none pin the actual element tagName.
 * A regression that swaps <em> for <span> or <strong> would silently change
 * both semantics and default styling while all text-content tests still
 * pass. This test pins the tag for the Plays row of the current-week list.
 */
describe("StatsPage stats-this-week — week value <em> tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1281: stats-this-week Plays row renders its value inside an <em> tag", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // Plays is the 1st <li> in the current-week list.
    const playsRow = list.querySelectorAll("li")[0];
    expect(playsRow).toBeDefined();
    expect(playsRow!.textContent).toContain("Plays");

    const playsValue = playsRow!.querySelector(".stats-week-value");
    expect(playsValue).not.toBeNull();
    // Pin the load-bearing tag — <em>, not <span>/<strong>.
    expect(playsValue!.tagName).toBe("EM");
  });
});

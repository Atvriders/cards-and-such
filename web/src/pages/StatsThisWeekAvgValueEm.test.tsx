import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1529: StatsPage's `stats-this-week` card's "Avg time" row renders its
 * value inside an <em className="stats-week-value">. The <em> tag is
 * load-bearing typography — it gives the value its slanted emphasis even
 * before any CSS rule on the className applies, and ensures the value is
 * semantically distinguished from its <span> label sibling.
 *
 * Existing tests cover:
 *   - W1281 (StatsCardWeekValueEm): pins the Plays row's value tagName as <em>
 *   - W717: pins the Avg time row's textContent format ("Mm Ss")
 *   - W1518 (StatsThisWeekAvgLabelClass): pins the Avg time row's label class
 *
 * But none of those pin the *Avg time* row's *value tagName*. A regression
 * that swaps the avg-time row's <em> for a <span> or <strong> would silently
 * change semantics and default italic styling while text + className tests
 * stay green. This test locks the tag specifically for the Avg time row.
 */
describe("StatsPage stats-this-week — Avg time row value <em> tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1529: stats-this-week Avg time row renders its value inside an <em> tag", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // Avg time is the 3rd <li> in the current-week list (Plays / Wins / Avg time).
    const avgRow = list.querySelectorAll("li")[2];
    expect(avgRow).toBeDefined();
    expect(avgRow!.textContent).toContain("Avg time");

    const avgValue = avgRow!.querySelector(".stats-week-value");
    expect(avgValue).not.toBeNull();
    // Pin the load-bearing tag — <em>, not <span>/<strong>/<b>.
    expect(avgValue!.tagName).toBe("EM");
  });
});

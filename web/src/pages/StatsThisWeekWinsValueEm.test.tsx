import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1542: StatsPage's `stats-this-week` card's "Wins" row renders its
 * value inside an <em className="stats-week-value">. The <em> tag is
 * load-bearing typography — it gives the value its slanted emphasis even
 * before any CSS rule on the className applies, and ensures the value is
 * semantically distinguished from its <span> label sibling.
 *
 * Existing tests cover:
 *   - W1281 (StatsCardWeekValueEm): pins the Plays row's value tagName as <em>
 *   - W1529 (StatsThisWeekAvgValueEm): pins the Avg time row's value tagName as <em>
 *   - W1518 etc.: pin the Wins row's label class — but not its value tagName
 *
 * But none of those pin the *Wins* row's *value tagName*. A regression that
 * swaps the wins-row <em> for a <span> or <strong> would silently change
 * semantics and default italic styling while text + className tests stay
 * green. This test locks the tag specifically for the Wins row.
 */
describe("StatsPage stats-this-week — Wins row value <em> tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1542: stats-this-week Wins row renders its value inside an <em> tag", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // Wins is the 2nd <li> in the current-week list (Plays / Wins / Avg time).
    const winsRow = list.querySelectorAll("li")[1];
    expect(winsRow).toBeDefined();
    expect(winsRow!.textContent).toContain("Wins");

    const winsValue = winsRow!.querySelector(".stats-week-value");
    expect(winsValue).not.toBeNull();
    // Pin the load-bearing tag — <em>, not <span>/<strong>/<b>.
    expect(winsValue!.tagName).toBe("EM");
  });
});

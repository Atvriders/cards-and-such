import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1518: StatsPage's `stats-this-week` card renders three rows in the
 * current-week list: Plays / Wins / Avg time. Each row leads with a
 * <span className="stats-week-label"> label that the CSS layout uses to
 * recede the label text against the emphasized <em> value.
 *
 * W1298 pins the Plays-row label className and W1329 pins the Wins-row label
 * className, but the Avg-time row is a separate <li> with its own JSX
 * expression — a regression that renamed only the Avg-time label class (or
 * dropped the <span>) would slip past both existing tests. This test pins
 * the Avg-time row (3rd <li> in the current-week list) to keep the same
 * `stats-week-label` className on a <span>.
 */
describe("StatsPage stats-this-week — Avg time row label className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1518: stats-this-week Avg time row label has className 'stats-week-label'", () => {
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

    // The label is a <span> with the load-bearing class.
    const label = avgRow!.querySelector("span.stats-week-label");
    expect(label).not.toBeNull();
    expect(label!.tagName).toBe("SPAN");
    expect(label!.textContent).toBe("Avg time");
  });
});

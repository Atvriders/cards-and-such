import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1329: StatsPage's `stats-this-week` card renders each metric row as a
 * <span className="stats-week-label"> followed by an <em> value and a delta.
 * The `stats-week-label` className is load-bearing — its CSS rule controls
 * label color/weight/letter-spacing so the label visually recedes against
 * the emphasized value.
 *
 * W1298 already pins the Plays row's label className, but the Wins row is a
 * separate <li> rendered by an independent JSX expression. A regression that
 * renamed only the Wins-row label class (or dropped the span) would slip past
 * W1298. This test pins the Wins row (2nd <li> in the current-week list) to
 * use the same `stats-week-label` className on a <span>.
 */
describe("StatsPage stats-this-week — Wins row label className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1329: stats-this-week Wins row label has className 'stats-week-label'", () => {
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

    // The label is a <span> with the load-bearing class.
    const label = winsRow!.querySelector("span.stats-week-label");
    expect(label).not.toBeNull();
    expect(label!.tagName).toBe("SPAN");
    expect(label!.textContent).toBe("Wins");
  });
});

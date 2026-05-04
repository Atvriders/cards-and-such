import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1298: StatsPage's `stats-this-week` card renders each metric row as a
 * <span className="stats-week-label"> followed by an <em> value and a delta.
 * The `stats-week-label` className is load-bearing — its CSS rule controls
 * label color/weight/letter-spacing so the label visually recedes against
 * the emphasized value. A regression that dropped the className (or renamed
 * it to e.g. `stats-week-key`) would leave the text correct but break the
 * label/value visual hierarchy across all three rows.
 *
 * Existing this-week tests (W1209 subtitle, W1252 wins-row delta, W1281
 * value <em> tag, W717 avg-time formatting) all read text content but none
 * pin the label className. This test pins it for the Plays row, which is
 * the first <li> in the current-week list.
 */
describe("StatsPage stats-this-week — Plays row label className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1298: stats-this-week Plays row label has className 'stats-week-label'", () => {
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

    // The label is a <span> with the load-bearing class.
    const label = playsRow!.querySelector("span.stats-week-label");
    expect(label).not.toBeNull();
    expect(label!.tagName).toBe("SPAN");
    expect(label!.textContent).toBe("Plays");
  });
});

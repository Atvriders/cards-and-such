import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1563: StatsPage's `stats-this-week` card renders exactly three <li> rows
 * inside its `stats-this-week-list` <ul> — one each for Plays, Wins, and
 * Avg time. The triple is load-bearing: the surrounding tests address rows
 * by index (`querySelectorAll("li")[0..2]`) for label/value/delta classes,
 * so a regression that adds a fourth row (e.g. a "Sessions" metric inserted
 * between Wins and Avg) or drops one entirely would silently shift those
 * positional lookups onto the wrong row while still passing per-class
 * assertions. None of the existing this-week tests pin the row count
 * itself; they only walk to a known index. This test pins the cardinality.
 */
describe("StatsPage stats-this-week — week list row count", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1563: stats-this-week-list contains exactly 3 <li> rows", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    const rows = list.querySelectorAll("li");
    // Plays, Wins, Avg time — three peer metrics, no more, no fewer.
    expect(rows).toHaveLength(3);
  });
});

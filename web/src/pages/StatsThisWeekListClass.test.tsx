import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1361: StatsPage's `stats-this-week` card renders its current-week metric
 * list as `<ul className="stats-week-list" data-testid="stats-this-week-list">`.
 * The `stats-week-list` className is the styling hook the CSS uses to lay out
 * the plays/wins/avg-time rows (spacing, label/value typography, delta chip
 * positioning). The sibling prev-week list reuses the same base class plus a
 * `--prev` modifier; if the base class drops off the current-week <ul> the
 * shared layout silently breaks.
 *
 * Existing tests pin the testid and the <ul> tagName but none assert the
 * className — so a regression that drops `stats-week-list` (or renames it to
 * something like `stats-week-rows`) would leave every other test green while
 * the styling cascade collapses. This test pins the className itself.
 */
describe("StatsPage stats-this-week — week list className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1361: stats-this-week-list <ul> carries the stats-week-list className", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    expect(list).toHaveClass("stats-week-list");
  });
});

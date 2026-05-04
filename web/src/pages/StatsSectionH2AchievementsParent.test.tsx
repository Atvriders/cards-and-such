import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1471: The "Achievements" h2 is the section heading of the achievements
 * stats card. Existing tests pin (a) the heading text + level via
 * getByRole (W846) and (b) the card retrievable by
 * data-testid="stats-achievements" (multiple W-tests use getByTestId),
 * but NOTHING pins the structural relationship between the h2 and its
 * containing card — i.e. the h2 must sit directly inside the
 * `<div class="stats-card" data-testid="stats-achievements">` card. A
 * refactor that hoists the h2 out of the card (e.g. moves it to a grid
 * wrapper) or renames/strips the `stats-card` className from the
 * heading's parent would silently break the card's visual hierarchy
 * while every existing assertion still passes (the h2 still renders;
 * the card still has its testid). Mirrors W1263 (Activity), W1446
 * (Hour-of-day), W1457 (Personal records), W1460 (Top-played). Pin
 * the h2's parent classList + data-testid so that contract is enforced.
 */
describe("StatsPage Achievements section — h2 parent card relationship", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1471: 'Achievements' h2 is nested inside the .stats-card div with data-testid='stats-achievements'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Achievements" });
    const parent = heading.parentElement;
    expect(parent).not.toBeNull();
    // The h2 must be a direct child of the achievements stats-card.
    expect(parent!.classList.contains("stats-card")).toBe(true);
    expect(parent!.getAttribute("data-testid")).toBe("stats-achievements");
  });

  /**
   * W1476: W1471 pins the parent's classList + data-testid, but it does NOT
   * pin that the h2 is the FIRST element child of the card. The achievements
   * card layout depends on the heading appearing before the search input,
   * the show-locked toggle, and the achievements-grid. A refactor that
   * reorders the children (e.g. moves the heading below the search box,
   * or wraps the grid in a fragment-replacing div) would silently shift
   * the visual hierarchy while the W1471 test still passes (the h2 is
   * still in the card; the card still has its testid). Pin the h2 as
   * the first element child of the achievements card.
   */
  it("W1476: 'Achievements' h2 is the first element child of the achievements stats-card", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Achievements" });
    const parent = heading.parentElement;
    expect(parent).not.toBeNull();
    // The h2 must be the FIRST element child of the achievements stats-card,
    // appearing before the search input, show-locked toggle, and grid.
    expect(parent!.firstElementChild).toBe(heading);
  });
});

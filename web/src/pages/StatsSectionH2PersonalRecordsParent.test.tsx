import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1457: The "Personal records" h2 is the section heading of the
 * personal-records stats card. Existing tests pin (a) the heading text
 * + level via getByRole (W841) and (b) the card retrievable by
 * data-testid="stats-personal-records" (multiple W-tests use
 * getByTestId for row ordering, capping, empty-copy, subtitle, etc.),
 * but NOTHING pins the structural relationship between the h2 and its
 * containing card — i.e. the h2 must sit directly inside the
 * `<div class="stats-card" data-testid="stats-personal-records">` card.
 * A refactor that hoists the h2 out of the card (e.g. moves it to a
 * grid wrapper) or renames/strips the `stats-card` className from the
 * heading's parent would silently break the card's visual hierarchy
 * while every existing assertion still passes (the h2 still renders;
 * the card still has its testid). Mirrors W1263 (Activity) and W1446
 * (Hour-of-day). Pin the h2's parent classList + data-testid so that
 * contract is enforced.
 */
describe("StatsPage Personal records section — h2 parent card relationship", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1457: 'Personal records' h2 is nested inside the .stats-card div with data-testid='stats-personal-records'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Personal records" });
    const parent = heading.parentElement;
    expect(parent).not.toBeNull();
    // The h2 must be a direct child of the personal-records stats-card.
    expect(parent!.classList.contains("stats-card")).toBe(true);
    expect(parent!.getAttribute("data-testid")).toBe("stats-personal-records");
  });
});

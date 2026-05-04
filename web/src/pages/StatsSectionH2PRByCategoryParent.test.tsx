import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1464: The "Personal records by category" h2 is the section heading
 * of the per-category personal-records stats card. Existing tests pin
 * (a) the heading text + level via getByRole and (b) the card
 * retrievable by data-testid="stats-personal-records-by-category" (the
 * subtitle and list-class W-tests use getByTestId on this card), but
 * NOTHING pins the structural relationship between the h2 and its
 * containing card — i.e. the h2 must sit directly inside the
 * `<div class="stats-card" data-testid="stats-personal-records-by-category">`
 * card. A refactor that hoists the h2 out of the card (e.g. moves it
 * to a grid wrapper) or strips the `stats-card` className from the
 * heading's parent would silently break the card's visual hierarchy
 * while every existing assertion still passes (the h2 still renders;
 * the card still has its testid). Mirrors W1263 (Activity), W1446
 * (Hour-of-day), and W1457 (Personal records). Pin the h2's parent
 * classList + data-testid so that contract is enforced.
 */
describe("StatsPage Personal records by category section — h2 parent card relationship", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1464: 'Personal records by category' h2 is nested inside the .stats-card div with data-testid='stats-personal-records-by-category'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Personal records by category" });
    const parent = heading.parentElement;
    expect(parent).not.toBeNull();
    // The h2 must be a direct child of the per-category personal-records stats-card.
    expect(parent!.classList.contains("stats-card")).toBe(true);
    expect(parent!.getAttribute("data-testid")).toBe("stats-personal-records-by-category");
  });
});

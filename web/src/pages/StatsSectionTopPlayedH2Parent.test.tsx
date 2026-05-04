import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1460: The "Top played" h2 is the section heading of the categories
 * stats card. Existing tests pin (a) the heading text + level via
 * getByRole (W828) and (b) the card retrievable by
 * data-testid="stats-categories" (W451/W1159/W1203 use getByTestId), but
 * NOTHING pins the structural relationship between the h2 and its
 * containing card — i.e. the h2 must sit directly inside the
 * `<div class="stats-card stats-card--exportable" data-testid="stats-categories">`
 * card. A refactor that hoists the h2 out of the card (e.g. moves it to
 * a grid wrapper) or renames/strips the `stats-card` className from the
 * heading's parent would silently break the card's visual hierarchy
 * while every existing assertion still passes (the h2 still renders;
 * the card still has its testid). Mirrors W1263 (Activity) and W1446
 * (Hour-of-day). Pin the h2's parent classList + data-testid so that
 * contract is enforced.
 */
describe("StatsPage Top played section — h2 parent card relationship", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1460: 'Top played' h2 is nested inside the .stats-card div with data-testid='stats-categories'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Top played" });
    const parent = heading.parentElement;
    expect(parent).not.toBeNull();
    // The h2 must be a direct child of the Top played stats-card.
    expect(parent!.classList.contains("stats-card")).toBe(true);
    expect(parent!.getAttribute("data-testid")).toBe("stats-categories");
  });
});

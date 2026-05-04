import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1468: The "This week" h2 is the section heading of the this-week stats
 * card. Existing tests pin (a) the heading text + level via getByRole
 * (W847), (b) the card's testid + stats-card--week modifier (W1226), and
 * (c) various inner-list contracts (W1252, W1281, W1318, W1361, etc.),
 * but NOTHING pins the structural relationship between the h2 and its
 * containing card — i.e. the h2 must sit directly inside the
 * `<div class="stats-card stats-card--week" data-testid="stats-this-week">`
 * card. A refactor that hoists the h2 out of the card (e.g. moves it to
 * a grid wrapper) or renames/strips the `stats-card` className from the
 * heading's parent would silently break the card's visual hierarchy
 * while every existing assertion still passes (the h2 still renders;
 * the card still has its testid). Mirrors W1263 (Activity), W1446
 * (Hour-of-day), and W1457 (Personal records). Pin the h2's parent
 * classList + data-testid so that contract is enforced.
 */
describe("StatsPage This-week section — h2 parent card relationship", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1468: 'This week' h2 is nested inside the .stats-card div with data-testid='stats-this-week'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "This week" });
    const parent = heading.parentElement;
    expect(parent).not.toBeNull();
    // The h2 must be a direct child of the this-week stats-card.
    expect(parent!.classList.contains("stats-card")).toBe(true);
    expect(parent!.getAttribute("data-testid")).toBe("stats-this-week");
  });
});

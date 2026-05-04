import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1489: The "Plays by category × day-of-week" h2 is the section heading
 * of the category-by-day-of-week heatmap stats card. Existing tests pin
 * the heatmap grid itself via data-testid="stats-cat-heatmap" (W1250,
 * W1341, W1364, W1445, etc.), and pin heading text/level via getByRole
 * (W852-style), but NOTHING pins the structural relationship between
 * the h2 and its containing card — i.e. the h2 must sit directly inside
 * the `<div class="stats-card" data-testid="stats-cat-heatmap-card">`
 * card wrapper. A refactor that hoists the h2 out of the card (e.g.
 * moves it to a grid wrapper) or renames/strips the `stats-card`
 * className from the heading's parent would silently break the card's
 * visual hierarchy while every existing assertion still passes (the h2
 * still renders; the heatmap grid still has its testid). Mirrors W1263
 * (Activity), W1446 (Hour-of-day), W1457 (Personal records), W1464
 * (Top-played), W1468 (PR-by-cat), W1471 (This-week), W1479
 * (Achievements). Pin the h2's parent classList + data-testid so that
 * contract is enforced.
 */
describe("StatsPage Cat-heatmap section — h2 parent card relationship", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1489: 'Plays by category × day-of-week' h2 is nested inside the .stats-card div with data-testid='stats-cat-heatmap-card'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Plays by category × day-of-week",
    });
    const parent = heading.parentElement;
    expect(parent).not.toBeNull();
    // The h2 must be a direct child of the cat-heatmap stats-card.
    expect(parent!.classList.contains("stats-card")).toBe(true);
    expect(parent!.getAttribute("data-testid")).toBe("stats-cat-heatmap-card");
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1883: StatsPage's "Achievements" h2 — the section heading of the
 * achievements stats card (data-testid="stats-achievements") — is
 * intentionally rendered bare with NO `className`, so it inherits the
 * global card-section h2 typography rather than a page-specific override.
 * W846 pins the heading text + level, and W1471/W1476 pin the parent
 * .stats-card relationship and first-child ordering — but none of those
 * tests assert the heading's own className. A refactor that added e.g.
 * `className="stats-card-title"` (to scope a one-off heading style) or
 * `className="achievements-title"` (to namespace the achievements card)
 * would silently drift this card's heading away from the shared visual
 * hierarchy used by every sibling stats card while every other assertion
 * still passed. Mirrors the bare-className contract pinned for the
 * categories-card heading (W1878) and the page-level h1 (W1570). Lock
 * the exact-equality className contract here.
 */
describe("StatsPage achievements card — Achievements h2 className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1883: 'Achievements' achievements-card h2 renders with empty className", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const title = screen.getByRole("heading", { level: 2, name: "Achievements" });
    // Pin the bare-className contract so the achievements-card heading keeps
    // inheriting the shared stats-card h2 styling rather than a one-off.
    expect(title.className === "").toBe(true);
  });
});

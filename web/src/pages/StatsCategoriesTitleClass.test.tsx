import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1878: StatsPage's "Top played" h2 — the section heading of the categories
 * stats card (data-testid="stats-categories") — is intentionally rendered
 * bare with NO `className`, so it inherits the global card-section h2
 * typography rather than a page-specific override. W828 pins the heading
 * text + level, and W1460 pins the parent .stats-card relationship — but
 * neither asserts the heading's own className. A refactor that added e.g.
 * `className="stats-card-title"` (to scope a one-off heading style) would
 * silently drift this card's heading away from the shared visual hierarchy
 * used by every sibling stats card while every other assertion still
 * passed. Mirrors the bare-className contract pinned for the page-level h1
 * (W1570). Lock the exact-equality className contract here.
 */
describe("StatsPage categories card — Top played h2 className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1878: 'Top played' categories-card h2 renders with empty className", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Top played" });
    // Pin the bare-className contract so the categories-card heading keeps
    // inheriting the shared stats-card h2 styling rather than a one-off.
    expect(heading.className).toBe("");
  });
});

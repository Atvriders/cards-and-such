import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1884: StatsPage's "Activity" h2 — the section heading of the activity
 * stats card (data-testid="stats-activity") that holds the line chart — is
 * intentionally rendered bare with NO `className`, so it inherits the
 * shared stats-card h2 typography rather than a card-specific override.
 * W1263 pins the parent .stats-card relationship (h2 nested inside the
 * stats-activity card div), and the W828/W833 audit pins the heading text
 * + level via getByRole — but neither asserts the heading's own
 * className. A refactor that added e.g. `className="stats-card-title"`
 * (to scope a one-off heading style) would silently drift the activity
 * card's heading away from the shared visual hierarchy used by every
 * sibling stats card while every other assertion still passed. Mirrors
 * the bare-className contract pinned for the categories card heading
 * (W1878) and the page-level h1 (W1570). Lock the exact-equality
 * className contract here.
 */
describe("StatsPage activity card — Activity h2 className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1884: 'Activity' activity-card h2 renders with empty className", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Activity" });
    // Pin the bare-className contract so the activity-card heading keeps
    // inheriting the shared stats-card h2 styling rather than a one-off.
    expect(heading.className).toBe("");
  });
});

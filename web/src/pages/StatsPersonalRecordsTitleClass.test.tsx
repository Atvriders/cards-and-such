import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1896: StatsPage's "Personal records" h2 — the section heading of the
 * personal-records stats card (data-testid="stats-personal-records") — is
 * intentionally rendered bare with NO `className`, so it inherits the
 * global card-section h2 typography rather than a page-specific override.
 * W841 pins the heading text + level (tagName === "H2") and W1457 pins
 * the parent .stats-card relationship — but neither asserts the heading's
 * own className. A refactor that added e.g. `className="stats-card-title"`
 * (to scope a one-off heading style) or `className="personal-records-title"`
 * (to namespace the personal-records card) would silently drift this card's
 * heading away from the shared visual hierarchy used by every sibling
 * stats card while every other assertion still passed. Mirrors the
 * bare-className contract pinned for the achievements-card heading
 * (W1883), categories-card heading (W1878), and the page-level h1
 * (W1570). Lock the exact-equality className contract here.
 */
describe("StatsPage personal-records card — Personal records h2 className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1896: 'Personal records' personal-records-card h2 renders with empty className", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const title = screen.getByRole("heading", { level: 2, name: "Personal records" });
    // Pin the bare-className contract so the personal-records-card heading
    // keeps inheriting the shared stats-card h2 styling rather than a one-off.
    expect(title.className === "").toBe(true);
  });
});

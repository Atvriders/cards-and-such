import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2456: StatsPage's "This week" h2 — the section heading of the
 * this-week stats card (data-testid="stats-this-week") — is intentionally
 * rendered bare with NO `className`, so it inherits the global card-section
 * h2 typography rather than a one-off override. W1857 pins the heading's
 * tagName and W1468 pins the parent .stats-card relationship, but neither
 * asserts the heading's own className. A refactor that added e.g.
 * `className="stats-week-title"` or `className="stats-card-title"` would
 * silently drift the this-week card's heading away from the shared visual
 * hierarchy used by every sibling stats card while every other assertion
 * still passed. Mirrors the bare-className contract pinned for the
 * achievements-card heading (W1883), categories-card heading (W1878),
 * activity-card heading (W1884), and personal-records-card heading
 * (W1896). The lookup here intentionally goes through
 * `getByTestId("stats-this-week").querySelector("h2")` rather than a
 * role/heading query so the assertion does not depend on heading
 * semantics — it locks the literal `className` of the first h2 inside the
 * this-week card.
 */
describe("StatsPage stats-this-week — h2 className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2456: stats-this-week 'This week' h2 renders with empty className", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const h2 = card.querySelector("h2");
    expect(h2).not.toBeNull();
    // Pin the bare-className contract so the this-week-card heading
    // keeps inheriting the shared stats-card h2 styling rather than a
    // one-off override class.
    expect(h2!.className).toBe("");
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1944: StatsPage's achievements card — the outer
 * `<div data-testid="stats-achievements">` wrapper that contains the
 * "Achievements" heading, the search input, the show-locked toggle and the
 * achievements grid — is intentionally rendered with the bare shared
 * `stats-card` className so it picks up the same visual treatment (border,
 * padding, background, etc.) as every sibling stats card on the page
 * (totals, streak, drills, replays). Other W-tests pin the heading text
 * (W846), the parent relationship via getByTestId (W1471), the heading's
 * empty className (W1883) and the achievements-grid container tag (W1881),
 * but none of them lock down the achievements card's OWN className via
 * exact equality. A refactor that switched to e.g.
 * `className="stats-card stats-card-achievements"` (to namespace this card
 * for an achievements-only override) or `className="achievements-card"`
 * (to drop the shared base entirely) would silently break the visual
 * uniformity of the stats grid while every existing assertion still
 * passed. Mirrors the exact-equality className contract pinned for the
 * other stats-card wrappers. Lock the exact-equality className here.
 */
describe("StatsPage achievements card — wrapper className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1944: stats-achievements card wrapper has className exactly 'stats-card'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-achievements");
    // Pin the exact shared-base className so the achievements card keeps
    // inheriting the standard stats-card styling rather than diverging.
    expect(card.className === "stats-card").toBe(true);
  });
});

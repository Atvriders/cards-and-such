import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1252 — stats-this-week's WINS row delta direction. Existing tests pin the
 * Plays-row delta in up/down/flat/em-dash directions, but the Wins row's
 * delta span (driven by the same renderDelta() helper but a *separate*
 * pctDelta(current.wins, prior.wins) call) is not pinned to a specific
 * direction in any other test. This test seeds 3 wins (score > 0 entries)
 * in the last-7-days window and 2 wins in the prior-7-days window so that
 *   pctDelta(3, 2) = round(((3 - 2) / 2) * 100) = 50
 * which must render the Wins-row delta as is-up with the ▲ glyph and "50%"
 * magnitude. A regression that swapped current/prior, dropped the Wins
 * delta entirely, or wired the Wins row to the Plays count would be caught.
 */

const STATS_KEY = "cards-and-such:stats:v1";

function seedStats(): void {
  localStorage.setItem(
    STATS_KEY,
    JSON.stringify({
      totalPlayed: 0,
      totalWins: 0,
      longestStreak: 0,
      currentStreak: 0,
      perGame: {},
      perCategory: {},
      daysPlayed: [],
      unlocked: [],
    }),
  );
}

function renderPage(): void {
  render(
    <MemoryRouter>
      <ConfirmProvider>
        <StatsPage />
      </ConfirmProvider>
    </MemoryRouter>,
  );
}

describe("StatsPage this-week Wins delta direction", () => {
  beforeEach(() => {
    localStorage.clear();
    if (typeof URL.createObjectURL !== "function") {
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: vi.fn(() => "blob:mock"),
      });
    } else {
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    }
  });

  it("W1252: Wins row delta renders is-up with ▲ glyph and '50%' when current wins > prior wins", () => {
    seedStats();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    // Current 7d window: 3 wins (score > 0). Prior 7d window: 2 wins.
    // pctDelta(3, 2) → round(50) = 50 → is-up, ▲ 50%.
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: now - 1 * dayMs, time: 60, score: 1 },
        { ts: now - 2 * dayMs, time: 60, score: 1 },
        { ts: now - 3 * dayMs, time: 60, score: 1 },
        { ts: now - 8 * dayMs, time: 60, score: 1 },
        { ts: now - 10 * dayMs, time: 60, score: 1 },
      ]),
    );
    renderPage();

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // Wins is the 2nd <li> in the current-week list (Plays / Wins / Avg time).
    const winsRow = list.querySelectorAll("li")[1];
    expect(winsRow).toBeDefined();
    expect(winsRow!.textContent).toContain("Wins");

    const winsDelta = winsRow!.querySelector(".stats-week-delta");
    expect(winsDelta).not.toBeNull();
    expect(winsDelta!.getAttribute("data-direction")).toBe("up");
    expect(winsDelta!.classList.contains("is-up")).toBe(true);
    expect(winsDelta!.textContent).toContain("▲");
    expect(winsDelta!.textContent).toContain("50%");

    // Inversion-immunity: must not also carry down/flat styling or glyphs.
    expect(winsDelta!.classList.contains("is-down")).toBe(false);
    expect(winsDelta!.classList.contains("is-flat")).toBe(false);
    expect(winsDelta!.textContent).not.toContain("▼");
    expect(winsDelta!.textContent).not.toContain("—");
  });
});

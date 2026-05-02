import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LeaderboardPage from "./LeaderboardPage.js";
import { LEADERBOARD_MOCK_KEY } from "../platform/leaderboardClient.js";

const STATS_KEY = "cards-and-such:stats:v1";

function renderPage(): void {
  render(
    <MemoryRouter>
      <LeaderboardPage />
    </MemoryRouter>,
  );
}

describe("LeaderboardPage tabs", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders all five tab buttons including Top Players and My Ladder", () => {
    renderPage();
    expect(screen.getByRole("tab", { name: /top players/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /per-game/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /global/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /my ladder/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /online now/i })).toBeInTheDocument();
  });

  it("with cards-leaderboard-mock=true the Top Players panel renders 3+ rows", async () => {
    localStorage.setItem(LEADERBOARD_MOCK_KEY, "true");
    renderPage();

    // Switch to the Top Players tab.
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /top players/i }));
    });

    // The panel container should mount immediately.
    expect(screen.getByTestId("lb-top-players")).toBeInTheDocument();

    // MockClient.getTop is async; rows arrive after the microtask drain.
    await waitFor(() => {
      const rows = screen.getAllByTestId("lb-top-row");
      expect(rows.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("with cards-leaderboard-mock=false (default) and no plays, Top Players shows the empty state", async () => {
    // Explicitly false — LocalOnlyClient with no stats returns 0 rows.
    localStorage.setItem(LEADERBOARD_MOCK_KEY, "false");
    renderPage();

    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /top players/i }));
    });

    await waitFor(() => {
      expect(screen.getByTestId("lb-top-empty")).toBeInTheDocument();
    });
    // No rows rendered.
    expect(screen.queryAllByTestId("lb-top-row")).toHaveLength(0);
  });

  it("tab switching: My Ladder shows the ladder, Top Players shows top", async () => {
    // Seed a stat so LocalOnlyClient returns 1 row in Top Players too,
    // while also giving My Ladder a non-empty surface.
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        perGame: { klondike: { played: 3, wins: 1, best: 1234 } },
      }),
    );

    renderPage();

    // Click My Ladder — should mount the ladder list (sort-by control or rows).
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /my ladder/i }));
    });
    await waitFor(() => {
      // The ladder either renders the empty-state or the sort control once
      // populated; with a seeded stat we expect the populated view.
      expect(screen.getByTestId("lb-row-klondike")).toBeInTheDocument();
    });
    // Top Players panel must NOT be mounted while My Ladder is active.
    expect(screen.queryByTestId("lb-top-players")).not.toBeInTheDocument();

    // Now switch to Top Players.
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /top players/i }));
    });
    expect(screen.getByTestId("lb-top-players")).toBeInTheDocument();
    // And the ladder row is gone.
    expect(screen.queryByTestId("lb-row-klondike")).not.toBeInTheDocument();
  });
});

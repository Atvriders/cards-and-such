import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LeaderboardPage from "./LeaderboardPage.js";
import {
  LEADERBOARD_MOCK_KEY,
  FRIENDS_MOCK_KEY,
} from "../platform/leaderboardClient.js";

const STATS_KEY = "cards-and-such:stats:v1";
const LAST_PLAYED_KEY = "cards-last-played";

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

  it("Friends tab renders 5 mock friends when the friends toggle is on", async () => {
    // Enable mock friends so getFriendsClient resolves to FriendsClient,
    // which seeds a deterministic 10-name roster with klondike scores.
    localStorage.setItem(FRIENDS_MOCK_KEY, "true");
    renderPage();

    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /friends/i }));
    });

    expect(screen.getByTestId("lb-friends")).toBeInTheDocument();

    await waitFor(() => {
      const rows = screen.getAllByTestId("lb-friends-row");
      // Default roster has 10 friends each with a klondike score; confirm
      // at least 5 rows render so we know the friends path is wired up.
      expect(rows.length).toBeGreaterThanOrEqual(5);
    });
  });

  it("My Ladder share button invokes URL.createObjectURL when clicked", async () => {
    // Seed a stat so the ladder is non-empty and the share button is enabled.
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        perGame: { klondike: { played: 5, wins: 2, best: 4321 } },
      }),
    );

    // jsdom doesn't implement createObjectURL — install a stub spy.
    const createSpy = vi.fn(() => "blob:fake-url");
    const revokeSpy = vi.fn();
    const origCreate = URL.createObjectURL;
    const origRevoke = URL.revokeObjectURL;
    URL.createObjectURL = createSpy as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = revokeSpy as unknown as typeof URL.revokeObjectURL;

    try {
      renderPage();
      await act(async () => {
        fireEvent.click(screen.getByRole("tab", { name: /my ladder/i }));
      });

      const shareBtn = await screen.findByTestId("lb-share-btn");
      expect(shareBtn).not.toBeDisabled();

      await act(async () => {
        fireEvent.click(shareBtn);
      });

      expect(createSpy).toHaveBeenCalledTimes(1);
      // Sanity: it was invoked with a Blob (not just any value).
      const arg = createSpy.mock.calls[0][0] as Blob;
      expect(arg).toBeInstanceOf(Blob);

      // downloadSvg defers revokeObjectURL via setTimeout(0); flush it
      // BEFORE we restore the originals so the deferred call still sees
      // our spy and doesn't crash on jsdom's missing implementation.
      await new Promise((r) => setTimeout(r, 1));
      expect(revokeSpy).toHaveBeenCalled();
    } finally {
      URL.createObjectURL = origCreate;
      URL.revokeObjectURL = origRevoke;
    }
  });

  it("My Ladder rows render relative time correctly when cards-last-played is set", async () => {
    const now = Date.now();
    // 2h ago — should render as "2h ago" via the formatRelative helper.
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        perGame: { klondike: { played: 1, wins: 0, best: 100 } },
      }),
    );
    localStorage.setItem(
      LAST_PLAYED_KEY,
      JSON.stringify({ klondike: twoHoursAgo }),
    );

    renderPage();

    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /my ladder/i }));
    });

    const row = await screen.findByTestId("lb-row-klondike");
    // The "when" cell renders inside the row; assert the relative label.
    expect(row.textContent).toMatch(/2h ago/);
  });
});

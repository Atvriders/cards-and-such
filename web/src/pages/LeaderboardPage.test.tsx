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
const RATINGS_KEY = "cards-ratings";

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

  it("tab switching mounts Top Players then My Ladder by data-testid presence", async () => {
    // Seed a stat so My Ladder renders a `lb-row-*` row when activated;
    // mock leaderboard so Top Players reliably mounts its panel container.
    localStorage.setItem(LEADERBOARD_MOCK_KEY, "true");
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        perGame: { klondike: { played: 4, wins: 2, best: 777 } },
      }),
    );

    renderPage();

    // Click Top Players → `lb-top-players` panel mounts; ladder rows must not
    // be present while a different tab is active.
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /top players/i }));
    });
    expect(screen.getByTestId("lb-top-players")).toBeInTheDocument();
    expect(screen.queryByTestId("lb-row-klondike")).not.toBeInTheDocument();

    // Click My Ladder → at least one `lb-row-*` mounts and the Top Players
    // panel is fully unmounted (conditional rendering, not just hidden).
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /my ladder/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId("lb-row-klondike")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("lb-top-players")).not.toBeInTheDocument();
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

  it("Hall of Fame carousel shows the top 5 games ranked by (rating × plays)", async () => {
    // Seed 6 games with strictly-decreasing (rating × plays) scores so the
    // top-5 ordering is unambiguous and the 6th entry must be excluded.
    // Scores: klondike=50, spider=40, freecell=30, pyramid=20, tripeaks=10,
    // yukon=5 (must be dropped).
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        perGame: {
          klondike: { played: 10, wins: 0, best: 1 },
          spider: { played: 10, wins: 0, best: 1 },
          freecell: { played: 10, wins: 0, best: 1 },
          pyramid: { played: 10, wins: 0, best: 1 },
          tripeaks: { played: 10, wins: 0, best: 1 },
          yukon: { played: 5, wins: 0, best: 1 },
        },
      }),
    );
    localStorage.setItem(
      RATINGS_KEY,
      JSON.stringify({
        klondike: 5,
        spider: 4,
        freecell: 3,
        pyramid: 2,
        tripeaks: 1,
        yukon: 1,
      }),
    );

    renderPage();
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /my ladder/i }));
    });

    // The Hall of Fame heading should mount once the ladder is non-empty.
    const hofHeading = await screen.findByText(/Hall of Fame/i);
    // The all-games <ul> below also renders <li> rows, so scope listitem
    // queries to the Hall of Fame <section>.
    const hofSection = hofHeading.closest("section") as HTMLElement;
    expect(hofSection).not.toBeNull();

    // role=list / role=listitem: exactly 5 cards, in score-descending order.
    const cards = Array.from(
      hofSection.querySelectorAll('[role="listitem"]'),
    ) as HTMLElement[];
    expect(cards).toHaveLength(5);

    const orderedIds = ["klondike", "spider", "freecell", "pyramid", "tripeaks"];
    cards.forEach((card, i) => {
      // Each card is an <a> rendered by react-router's <Link>; assert the
      // href and the rank badge so ordering is locked in.
      expect(card.getAttribute("href")).toBe(`/play/${orderedIds[i]}`);
      expect(card.textContent).toMatch(new RegExp(`#${i + 1}`));
    });

    // The 6th-place game (yukon, score 5) must be excluded from Hall of Fame.
    expect(
      cards.some((c) => c.getAttribute("href") === "/play/yukon"),
    ).toBe(false);
  });

  it("Hall of Fame card links to /play/<id> so clicks navigate to that game", async () => {
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        perGame: { klondike: { played: 7, wins: 2, best: 9000 } },
      }),
    );
    localStorage.setItem(RATINGS_KEY, JSON.stringify({ klondike: 5 }));

    renderPage();
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /my ladder/i }));
    });

    await screen.findByText(/Hall of Fame/i);

    // Find the Hall of Fame card by its accessible label (rank #1, klondike).
    const card = screen.getByLabelText(/Hall of Fame #1: klondike/i);
    // It's a react-router <Link>, which renders as an <a href="…">. Asserting
    // on href is the canonical way to verify navigation target without
    // mounting a full router with routes.
    expect(card.tagName).toBe("A");
    expect(card.getAttribute("href")).toBe("/play/klondike");

    // A click on the link element shouldn't throw inside MemoryRouter (the
    // router intercepts it); confirm the assertion holds before and after.
    await act(async () => {
      fireEvent.click(card);
    });
    expect(card.getAttribute("href")).toBe("/play/klondike");
  });

  it("My Ladder rows display 1-5 ★ filled stars based on cards-ratings values", async () => {
    // Seed five games with strictly-increasing ratings so the rounding logic
    // resolves to 1, 2, 3, 4, and 5 filled stars respectively. The component
    // renders a `lb-rating-filled` span containing N copies of the ★ glyph,
    // followed by a `lb-rating-empty` span containing (5 - N) copies; we
    // assert on the filled-span text for each game's row.
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        perGame: {
          klondike: { played: 1, wins: 0, best: 1 },
          spider: { played: 1, wins: 0, best: 1 },
          freecell: { played: 1, wins: 0, best: 1 },
          pyramid: { played: 1, wins: 0, best: 1 },
          tripeaks: { played: 1, wins: 0, best: 1 },
        },
      }),
    );
    localStorage.setItem(
      RATINGS_KEY,
      JSON.stringify({
        klondike: 1,
        spider: 2,
        freecell: 3,
        pyramid: 4,
        tripeaks: 5,
      }),
    );

    renderPage();
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /my ladder/i }));
    });

    // Wait for the ladder to populate before querying individual rows.
    await screen.findByTestId("lb-row-klondike");

    const expectations: Array<[string, number]> = [
      ["klondike", 1],
      ["spider", 2],
      ["freecell", 3],
      ["pyramid", 4],
      ["tripeaks", 5],
    ];
    for (const [id, stars] of expectations) {
      const row = screen.getByTestId(`lb-row-${id}`);
      const filled = row.querySelector(".lb-rating-filled") as HTMLElement;
      expect(filled).not.toBeNull();
      // The filled span holds exactly `stars` ★ glyphs, no more.
      expect(filled.textContent).toBe("★".repeat(stars));
      // And the empty span holds the complementary (5 - stars) glyphs.
      const emptySpan = row.querySelector(".lb-rating-empty") as HTMLElement;
      expect(emptySpan.textContent).toBe("★".repeat(5 - stars));
    }
  });

  it("My Ladder shows lb-empty empty state with a link to lobby when no stats exist", async () => {
    // No stats, ratings, last-played, or best-times in localStorage — the
    // ladder collects zero rows and the empty-state branch renders.
    renderPage();
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /my ladder/i }));
    });

    const empty = await screen.findByTestId("lb-empty");
    expect(empty).toBeInTheDocument();
    // The empty state must offer a way back to the lobby ("/" — the home
    // route, which renders the game catalog). It's a react-router <Link>,
    // which serializes to an <a href="/">.
    const link = empty.querySelector('a[href="/"]') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.textContent).toMatch(/play a game/i);
    // And no ladder rows should be rendered while the empty state is up.
    expect(screen.queryByTestId("lb-row-klondike")).not.toBeInTheDocument();
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

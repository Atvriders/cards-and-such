/**
 * Unit test for the PlayPage win-banner end-stats-record badge (W816).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2705) renders a
 *   `<span data-testid="end-stats-record">New record!</span>` *only* when the
 *   just-finished round's elapsed time beats the stored personal best.
 *   `isNewRecord` is set inside the end-effect from the `recordBest(elapsed)`
 *   return; if the round doesn't break the record, `isNewRecord` stays false
 *   and the badge is unmounted entirely. Sibling tests cover `final-score`
 *   (W805), `end-stats-time` (W809), and `end-stats-best` non-record path
 *   (W814) — but no test pins the new-record badge text or the conditional
 *   render contract. A regression that always renders the badge, never
 *   renders it, or wires the wrong copy ("Best!" vs "New record!") would
 *   slip through every adjacent test.
 *
 * Strategy:
 *   Mirror the W805 hoisted fixture so a single dispatcher click drives
 *   PlayPage to terminal-win. Pre-seed `cards-best-times` with a *larger*
 *   stored time (10s) than the elapsed time we accrue (5s) — so
 *   `recordBest(5)` returns isRecord=true and the badge renders. Install
 *   fake timers BEFORE mount per the W809/W814 pattern so the 1Hz tick
 *   effect arms against the virtual clock; advance 5s, click win, and
 *   assert the badge reads "New record!" plus the "(was 00:10)"
 *   previousBest sub-span. A second `it` pins the negative branch:
 *   pre-seed a *smaller* PR (5s) than elapsed (10s), drive the same
 *   win, and assert the badge node is absent — that's the conditional-
 *   render contract that distinguishes the record from non-record path.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a winning
// payload once `moves >= 1`, so a single dispatch from the fixture button
// drives PlayPage into the terminal-win branch and renders the win banner.
// The exact score is irrelevant — we only assert the new-record badge —
// but a positive value keeps us on the win path so the win-only end-stats
// "Best" row (which hosts the record badge) is mounted at all.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-record-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Record Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the win-banner end-stats-record test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 1 } : null,
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          data-testid="fx-win"
          type="button"
          onClick={() => dispatch({ type: "win-now" })}
        >
          win
        </button>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

// PlayPage looks the plugin up via the games registry — substitute the
// fixture so we don't drag the real game catalogue into the test.
vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// win-banner render fast and side-effect-free.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage win-banner end-stats-record badge (W816)", () => {
  it("renders 'New record!' badge with previous-best when the round beats the stored PR", async () => {
    // Pre-seed a *slow* stored best (10s) BEFORE PlayPage mounts. Our
    // fast 5s round will beat it, so `recordBest(5)` returns
    // isRecord=true and the badge renders. The map shape — single
    // `cards-best-times` key holding `Record<gameId, seconds>` — mirrors
    // the writer in PlayPage.tsx (writeBestTime).
    const STORED_BEST_SECONDS = 10;
    const ELAPSED_SECONDS = 5;
    const STORED_BEST_FORMATTED = "00:10";
    localStorage.setItem(
      "cards-best-times",
      JSON.stringify({ [hoisted.TEST_GAME_ID]: STORED_BEST_SECONDS }),
    );

    // Install fake timers BEFORE mount per W809/W814 pattern so the 1Hz
    // `setInterval` that drives `elapsed` registers against the virtual
    // clock from the start. `shouldAdvanceTime: true` keeps mount-phase
    // microtasks alive so the quickstart effect can transition `phase`
    // to "playing" normally.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: the badge is NOT mounted before the game ends —
    // it lives inside the `phase === "ended" && isWin && isNewRecord`
    // branch of the JSX.
    expect(screen.queryByTestId("end-stats-record")).toBeNull();

    // Advance the virtual clock to 5s of elapsed play. 5s < the seeded
    // 10s, so `recordBest(5)` returns isRecord=true and `isNewRecord`
    // flips on — the exact path that mounts the badge.
    act(() => {
      vi.advanceTimersByTime(ELAPSED_SECONDS * 1000);
    });

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and the
    // PlayPage end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Visibility-after-win assertion: the badge node must now be
    // mounted. A regression that dropped the data-testid would surface
    // here even if the visible text remained correct.
    const recordBadge = screen.getByTestId("end-stats-record");
    expect(recordBadge).toBeTruthy();

    // The whole point of the test: the badge text must contain the
    // "New record!" copy that PlayPage renders inline before the
    // optional previous-best sub-span. Using `toContain` keeps the
    // assertion tolerant of the trailing "(was 00:10)" sub-text.
    expect(recordBadge.textContent).toContain("New record!");

    // Belt-and-suspenders: when a previous best existed, PlayPage
    // appends a `<span class="end-stats-prev"> (was MM:SS)</span>`
    // — pin the previousBest readout so a regression that wires the
    // sub-span to the wrong variable (e.g., elapsed) is caught.
    expect(recordBadge.textContent).toContain(`(was ${STORED_BEST_FORMATTED})`);
  });

  it("does NOT render the end-stats-record badge when the round did not beat the stored PR", async () => {
    // Inverse setup: pre-seed a *fast* PR (5s) that our slow 10s round
    // won't beat. `recordBest(10)` returns isRecord=false, `isNewRecord`
    // stays false, and the conditional `{isNewRecord && …}` collapses
    // — so the entire badge node should be absent from the DOM even
    // though the win-banner end-stats list itself is still mounted.
    const STORED_BEST_SECONDS = 5;
    const ELAPSED_SECONDS = 10;
    localStorage.setItem(
      "cards-best-times",
      JSON.stringify({ [hoisted.TEST_GAME_ID]: STORED_BEST_SECONDS }),
    );

    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    act(() => {
      vi.advanceTimersByTime(ELAPSED_SECONDS * 1000);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Sanity: the win-banner end-stats list IS mounted (otherwise the
    // negative assertion below would pass for the wrong reason — i.e.,
    // because the entire end-panel never rendered). end-stats-best
    // lives in the same `isWin` branch as the record badge.
    expect(screen.getByTestId("end-stats-best")).toBeTruthy();

    // The conditional-render contract: no `isNewRecord` => no badge.
    // queryBy returns null when the node is absent (vs throwing).
    expect(screen.queryByTestId("end-stats-record")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

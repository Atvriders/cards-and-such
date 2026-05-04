/**
 * Unit test for the PlayPage win-banner end-stats-time value (W809).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2698) renders
 *   a `<dd data-testid="end-stats-time">{formatTime(elapsed)}</dd>` inside
 *   the end-stats list. That `elapsed` is the same 1Hz counter the toolbar
 *   timer (W639) renders — but the win-banner copy is a *separate* read of
 *   the value at the moment the round ended. W805 covered `final-score`;
 *   W639 covered the live ticking toolbar value; sibling tests cover the
 *   share-text, save-image, and save-replay surfaces. No test pins the
 *   end-banner's own time readout — a regression that wired the end stats
 *   to a stale variable, the wrong formatter, or hard-coded "00:00" would
 *   slip through every adjacent test.
 *
 * Strategy:
 *   Mirror the hoisted fixture from W805 (PlayPage.winBannerScore.test.tsx)
 *   so a single dispatcher click drives PlayPage to terminal-win. Install
 *   fake timers BEFORE mount per the W639 pattern — `shouldAdvanceTime: true`
 *   keeps mount-phase microtasks live while the 1Hz tick effect arms against
 *   the virtual clock. `?quickstart=1` skips the setup screen so the timer
 *   starts immediately. Advance the virtual clock 7s, click the win button,
 *   then assert `end-stats-time` reads "00:07" — the exact `mm:ss` shape the
 *   PlayPage `formatTime` helper produces (zero-padded minutes + seconds).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer increments `moves`; isTerminal returns a winning
// payload once `moves >= 1`, so a single dispatch from the fixture button
// drives PlayPage into the terminal-win branch and renders the win banner.
// The score itself is irrelevant for this test — we only assert the time
// readout — but a positive value keeps us on the win path (not the loss
// banner) so the `end-stats-time` element is mounted alongside the rest of
// the win-only stats.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-time-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Time Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the win-banner end-stats-time test.",
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

describe("PlayPage win-banner end-stats-time value (W809)", () => {
  it("renders the elapsed mm:ss inside end-stats-time after a win", async () => {
    // Install fake timers BEFORE mount per W639 pattern so the 1Hz
    // `setInterval` that drives `elapsed` registers against the virtual
    // clock from the start. `shouldAdvanceTime: true` keeps mount-phase
    // microtasks (and React's commit-phase scheduling) alive so the
    // quickstart effect can transition `phase` to "playing" normally.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");

    // `?quickstart=1` skips the setup screen so the fixture component
    // (and its win-dispatcher button) mounts immediately and the 1Hz
    // elapsed-counter effect arms in the same render pass.
    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Pre-condition: end-stats-time is NOT mounted before the game ends —
    // it lives inside the `phase === "ended"` branch of the JSX.
    expect(screen.queryByTestId("end-stats-time")).toBeNull();

    // Advance the virtual clock by 7s — the 1Hz tick interval should fire
    // ~7 times, each bumping `elapsed` from 0 to 7. We pick a value that
    // straddles a single digit (so a regression that drops the zero-pad
    // would surface) but stays under 60 (so the minutes field stays "00"
    // and we're not also testing minute-rollover here).
    act(() => {
      vi.advanceTimersByTime(7000);
    });

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns a winning payload, and the
    // PlayPage end-effect transitions phase to "ended" with isWin=true.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Visibility-after-win assertion: the end-stats-time node must now
    // be mounted. A regression that dropped the data-testid would
    // surface here even if the visible text remained correct.
    const endStatsTime = screen.getByTestId("end-stats-time");
    expect(endStatsTime).toBeTruthy();

    // The whole point of the test: the rendered text must be the
    // mm:ss-formatted elapsed time at the moment the game ended.
    // `formatTime(7)` -> "00:07" (zero-padded minutes AND seconds), so
    // any of: dropped padding ("0:7", "0:07"), wrong formatter, hard-
    // coded placeholder, or stale `elapsed` would mismatch this exact
    // string. `.textContent` is tolerant of whitespace wrappers while
    // still pinning the visible-time contract.
    expect(endStatsTime.textContent?.trim()).toBe("00:07");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

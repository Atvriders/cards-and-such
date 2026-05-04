/**
 * Unit test for the PlayPage end-stats-time on the LOSS path (W872).
 *
 * Observable behavior:
 *   The end-stats `<dd data-testid="end-stats-time">{formatTime(elapsed)}</dd>`
 *   in PlayPage.tsx (~line 2698) lives inside the *shared* end-panel block —
 *   it is NOT gated on `isWin`. Only the sibling `end-stats-best` row is
 *   wrapped in `{isWin && (...)}`. So the elapsed-time readout must render
 *   on a terminal-loss too.
 *
 *   Sibling W809 (PlayPage.endStatsTime.test.tsx) pins the win path. No
 *   test pins the *loss* path: a regression that wired `end-stats-time`
 *   under `isWin && (...)`, or otherwise hid the row when the game ended
 *   in a zero-score terminal, would still pass W809 — and the user would
 *   silently lose the time readout on every losing round.
 *
 * Strategy:
 *   Mirror W809's hoisted-fixture pattern but with W845's loss shape — a
 *   reducer that flips into `isTerminal: { score: 0 }` on a single
 *   dispatched action. Install fake timers BEFORE mount (W639 pattern,
 *   `shouldAdvanceTime: true`) so the 1Hz `setInterval` registers against
 *   the virtual clock from the start. Use `?quickstart=1` to skip the
 *   setup screen so the timer starts immediately. Advance 5s, dispatch
 *   the LOSE action, then assert `end-stats-time` reads "00:05" — a value
 *   distinct from W809's 7s pin so a copy-paste regression that re-used
 *   the win-path's elapsed value would surface.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture. Reducer flips to a `{ score: 0 }` terminal on a single
// dispatched LOSE action — the canonical losing-terminal shape (W845).
// PlayPage's win/loss discriminator (`term.score > 0`) treats a zero score
// as the loss branch, so `isWin === false` and `isLoss === true`.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "loss-end-stats-time-fixture";
  type State = { lost: boolean };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Loss End Stats Time Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the loss-banner end-stats-time test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ lost: false }),
    reducer: (s: State, action: Action): State =>
      action?.type === "LOSE" ? { lost: true } : s,
    isTerminal: (s: State): { score: number } | null =>
      s.lost ? { score: 0 } : null,
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          type="button"
          data-testid="fx-lose"
          onClick={() => dispatch({ type: "LOSE" })}
        >
          lose
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
// terminal render side-effect-free. (The loss path doesn't trigger
// confetti, but PlayPage still imports the module eagerly.)
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

describe("PlayPage loss-banner end-stats-time value (W872)", () => {
  it("renders the elapsed mm:ss inside end-stats-time after a loss", async () => {
    // Install fake timers BEFORE mount per W639 pattern so the 1Hz
    // `setInterval` driving `elapsed` registers against the virtual
    // clock from the start. `shouldAdvanceTime: true` keeps mount-phase
    // microtasks (and React's commit-phase scheduling) alive so the
    // quickstart effect can transition `phase` to "playing" normally.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");

    // `?quickstart=1` skips the setup screen so the fixture component
    // (and its lose-dispatcher button) mounts immediately and the 1Hz
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

    // Advance the virtual clock by 5s — the 1Hz tick should fire ~5 times,
    // bumping `elapsed` from 0 to 5. We pick a value distinct from W809's
    // 7s pin so a copy-paste regression that used the win-path elapsed
    // would surface, and well under 60 so the minutes field stays "00".
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Drive the round to terminal-loss. One click triggers the reducer
    // (`lost: false -> true`), `isTerminal` returns `{ score: 0 }`, and
    // PlayPage's end-effect transitions phase to "ended" with isWin=false.
    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-lose"));
    });

    // Confirm we're on the loss path — the end-panel mounts with
    // `data-win="false"`. If this fails, the fixture didn't drive the
    // loss branch and the rest of the assertions would be misleading.
    const endPanel = screen.getByTestId("end-panel");
    expect(endPanel.getAttribute("data-win")).toBe("false");

    // Visibility-after-loss assertion: the end-stats-time node must be
    // mounted on the loss path too — not just on win. A regression that
    // accidentally gated the row under `isWin && (...)` would surface here.
    const endStatsTime = screen.getByTestId("end-stats-time");
    expect(endStatsTime).toBeTruthy();

    // The whole point of the test: the rendered text must be the
    // mm:ss-formatted elapsed time at the moment the game ended.
    // `formatTime(5)` -> "00:05" (zero-padded minutes AND seconds).
    expect(endStatsTime.textContent?.trim()).toBe("00:05");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

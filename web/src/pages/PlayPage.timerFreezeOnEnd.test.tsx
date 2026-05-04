/**
 * Unit test for PlayPage header timer freeze in the ended phase (W910).
 *
 * Companion / strengthening of W903 (`PlayPage.timerEndedPhase.test.tsx`):
 *   - W903 asserts the `play-timer` is *present* during `phase === "ended"`.
 *   - W910 (this test) asserts the `play-timer` *stops ticking* once the
 *     phase flips to "ended" — keeping the elapsed readout pinned to the
 *     value at win-time. Without this assertion, a regression that left
 *     the 1Hz `setInterval` unconditionally armed (or re-armed it with a
 *     stale gate like `phase !== "setup"`) would silently pass W903: the
 *     timer would still be in the DOM, just continuing to count up past
 *     the moment the player won.
 *
 * Why pin "freeze" specifically:
 *   The header timer doubles as the canonical elapsed-time readout that
 *   the end panel and post-win share image both reference. If the counter
 *   keeps incrementing after the win, the value the player sees in the
 *   header drifts away from `finalScore`'s captured elapsed, and the
 *   share image / stats panel disagree with the live header by however
 *   long the user lingers on the end screen. Freezing the counter the
 *   instant phase flips to "ended" is the contract that keeps those
 *   reads consistent.
 *
 * Strategy:
 *   Mirror W903's hoisted-fixture + registry-mock pattern (one-click win
 *   via `isTerminal` returning `{ score: 100 }` once `moves >= 1`), but
 *   layer W639's fake-timer harness on top so we can drive the virtual
 *   clock past the win and observe the counter. The sequence:
 *     1. Install fake timers BEFORE mount.
 *     2. Click `start-game`, advance 5s — counter should tick to "00:05".
 *     3. Click `fx-win` to flip phase to "ended", capture the text.
 *     4. Advance another 5s (virtual). The 1Hz `useEffect` is gated on
 *        `phase === "playing"`, so its cleanup must fire on the phase
 *        flip and `setInterval` must be torn down.
 *     5. Assert the readout is *unchanged* from the win-time capture.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. vi.hoisted runs before vi.mock factories evaluate
// so the closure capture below is safe despite looking like a TDZ pattern.
// Reducer increments `moves`; isTerminal returns a positive-score payload
// (score: 100) once `moves >= 1`, so one click drives PlayPage into the
// terminal-win branch and the JSX flips to `phase === "ended"`.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-freeze-on-end-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Freeze On End Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for header timer freeze-on-end test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 100 } : null,
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
// win-path render side-effect-free.
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

describe("PlayPage header timer freeze in ended phase (W910)", () => {
  it("stops ticking play-timer-current once phase flips to ended", async () => {
    // Install fake timers *before* mount so the 1Hz tick effect's
    // `setInterval` registers against the virtual clock from the start.
    // `shouldAdvanceTime: true` keeps mount-phase microtasks from
    // deadlocking so React's setup-screen effects commit normally.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Past the setup screen so the toolbar (with the elapsed-time
    // counter) mounts and the 1Hz tick effect arms in the playing phase.
    fireEvent.click(screen.getByTestId("start-game"));

    const timer = screen.getByTestId("play-timer-current");
    expect(timer.textContent).toBe("00:00");

    // Pre-condition: the timer is actually ticking while playing —
    // otherwise the post-win "unchanged" assertion is meaningless
    // (a permanently frozen timer would false-pass without this anchor).
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(timer.textContent).not.toBe("00:00");

    // Drive the round to terminal-win. One click triggers the reducer
    // (moves: 0 -> 1), `isTerminal` returns `{ score: 100 }`, and the
    // PlayPage end-effect transitions phase to "ended" — the 1Hz tick
    // effect's gate (`phase !== "playing"`) should fire its cleanup and
    // tear down the `setInterval`.
    act(() => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    // Anchor: `final-score` only renders inside the `phase === "ended"`
    // branch. Its presence confirms the phase actually transitioned.
    expect(screen.getByTestId("final-score")).toBeTruthy();

    // Capture the readout *immediately* after the win. This is the value
    // the timer should stay frozen at — anything that drifts past this
    // proves the interval is still firing.
    const frozenText = timer.textContent;
    expect(frozenText).not.toBeNull();

    // Advance the virtual clock another 5 seconds. If the 1Hz tick
    // effect's cleanup ran on the phase flip, no `setInterval` callback
    // will fire and `elapsed` will not increment.
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // The contract under test (W910): the header timer text must be
    // identical to the value it held the moment the phase flipped to
    // "ended". A regression that leaves the interval armed will show a
    // text node that has advanced ~5 seconds past `frozenText`.
    expect(timer.textContent).toBe(frozenText);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

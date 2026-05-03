/**
 * Unit test for the PlayPage 1Hz elapsed-time counter (W639).
 *
 * Asserts the observable behaviour of the in-game timer: while in the
 * playing phase (un-paused), the `play-timer-current` text node updates
 * as wall-clock seconds tick by. We drive the virtual clock with vitest's
 * fake timers and check the text changes after a 5s advance.
 *
 * Mirrors the harness used in `PlayPage.pause.test.tsx`:
 *
 *   - `vi.hoisted` defines a minimal fixture plugin that the registry
 *     mock factory can close over without TDZ issues (vi.mock factories
 *     run before module-level const initialisers).
 *   - Fake timers are installed BEFORE mount with `shouldAdvanceTime`
 *     so React's mount-phase effects still commit normally while the
 *     1Hz tick interval registers against the virtual clock.
 *   - Confetti is null-stubbed because jsdom lacks canvas APIs.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. vi.hoisted runs before vi.mock factories evaluate
// so the closure capture below is safe despite looking like a TDZ pattern.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-tick-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Tick Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for 1Hz timer tick test.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free even though we never reach the win banner.
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

describe("PlayPage timer tick (W639)", () => {
  it("advances play-timer-current text after 5s with fake timers", async () => {
    // Install fake timers *before* mount so the 1Hz tick effect's
    // `setInterval` registers against the virtual clock from the start.
    // We use `shouldAdvanceTime: true` to keep mount-phase microtasks /
    // queueMicrotask-style callbacks from deadlocking, which lets the
    // setup-screen effects commit normally.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    // Move past the setup screen so the toolbar (with the elapsed-time
    // counter) mounts and the 1Hz tick effect arms.
    fireEvent.click(screen.getByTestId("start-game"));

    const timer = screen.getByTestId("play-timer-current");
    expect(timer.textContent).toBe("00:00");

    // Advance the virtual clock by 5 seconds — the 1Hz setInterval should
    // fire ~5 times, each bumping `elapsed` and reformatting the counter.
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // After 5 ticks the formatted minute:second readout must have moved
    // off the initial "00:00".
    expect(timer.textContent).not.toBe("00:00");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

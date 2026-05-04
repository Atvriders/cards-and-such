/**
 * Unit test for PlayPage pause → resume timer continuity (W720).
 *
 * Existing coverage:
 *   - `PlayPage.timerTick.test.tsx` (W639/W647) — verifies the 1Hz counter
 *     advances while playing.
 *   - `PlayPage.pause.test.tsx` (W578/W164) — verifies pause toggles the
 *     button + overlay AND that the elapsed counter freezes while paused.
 *
 * What this test adds (W720): pause is a presentation freeze, NEVER a
 * reset. After pausing at "00:03", waiting 5s, and resuming, the next 1Hz
 * tick must increment FROM the frozen value — i.e. "00:04", not "00:01".
 *
 * Why this matters as a separate assertion: the implementation tears the
 * tick `setInterval` down inside the `useEffect` cleanup whenever `paused`
 * flips true, then re-arms the interval when `paused` flips back. A naive
 * future refactor could accidentally reset `elapsed` to 0 on resume (e.g.
 * by attaching the reset to the wrong dep), and the existing pause test
 * would still pass because it only checks the frozen-while-paused branch.
 *
 * Harness mirrors the sibling timer tests:
 *   - `vi.hoisted` registers a minimal fixture plugin so the registry mock
 *     factory can close over it without TDZ violations.
 *   - Fake timers are installed BEFORE mount with `shouldAdvanceTime: true`
 *     so mount-phase microtasks resolve while the 1Hz interval registers
 *     against vitest's virtual clock.
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
  const TEST_GAME_ID = "timer-resume-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Resume Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for pause→resume timer continuity test.",
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

describe("PlayPage timer pause → resume continuity (W720)", () => {
  it("resume continues from the frozen elapsed value, not from 00:00", async () => {
    // Install fake timers BEFORE mount so the 1Hz tick `setInterval` the
    // playing-phase `useEffect` schedules is owned by vitest's fake clock
    // from arming through tear-down and re-arm.
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    const timer = screen.getByTestId("play-timer-current");
    expect(timer.textContent).toBe("00:00");

    // Run 3 ticks while playing — counter should read "00:03".
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(timer.textContent).toBe("00:03");

    // Pause — the tick effect cleanup runs and tears down the interval.
    const pauseBtn = screen.getByTestId("play-pause-btn");
    fireEvent.click(pauseBtn);
    expect(pauseBtn.getAttribute("aria-pressed")).toBe("true");

    // 5s of virtual wall-clock pass while paused — counter must NOT move.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(timer.textContent).toBe("00:03");

    // Resume — the playing-phase effect re-runs and arms a fresh interval.
    fireEvent.click(pauseBtn);
    expect(pauseBtn.getAttribute("aria-pressed")).toBe("false");

    // One more tick after resume — must read "00:04" (continuation), NOT
    // "00:01" (reset). Equality on the formatted string catches both a
    // covertly-reset `elapsed` AND any drift in `formatTime` padding.
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(timer.textContent).toBe("00:04");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

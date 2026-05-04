/**
 * Unit test for PlayPage paused-state timer element markup (W917).
 *
 * Existing coverage on the timer + pause:
 *   - `PlayPage.timerTick.test.tsx` (W639/W647) — 1Hz advance while playing.
 *   - `PlayPage.timerResume.test.tsx` (W720) — pause → resume continuity of
 *     the elapsed value (no reset on resume).
 *   - `PlayPage.timerFreezeOnEnd.test.tsx` (W910) — freeze when phase=ended.
 *   - `PlayPage.pause.test.tsx` (W578/W164) — pause toggles pause button +
 *     overlay AND `play-timer-current` text stops moving while paused.
 *
 * What this test adds (W917): the assistive-tech surface of the timer
 * element itself when `paused === true`. The render at PlayPage.tsx:1789
 * appends a `play-timer--paused` modifier class and the aria-label at
 * PlayPage.tsx:1792 grows a trailing " (paused)" so screen-reader users
 * hear pause state alongside the elapsed value. None of the sibling timer
 * tests assert either of those two markup mutations, and a refactor that
 * inadvertently dropped the modifier (or moved the aria-label suffix to a
 * separate visually-rendered span) would silently regress accessibility
 * while every existing pause/timer test still passes.
 *
 * Scope discipline: ONE behavior, ONE element. We assert the class +
 * aria-label both flip true on pause AND revert on resume — the round-trip
 * keeps the test honest against a stale-attribute regression that would
 * pass a one-shot assertion.
 *
 * Harness mirrors the sibling timer tests:
 *   - `vi.hoisted` registers a minimal fixture plugin so the registry mock
 *     factory can close over it without TDZ violations.
 *   - Real timers are sufficient — we never advance the clock; we only
 *     toggle the `paused` state via the pause button and read attributes.
 *   - Confetti is null-stubbed because jsdom lacks canvas APIs.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. vi.hoisted runs before vi.mock factories evaluate
// so the closure capture below is safe despite looking like a TDZ pattern.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-paused-aria-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Paused Aria Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for paused-state timer aria/class test.",
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
  vi.restoreAllMocks();
});

describe("PlayPage paused-state timer element markup (W917)", () => {
  it("timer gains play-timer--paused class + (paused) aria-label suffix while paused, reverts on resume", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));

    const timer = screen.getByTestId("play-timer");

    // Baseline (playing): no `--paused` modifier, aria-label has no suffix.
    expect(timer.className).not.toMatch(/play-timer--paused/);
    expect(timer.getAttribute("aria-label")).toBe("Elapsed time 00:00");

    // Pause — class modifier appears, aria-label gains the (paused) suffix.
    fireEvent.click(screen.getByTestId("play-pause-btn"));
    expect(timer.className).toMatch(/\bplay-timer--paused\b/);
    expect(timer.getAttribute("aria-label")).toBe("Elapsed time 00:00 (paused)");

    // Resume — both markup mutations revert. This round-trip catches a
    // stale-attribute regression where pause-state markup latches on.
    fireEvent.click(screen.getByTestId("play-pause-btn"));
    expect(timer.className).not.toMatch(/play-timer--paused/);
    expect(timer.getAttribute("aria-label")).toBe("Elapsed time 00:00");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

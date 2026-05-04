/**
 * Unit test for PlayPage header timer visibility gating (W897).
 *
 * Existing timer coverage:
 *   - `PlayPage.timerTick.test.tsx` (W639/W647) — 1Hz tick advances
 *     `play-timer-current` text after starting the game.
 *   - `PlayPage.timerResume.test.tsx` (W720) — pause→resume continuity
 *     (resume continues from frozen value, never resets to 00:00).
 *
 * What this test adds (W897): the header `play-timer` element is rendered
 * ONLY while `phase === "playing" || phase === "ended"`. On the setup
 * screen (phase === "setup", BEFORE the user clicks `start-game`), the
 * header toolbar's elapsed-time readout must not be in the DOM.
 *
 * Why this matters as a separate assertion: the timer is gated by
 * `{(phase === "playing" || phase === "ended") && (<span … data-testid=
 * "play-timer" />)}`. The two existing timer tests both click
 * `start-game` before any timer assertion, so they would still pass even
 * if the gate were widened (e.g. to `phase !== "loading"`) and the timer
 * leaked onto the setup screen showing a stale "00:00".
 *
 * Mirrors the W724 pause-button setup-gate test (`pauseHiddenSetup`):
 *   - `vi.hoisted` registers a minimal fixture plugin so the registry
 *     mock factory can close over it without TDZ violations.
 *   - Confetti is null-stubbed because jsdom lacks canvas APIs.
 *   - No fake timers are needed — we never reach the playing phase.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. vi.hoisted runs before vi.mock factories evaluate
// so the closure capture below is safe despite looking like a TDZ pattern.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-hidden-setup-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Hidden Setup Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for header timer setup-gate test.",
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

describe("PlayPage header timer visibility (W897)", () => {
  it("does not render play-timer while phase === setup", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The setup screen mounts a `start-game` button — its presence is
    // our anchor that the page is in the pre-playing phase. Without
    // this anchor, a regression that fails to mount the page at all
    // would also satisfy "no timer in DOM" and silently false-pass.
    expect(screen.getByTestId("start-game")).toBeTruthy();

    // The header timer is gated by `phase === "playing" || phase ===
    // "ended"` — must not exist in the DOM during the setup phase. We
    // also assert the inner `play-timer-current` readout is absent so a
    // future refactor that splits the wrapper from the readout still
    // gets caught here. queryByTestId returns null when absent.
    expect(screen.queryByTestId("play-timer")).toBeNull();
    expect(screen.queryByTestId("play-timer-current")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

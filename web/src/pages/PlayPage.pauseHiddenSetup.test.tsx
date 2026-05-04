/**
 * Unit test for PlayPage pause-button visibility gating (W724).
 *
 * Existing pause coverage:
 *   - `PlayPage.pause.test.tsx` (W578/W164) — click toggles aria-pressed
 *     and overlay; Esc pauses while playing and freezes the elapsed timer.
 *   - `PlayPage.timerResume.test.tsx` (W720) — pause→resume timer continuity
 *     (resume continues from frozen value, never resets to 00:00).
 *
 * What this test adds (W724): the Pause button is rendered ONLY while
 * `phase === "playing"`. On the setup screen (phase === "setup", BEFORE
 * the user clicks `start-game`), the toolbar is not mounted and the
 * Pause button must not be in the DOM.
 *
 * Why this matters as a separate assertion: the button is gated by
 * `{phase === "playing" && (<button … data-testid="play-pause-btn" />)}`.
 * A naive future refactor (e.g. lifting the button out of the conditional
 * to "always show, but disabled" or replacing the gate with `phase !==
 * "ended"`) could leak the control onto the setup screen. The existing
 * pause tests both call `mountAndStart()` which clicks `start-game`
 * before any pause assertion, so they would all still pass while the
 * setup-screen leak went undetected.
 *
 * Harness mirrors the sibling pause tests:
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
  const TEST_GAME_ID = "pause-hidden-setup-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Pause Hidden Setup Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for pause-button setup-gate test.",
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

describe("PlayPage pause button visibility (W724)", () => {
  it("does not render play-pause-btn while phase === setup", async () => {
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
    // would also satisfy "no pause button in DOM" and silently false-pass.
    expect(screen.getByTestId("start-game")).toBeTruthy();

    // The Pause button is gated by `phase === "playing"` — must not
    // exist in the DOM during the setup phase. queryByTestId returns
    // null when absent (vs getByTestId which would throw).
    expect(screen.queryByTestId("play-pause-btn")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

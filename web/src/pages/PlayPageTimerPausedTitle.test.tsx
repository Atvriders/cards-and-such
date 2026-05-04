/**
 * Unit test for PlayPage header timer `title` attribute — paused variant
 * (W1325).
 *
 * Companion to `PlayPageTimerTitle.test.tsx` (W1317), which pinned the
 * playing-phase value `title="Elapsed time"` on the toolbar `play-timer`
 * <span>. The same render at PlayPage.tsx:1791 flips that tooltip to
 * "Paused" when the user pauses:
 *
 *   title={paused ? "Paused" : "Elapsed time"}
 *
 * No existing PlayPage test asserts the paused side of that ternary on
 * the native `title` attribute. Sibling coverage (`timerPausedAria`,
 * `pause`, `pausedOverlay*`) checks the className modifier, aria-label
 * suffix, overlay markup, and pause-button label/title — but a refactor
 * that dropped the timer span's tooltip wiring on pause would slip
 * through every existing test. This test pins the paused variant so the
 * ternary stays wired in both directions.
 *
 * Harness mirrors `PlayPageTimerTitle.test.tsx`: a hoisted fixture plugin
 * keeps the registry mock TDZ-safe, Confetti is null-stubbed for jsdom.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-paused-title-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Paused Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for paused-variant timer title test.",
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

describe("PlayPage timer title attribute — paused variant (W1325)", () => {
  it("renders title=\"Paused\" on the play-timer span after pausing", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    // Cross setup -> playing so the toolbar timer mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    const timer = screen.getByTestId("play-timer");
    // Sanity: starts on the "playing" branch of the ternary.
    expect(timer.getAttribute("title")).toBe("Elapsed time");

    // Toggle pause via the toolbar pause button.
    fireEvent.click(screen.getByTestId("play-pause-btn"));

    // The paused branch of the ternary now drives the tooltip.
    expect(timer.getAttribute("title")).toBe("Paused");
  });
});

void React;

/**
 * Unit test for the PlayPage toolbar `play-timer` wrapper span's
 * exact className equality WHEN PAUSED (W1916).
 *
 * The toolbar wrapper around `play-timer-current` is the <span> with
 * `data-testid="play-timer"`. Its className is built dynamically as
 * `play-timer${paused ? " play-timer--paused" : ""}` (PlayPage.tsx:1789).
 *
 * Existing coverage on this className token:
 *   - W1910 (PlayPageTimerWrapperClass.test.tsx) pins exact equality of
 *     the wrapper className in the un-paused playing phase
 *     (`className === "play-timer"`).
 *   - W917 (PlayPage.timerPausedAria.test.tsx) asserts the paused
 *     modifier via regex (`toMatch(/play-timer--paused/)`) plus the
 *     aria-label suffix round-trip.
 *
 * What is NOT covered: the wrapper's *exact* className string in the
 * paused state. A refactor that accidentally added a stray utility
 * class (or reordered the modifier ahead of the base token, which
 * would still match the regex) would silently regress the CSS hook.
 * This test pins exact equality for the paused branch so the same
 * "no drift" guarantee that W1910 gives the un-paused branch applies
 * to the paused branch too.
 *
 * Harness mirrors the W1910 sibling: hoisted fixture plugin for the
 * registry mock + null-stubbed Confetti for jsdom. Pause is triggered
 * via the same `play-pause-btn` testid that W917 uses.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-paused-class-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Paused Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for paused timer wrapper className test.",
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

describe("PlayPage timer wrapper className paused (W1916)", () => {
  it("renders className === \"play-timer play-timer--paused\" on the wrapper span while paused", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    // Cross the setup -> playing phase boundary so the toolbar timer mounts.
    fireEvent.click(screen.getByTestId("start-game"));
    // Toggle paused state on so the modifier token is appended.
    fireEvent.click(screen.getByTestId("play-pause-btn"));

    const wrapper = screen.getByTestId("play-timer");
    expect(wrapper.className === "play-timer play-timer--paused").toBe(true);
  });
});

void React;

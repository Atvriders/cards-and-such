/**
 * Unit test for the PlayPage toolbar `play-timer` wrapper span's
 * exact className equality (W1910).
 *
 * The toolbar wrapper around `play-timer-current` is the <span> with
 * `data-testid="play-timer"`. Its className is built dynamically as
 * `play-timer${paused ? " play-timer--paused" : ""}`. Existing tests
 * pin:
 *   - the inner `play-timer-current` className via exact equality
 *     (W1421 / PlayPageTimerCurrentClass.test.tsx)
 *   - the wrapper's `play-timer--paused` modifier via regex match
 *     (PlayPage.timerPausedAria.test.tsx)
 *   - the wrapper's `title` and `aria-label` attributes
 *
 * What is NOT covered: the wrapper's *exact* className string in the
 * default un-paused playing phase. A refactor that accidentally added
 * a stray utility class or dropped the base `play-timer` token would
 * still pass the existing regex/`not.toMatch` assertions. This test
 * pins exact equality so the CSS hook can't silently drift.
 *
 * Harness mirrors PlayPageTimerCurrentClass.test.tsx: hoisted fixture
 * plugin for the registry mock + null-stubbed Confetti for jsdom.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-wrapper-class-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Wrapper Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for timer wrapper className test.",
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

describe("PlayPage timer wrapper className (W1910)", () => {
  it("renders className === \"play-timer\" on the wrapper span while un-paused playing", async () => {
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

    const wrapper = screen.getByTestId("play-timer");
    expect(wrapper.className === "play-timer").toBe(true);
  });
});

void React;

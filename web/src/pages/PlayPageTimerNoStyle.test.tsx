/**
 * Unit test for the PlayPage toolbar `play-timer` wrapper span's
 * absence of an inline `style` attribute (W2115).
 *
 * The toolbar wrapper around `play-timer-current` is the <span> with
 * `data-testid="play-timer"`. In `PlayPage.tsx` (~line 1788) it is
 * rendered with `className`, `data-testid`, `title`, and `aria-label`
 * only. There is no `style={...}` prop — all visual styling is driven
 * by CSS via the `play-timer` / `play-timer--paused` class hooks.
 *
 * Existing tests pin the wrapper's:
 *   - exact className (PlayPageTimerWrapperClass.test.tsx, W1910)
 *   - `play-timer--paused` modifier via regex (PlayPage.timerPausedAria)
 *   - `title` and `aria-label`
 *   - inner `play-timer-current` className (W1421)
 *
 * What is NOT covered: the wrapper's *lack* of an inline `style`
 * attribute. A refactor that accidentally introduces inline styling
 * (e.g. `style={{ color: ... }}`) would bypass the CSS layer and the
 * theming/`--paused` modifier system. This test pins the negative so
 * the CSS hook stays the single source of truth.
 *
 * Harness mirrors PlayPageTimerWrapperClass.test.tsx: hoisted fixture
 * plugin for the registry mock + null-stubbed Confetti for jsdom.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-no-style-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer No Style Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for timer no-style attribute test.",
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

describe("PlayPage timer wrapper has no inline style attribute (W2115)", () => {
  it("does not set a `style` attribute on the play-timer wrapper while playing", async () => {
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

    const timer = screen.getByTestId("play-timer");
    expect(timer.hasAttribute("style")).toBe(false);
  });
});

void React;

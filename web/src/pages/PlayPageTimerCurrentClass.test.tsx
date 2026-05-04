/**
 * Unit test for the PlayPage timer's inner `play-timer-current` span
 * className (W1421).
 *
 * The toolbar `play-timer` <span> renders an inner readout span with
 * className "play-timer-current" wrapping the live mm:ss text. Existing
 * timer tests cover its `data-testid` (presence/absence, tick, freeze)
 * and the parent's title / aria-label / className modifier — but NOT
 * the inner span's className itself, which is the CSS hook that styles
 * the elapsed readout. This test pins that className so a refactor
 * can't silently drop the styling hook.
 *
 * Harness mirrors `PlayPageTimerTitle.test.tsx`: a hoisted fixture
 * plugin keeps the registry mock TDZ-safe, and Confetti is null-stubbed
 * because jsdom has no canvas.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-current-class-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Current Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for timer current className test.",
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

describe("PlayPage timer inner play-timer-current className (W1421)", () => {
  it("renders className=\"play-timer-current\" on the inner readout span while playing", async () => {
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

    const current = screen.getByTestId("play-timer-current");
    expect(current.getAttribute("class")).toBe("play-timer-current");
  });
});

void React;

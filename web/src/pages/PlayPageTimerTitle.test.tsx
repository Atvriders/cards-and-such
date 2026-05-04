/**
 * Unit test for the PlayPage header timer `title` attribute (W1317).
 *
 * The toolbar `play-timer` <span> renders a `title` tooltip whose value
 * flips between "Elapsed time" (playing) and "Paused" (paused). Existing
 * timer tests cover the className modifier, aria-label suffix, presence /
 * absence across phases, and the 1Hz tick — but NOT the native `title`
 * attribute that supplies the desktop tooltip. This test pins the
 * un-paused "Elapsed time" string so a future refactor can't silently
 * drop the tooltip wiring without flagging.
 *
 * Harness mirrors `PlayPage.timerTick.test.tsx`: a hoisted fixture
 * plugin keeps the registry mock TDZ-safe, and Confetti is null-stubbed
 * because jsdom has no canvas.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-title-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for timer title attribute test.",
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

describe("PlayPage timer title attribute (W1317)", () => {
  it("renders title=\"Elapsed time\" on the play-timer span while playing", async () => {
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
    expect(timer.getAttribute("title")).toBe("Elapsed time");
  });
});

void React;

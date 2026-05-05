/**
 * Unit test for the PlayPage progress-row className (W1901).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2215) renders the progress row, when the game is in
 *   the "playing" phase and `deriveProgress(state)` returns a non-null value,
 *   as
 *     `<div className="play-progress-row" data-testid="play-progress" ...>`.
 *
 *   The bare `play-progress-row` class is what the play stylesheet uses to
 *   space the progress bar above the game board. A regression that dropped
 *   or renamed this class — or that switched it for a different layout
 *   modifier — would still satisfy any structural / role-based PlayPage
 *   tests, since none of them anchor this element's *own* className.
 *
 *   This test pins exactly that single attribute by exact-equality so a
 *   styling regression on the play-progress wrapper is caught at the unit
 *   level.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — uses round/maxRounds so deriveProgress(state) returns a
// non-null value, which is required for the play-progress wrapper to render.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "play-progress-class-fixture";
  type State = { seed: number; round: number; maxRounds: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Progress className fixture",
    category: "arcade" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the play-progress className test.",
    settings: {} as Record<string, never>,
    initialState: (seed: number): State => ({
      seed,
      round: 1,
      maxRounds: 5,
    }),
    reducer: (s: State): State => s,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
  // Pre-mark the tutorial as seen so a first-run coachmark cannot intercept
  // the start-game click.
  localStorage.setItem(
    "cards-tutorial-seen",
    JSON.stringify({ [hoisted.TEST_GAME_ID]: true }),
  );
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage play-progress wrapper className (W1901)", () => {
  it("renders the play-progress row with className 'play-progress-row'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // play-progress only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const progress = screen.getByTestId("play-progress");
    // Pin the className exactly — no extra modifier classes are expected on
    // this wrapper element.
    expect(progress.className).toBe("play-progress-row");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

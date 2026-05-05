/**
 * Unit test for the PlayPage play-progress wrapper tagName (W1975).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2218) renders the progress row, when the game is in
 *   the "playing" phase and `deriveProgress(state)` returns a non-null value,
 *   as
 *     `<div className="play-progress-row" data-testid="play-progress" ...>`.
 *
 *   W1901 already pins this element's className ("play-progress-row") and
 *   W1937 pins the inner progress-bar label tagName ("SPAN"), but no test
 *   asserts the *outer* wrapper's tagName. A regression that swapped the
 *   wrapper to a <section>, <span>, or other element would still satisfy
 *   the existing className assertion (className is shared across all
 *   HTMLElements) but would silently break the block-level flex layout
 *   the play stylesheet expects on the row.
 *
 *   This test pins exactly that single attribute — the literal "DIV"
 *   tagName (uppercase per the DOM spec for HTML elements) on the
 *   play-progress wrapper.
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
  const TEST_GAME_ID = "play-progress-tag-fixture";
  type State = { seed: number; round: number; maxRounds: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Progress tagName fixture",
    category: "arcade" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the play-progress wrapper tagName test.",
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

describe("PlayPage play-progress wrapper tagName (W1975)", () => {
  it("renders the play-progress row as a <div> element", async () => {
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
    // Pin exactly the tagName — uppercase per the DOM spec for HTML elements.
    expect(progress.tagName).toBe("DIV");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

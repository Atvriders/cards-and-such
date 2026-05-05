/**
 * Unit test for the PlayPage play-progress wrapper having no `tabindex`
 * attribute (W2304).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2218) renders the progress row, when the game is in
 *   the "playing" phase and `deriveProgress(state)` returns a non-null value,
 *   as
 *     `<div className="play-progress-row" data-testid="play-progress" ...>`.
 *
 *   The wrapper is a presentational container around the inner ProgressBar
 *   component — it is not focusable, never receives keyboard focus, and is
 *   not a tab stop. It must not carry a `tabindex` attribute. A regression
 *   that added `tabIndex={...}` (e.g. to make the row programmatically
 *   focusable for scroll-into-view) would silently insert an extra tab stop
 *   into the play surface and would still pass any class- / testid- /
 *   id-based assertion on the wrapper.
 *
 *   This test pins exactly that single attribute absence so a tabindex-
 *   related regression on the play-progress wrapper is caught at the unit
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
  const TEST_GAME_ID = "play-progress-no-tabindex-fixture";
  type State = { seed: number; round: number; maxRounds: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Progress no-tabindex fixture",
    category: "arcade" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the play-progress no-tabindex test.",
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

describe("PlayPage play-progress wrapper has no tabindex attribute (W2304)", () => {
  it("renders the play-progress row without a `tabindex` attribute", async () => {
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
    expect(progress.hasAttribute("tabindex")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

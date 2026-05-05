/**
 * Unit test for the PlayPage play-progress inner label tagName (W1937).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2215) mounts a <ProgressBar> inside the
 *   `<div data-testid="play-progress" ...>` wrapper while the game is in the
 *   "playing" phase and `deriveProgress(state)` returns a non-null value.
 *
 *   ProgressBar (web/src/platform/ProgressBar.tsx) renders the human-readable
 *   `label` prop ("Round X / Y" for this fixture) inside a <span> element
 *   tagged with `data-testid="play-progress-bar-label"`.
 *
 *   That tagName is load-bearing: the surrounding flex layout assumes an
 *   inline span; swapping it for a <p> or <h*> would change baseline alignment
 *   and accessible reading order. W1901 already pins the OUTER play-progress
 *   wrapper className, but no existing test pins the INNER label element.
 *
 *   This test pins exactly that — the tagName of the play-progress inner
 *   label — so a structural regression on this element is caught at the unit
 *   level.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — uses round/maxRounds so deriveProgress(state) returns a
// non-null value, which is required for the play-progress bar to render
// (and thus for its inner label to exist in the DOM).
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "play-progress-label-tag-fixture";
  type State = { seed: number; round: number; maxRounds: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Progress label tagName fixture",
    category: "arcade" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the play-progress label tagName test.",
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

describe("PlayPage play-progress inner label tagName (W1937)", () => {
  it("renders the play-progress bar's inner label as a <span> element", async () => {
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

    // Sanity-check: the outer wrapper exists so we know we're past setup.
    screen.getByTestId("play-progress");

    // The inner label carries `${testId}-label`; PlayPage passes
    // testId="play-progress-bar", so the label's testid is
    // "play-progress-bar-label".
    const label = screen.getByTestId("play-progress-bar-label");

    // Pin exactly the tagName — uppercase per the DOM spec for HTML elements.
    expect(label.tagName).toBe("SPAN");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

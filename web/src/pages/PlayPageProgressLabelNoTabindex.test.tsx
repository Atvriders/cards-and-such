/**
 * Unit test for the PlayPage play-progress inner label tabindex absence (W2310).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2215) mounts a <ProgressBar> inside the
 *   `<div data-testid="play-progress" ...>` wrapper while the game is in the
 *   "playing" phase and `deriveProgress(state)` returns a non-null value.
 *
 *   ProgressBar (web/src/platform/ProgressBar.tsx) renders the human-readable
 *   `label` prop inside a <span> tagged with
 *   `data-testid="play-progress-bar-label"`. That span is decorative
 *   typography — it should NOT participate in the keyboard tab order, so the
 *   element must not carry a `tabindex` attribute (neither tabindex=0 to add
 *   it to the tab sequence, nor tabindex=-1 to make it programmatically
 *   focusable). A regression that adds either would either:
 *     - break expected tab navigation by injecting a non-interactive stop, or
 *     - imply the label is a focus target for screen-reader/scripted focus
 *       calls that don't exist.
 *
 *   No existing test asserts the absence of `tabindex` on this element
 *   (PlayPageProgressLabelTag pins the tagName but says nothing about
 *   tabindex), so this test pins exactly that single attribute presence.
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
  const TEST_GAME_ID = "play-progress-label-no-tabindex-fixture";
  type State = { seed: number; round: number; maxRounds: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Progress label tabindex absence fixture",
    category: "arcade" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the play-progress label tabindex-absence test.",
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

describe("PlayPage play-progress inner label tabindex absence (W2310)", () => {
  it("does not set a tabindex attribute on the play-progress bar label", async () => {
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

    const label = screen.getByTestId("play-progress-bar-label");

    // Pin the absence of the tabindex attribute. We use hasAttribute rather
    // than getAttribute so the assertion fails identically whether a
    // regression introduces tabindex="0", tabindex="-1", or any other value.
    expect(label.hasAttribute("tabindex")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

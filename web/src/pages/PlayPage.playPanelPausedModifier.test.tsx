/**
 * Structural test for the PlayPage `.play-panel--paused` modifier class
 * applied to the active play surface during the paused state (W1131).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2524) renders the active play surface inside a
 *   `<section className="play-panel play-board">`. While the playing
 *   phase is `paused`, the className template appends a third token —
 *   ` play-panel--paused` — which is the BEM-style modifier the
 *   PlayPage.css ruleset uses to dim/blur the underlying board behind
 *   the paused overlay. None of the existing pause/structural tests
 *   pin this modifier class: an exhaustive grep for
 *   `play-panel--paused` across the test suite returns zero hits.
 *   Without coverage, dropping the modifier (or renaming it) leaves
 *   the board fully visible during a pause with zero runtime errors —
 *   a silent visual regression.
 *
 *   This test fills that gap with the minimum surface: render → start
 *   → click pause → assert the section now carries
 *   `play-panel--paused` (and click again → assert the modifier is
 *   gone). Mirrors the pause-toggle pattern used by
 *   PlayPage.pause.test.tsx, but asserts the *className contract* on
 *   the play-panel itself rather than the overlay's presence.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "play-panel-paused-modifier-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Play Panel Paused Modifier Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the play-panel--paused modifier test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
      </div>
    ),
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
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage .play-panel--paused modifier (W1131)", () => {
  it("toggles the play-panel--paused class on the play surface section when paused/resumed", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup so the playing phase mounts the .play-panel
    // section and the toolbar's pause button.
    fireEvent.click(screen.getByTestId("start-game"));

    const panel = container.querySelector(".play-panel.play-board");
    expect(panel).not.toBeNull();

    // While playing, the modifier must NOT be present — the className
    // template only appends it when `paused` is truthy.
    expect(panel?.classList.contains("play-panel--paused")).toBe(false);

    // Click pause — the modifier class must now appear on the same
    // section element. This is the contract the CSS dim/blur rules
    // hook into; dropping it is a silent visual regression.
    fireEvent.click(screen.getByTestId("play-pause-btn"));
    expect(panel?.classList.contains("play-panel--paused")).toBe(true);
    // Sanity: the base classes are preserved, only the modifier was added.
    expect(panel?.classList.contains("play-panel")).toBe(true);
    expect(panel?.classList.contains("play-board")).toBe(true);

    // Click resume — the modifier class must be removed again.
    fireEvent.click(screen.getByTestId("play-pause-btn"));
    expect(panel?.classList.contains("play-panel--paused")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

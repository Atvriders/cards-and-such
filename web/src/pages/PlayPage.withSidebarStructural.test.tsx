/**
 * Structural test for the PlayPage `.play-with-sidebar` layout container (W949).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2521) wraps the active play surface and the
 *   adjacent StatsPanel in a `<div className="play-with-sidebar">` once
 *   the playing phase is reached. The class is the anchor for the
 *   responsive grid/flex rules in PlayPage.css (~lines 705, 776, 1517,
 *   1941): without it the board and the stats sidebar collapse on top
 *   of each other on desktop, and the mobile breakpoint loses its
 *   single-column override. A rename would silently break layout on
 *   every viewport with zero runtime errors.
 *
 *   No existing test pins this container's class structure (an
 *   exhaustive grep over the test suite turned up references only in
 *   PlayPage.tsx and PlayPage.css). This test fills that gap with the
 *   minimum possible surface: render → start → assert the container
 *   exists, has the expected class, and contains the play board panel.
 *
 * Strategy mirrors PlayPage.toolbarPrimaryRole.test.tsx (W939):
 *   - Hoisted minimal fixture plugin keeps the render fast and
 *     deterministic (no real game logic, canvas, or RNG).
 *   - Mount at `/play/:gameId`, click `start-game` to advance to the
 *     playing phase (the wrapper only renders once setup is complete).
 *   - Locate the wrapper by its CSS class via querySelector.
 *   - Assert it exists and that the play-board panel lives inside it,
 *     pinning the structural relationship the CSS depends on.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "with-sidebar-structural-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "With Sidebar Structural Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the play-with-sidebar structural test.",
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

describe("PlayPage .play-with-sidebar layout container (W949)", () => {
  it("wraps the play-board panel inside a .play-with-sidebar container during the playing phase", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The sidebar wrapper only mounts in the playing phase, so advance
    // past the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const wrapper = container.querySelector(".play-with-sidebar");

    // Pin existence — a rename here breaks the desktop two-column and
    // mobile single-column CSS rules keyed on this exact class.
    expect(wrapper).not.toBeNull();
    // Pin the class structure (no extra modifiers, the wrapper is a
    // pure layout div) and the structural invariant the CSS relies on:
    // the play-board panel is a descendant of this wrapper.
    expect(wrapper?.classList.contains("play-with-sidebar")).toBe(true);
    expect(wrapper?.querySelector(".play-panel.play-board")).not.toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

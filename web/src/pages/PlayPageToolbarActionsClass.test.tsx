/**
 * Unit test for the PlayPage `.play-header-actions` toolbar wrapper class
 * (W1300).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1786) renders `<div className="play-header-actions">`
 *   as the second child of the `.play-header` element. This wrapper
 *   surrounds the entire iconbar cluster — timer, pause, seed picker,
 *   primary toolbar group, overflow toggle, secondary toolbar group, and
 *   the back-to-lobby link. The class is the sole anchor for the
 *   action-cluster CSS in PlayPage.css covering its flex layout, gap,
 *   wrap behavior, alignment, and responsive collapse below 600px.
 *
 *   Many individual buttons inside this wrapper are pinned by other
 *   tests (timer, pause, undo, hint, restart, overflow, seed picker,
 *   etc.), and the inner primary/secondary groups have their own
 *   role/structural tests. The wrapper itself has no test: an exhaustive
 *   grep across `web/src/pages/*.test.tsx` finds zero references to the
 *   `play-header-actions` class. A rename or removal would silently
 *   detach every action-cluster CSS rule with no runtime failure.
 *
 * Strategy mirrors PlayPage.headerStructural.test.tsx (W959):
 *   - Hoisted minimal fixture plugin keeps the render fast and
 *     deterministic (no real game logic, canvas, or RNG).
 *   - Mount at `/play/:gameId`. The wrapper renders unconditionally —
 *     it appears in setup as well as playing — so no phase advance is
 *     required.
 *   - Locate the wrapper by its CSS class via querySelector.
 *   - Pin the single observable attribute the CSS depends on: the
 *     `play-header-actions` class on a `<div>` that is a direct child of
 *     the `.play-header` element.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "toolbar-actions-class-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Toolbar Actions Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the play-header-actions wrapper test.",
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

describe("PlayPage .play-header-actions toolbar wrapper class (W1300)", () => {
  it("renders a .play-header-actions div as a direct child of .play-header", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    const { container } = render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const header = container.querySelector(".play-header");
    const actions = container.querySelector(".play-header-actions");

    // Pin existence — a rename here detaches every action-cluster rule
    // in PlayPage.css (flex layout, gap, wrap, responsive collapse).
    expect(header).not.toBeNull();
    expect(actions).not.toBeNull();
    // Pin the element type: a plain `<div>` (no semantic role); the CSS
    // selector keys off the bare class on a div container.
    expect(actions?.tagName).toBe("DIV");
    expect(actions?.classList.contains("play-header-actions")).toBe(true);
    // Pin the structural relationship: the actions wrapper is a direct
    // child of the `.play-header` element. The CSS cascade for the
    // action cluster relies on this exact nesting.
    expect(actions?.parentElement).toBe(header);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

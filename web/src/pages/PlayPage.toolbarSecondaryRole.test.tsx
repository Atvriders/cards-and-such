/**
 * Unit test for the PlayPage secondary toolbar group ARIA role contract (W929).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2079) renders a `<div data-testid=
 *   "play-toolbar-secondary">` that wraps the lower-frequency actions
 *   (share / friend / help / settings / setup / fullscreen). On phones
 *   this group is collapsed behind a ••• overflow button; on
 *   tablet/desktop it renders inline. The container carries
 *   `role="menu"` so assistive tech announces the grouped icon-only
 *   buttons as a coherent menu rather than a soup of unlabeled icons.
 *
 *   No existing test pins the `role="menu"` attribute on this
 *   container, so a regression that dropped the role (e.g. changing it
 *   to `role="group"`, `role="toolbar"`, or removing it entirely) would
 *   ship without any test failing — silently degrading the screen-
 *   reader experience for every player on every game.
 *
 * Strategy mirrors PlayPage.headerHelpButton.test.tsx (W914):
 *   - Hoisted minimal fixture plugin keeps the render fast and
 *     deterministic (no real game logic, canvas, or RNG).
 *   - Mount at `/play/:gameId`, click `start-game` to advance to the
 *     playing phase (the toolbar only renders once setup is complete).
 *   - Locate the secondary toolbar via its testid.
 *   - Pin a single attribute: `role === "menu"`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "toolbar-secondary-role-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Toolbar Secondary Role Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the secondary-toolbar role test.",
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

describe("PlayPage secondary toolbar group ARIA role contract (W929)", () => {
  it("exposes the secondary toolbar wrapper as role='menu' for assistive tech", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The secondary toolbar only mounts in the playing phase, so advance
    // past the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const secondary = screen.getByTestId("play-toolbar-secondary");

    // Pin the ARIA role contract — the only test that does so. Dropping
    // or changing this role would silently regress how screen readers
    // announce the grouped icon-only buttons inside.
    expect(secondary.getAttribute("role")).toBe("menu");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

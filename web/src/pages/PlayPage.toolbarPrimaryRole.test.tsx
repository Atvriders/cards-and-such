/**
 * Unit test for the PlayPage primary toolbar group ARIA role contract (W939).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1960) renders a `<div data-testid=
 *   "play-toolbar-primary">` that wraps the high-frequency in-game
 *   actions (undo / redo / hint / restart). Unlike the secondary group
 *   (W929 — `role="menu"`), the primary group is intentionally
 *   *unrolled*: it carries no `role` attribute. These buttons are
 *   always visible on every viewport and announce themselves
 *   individually via their own `aria-label`s; wrapping them in
 *   `role="menu"` would force screen readers to announce them as a
 *   menu and require arrow-key navigation, which conflicts with the
 *   `Ctrl+Z` / dedicated keyboard shortcuts the buttons advertise.
 *
 *   No existing test pins this contract. A regression that added
 *   `role="menu"` (mirroring the secondary group by mistake) or
 *   `role="toolbar"` to the primary wrapper would silently change the
 *   assistive-tech experience without any test failing.
 *
 * Strategy mirrors PlayPage.toolbarSecondaryRole.test.tsx (W929):
 *   - Hoisted minimal fixture plugin keeps the render fast and
 *     deterministic (no real game logic, canvas, or RNG).
 *   - Mount at `/play/:gameId`, click `start-game` to advance to the
 *     playing phase (the toolbar only renders once setup is complete).
 *   - Locate the primary toolbar via its testid.
 *   - Pin the single observable attribute: `role` is absent (null).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "toolbar-primary-role-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Toolbar Primary Role Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the primary-toolbar role test.",
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

describe("PlayPage primary toolbar group ARIA role contract (W939)", () => {
  it("does not assign role='menu' to the primary toolbar wrapper", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // The primary toolbar only mounts in the playing phase, so advance
    // past the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const primary = screen.getByTestId("play-toolbar-primary");

    // Pin the ARIA role contract — the primary wrapper deliberately
    // carries no role, distinct from the secondary group's `role="menu"`
    // (W929). Adding any role here would change how AT announces the
    // always-visible undo/redo/hint/restart cluster.
    expect(primary.getAttribute("role")).toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

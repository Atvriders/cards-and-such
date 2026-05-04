/**
 * Unit test for the PlayPage primary toolbar group's shared base className
 * (W1360).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1960) renders the primary toolbar wrapper with
 *   two classes: `play-toolbar-group play-toolbar-primary`. The first
 *   token is the SHARED base class — both the primary and secondary
 *   toolbar groups carry it (PlayPage.tsx ~line 2081 mirrors it for
 *   secondary). PlayPage.css (~line 79) hangs the group's flex layout,
 *   gap, alignment, and wrap behavior off `.play-toolbar-group` — the
 *   variant-specific classes only tweak overrides on top of that base.
 *
 *   Existing tests pin the variant tokens individually:
 *     - W939 toolbarPrimaryRole: pins `data-testid="play-toolbar-primary"`
 *       (and the absent `role` attribute).
 *     - W929 toolbarSecondaryRole: pins `role="menu"` and the
 *       `play-toolbar-secondary` testid on the sibling group.
 *   Neither test asserts the SHARED `play-toolbar-group` token. An
 *   exhaustive grep across `web/src/pages/*.test.tsx` finds zero
 *   references to that class. A rename or accidental removal of the
 *   base token would silently detach every group-layout CSS rule from
 *   the primary cluster (squashing undo / redo / hint / restart into a
 *   default block layout) with no runtime failure.
 *
 * Strategy mirrors PlayPage.toolbarPrimaryRole.test.tsx (W939):
 *   - Hoisted minimal fixture plugin keeps the render fast and
 *     deterministic (no real game logic, canvas, or RNG).
 *   - Mount at `/play/:gameId`, click `start-game` to advance to the
 *     playing phase (the toolbar only renders once setup is complete).
 *   - Locate the primary toolbar via its testid.
 *   - Pin the single observable attribute: the wrapper's classList
 *     contains both `play-toolbar-group` (shared base) AND
 *     `play-toolbar-primary` (variant) tokens.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "toolbar-primary-group-class-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Toolbar Primary Group Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the primary-toolbar shared-base-class test.",
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

describe("PlayPage primary toolbar group shared-base className (W1360)", () => {
  it("carries the shared 'play-toolbar-group' base class alongside the 'play-toolbar-primary' variant", async () => {
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

    // Pin the shared base token — the CSS group-layout rule
    // (`.play-toolbar-group { ... }` in PlayPage.css ~line 79) keys off
    // exactly this class. Removing it would visually break the primary
    // cluster without breaking any existing test.
    expect(primary.classList.contains("play-toolbar-group")).toBe(true);
    // Pin the variant token alongside it — this guards against an
    // accidental "swap" regression where one class is renamed in place
    // of the other instead of co-existing.
    expect(primary.classList.contains("play-toolbar-primary")).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

/**
 * Unit test for the PlayPage secondary toolbar group's shared base
 * className (W1404).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2081) renders the secondary (overflow-collapsed)
 *   toolbar wrapper with two classes: `play-toolbar-group
 *   play-toolbar-secondary`. The first token is the SHARED base class —
 *   it is the same token that the primary group (~line 1960) carries
 *   so PlayPage.css (~line 79) can hang the group's flex layout, gap,
 *   alignment, and wrap behavior off a single rule. The variant token
 *   (`play-toolbar-secondary`) only layers overrides on top.
 *
 *   Existing tests pin neighbouring contracts on this same wrapper:
 *     - W929 toolbarSecondaryRole: pins `role="menu"` on the wrapper.
 *     - W1016 overflowMenuContent / overflowBtnToggle / overflowClose /
 *       overflowOutsideClick: drive the `data-overflow-open` attribute
 *       and the children rendered inside the wrapper.
 *     - W1360 toolbarPrimaryGroupClass: pins the shared `play-toolbar-
 *       group` base on the SIBLING (primary) group only.
 *   None of those tests asserts the className contract on the
 *   SECONDARY group. A rename or accidental drop of either token here
 *   (e.g. dropping the shared base, or swapping the variant for the
 *   primary variant) would silently detach the secondary cluster from
 *   the shared layout rule — share/friend/help/settings would reflow
 *   into a default block stack on phones — with zero runtime failure
 *   and no existing test catching it.
 *
 * Strategy mirrors PlayPageToolbarPrimaryGroupClass.test.tsx (W1360):
 *   - Hoisted minimal fixture plugin keeps the render fast and
 *     deterministic (no real game logic, canvas, or RNG).
 *   - Mount at `/play/:gameId`, click `start-game` to advance to the
 *     playing phase (the toolbar only renders once setup is complete).
 *   - Locate the secondary toolbar via its testid.
 *   - Pin both classList tokens: the shared base AND the variant must
 *     co-exist on the wrapper.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "toolbar-secondary-group-class-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Toolbar Secondary Group Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the secondary-toolbar shared-base-class test.",
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

describe("PlayPage secondary toolbar group shared-base className (W1404)", () => {
  it("carries the shared 'play-toolbar-group' base class alongside the 'play-toolbar-secondary' variant", async () => {
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

    // Pin the shared base token — the CSS group-layout rule
    // (`.play-toolbar-group { ... }` in PlayPage.css ~line 79) keys off
    // exactly this class. Removing it would visually break the
    // secondary (overflow) cluster without breaking any existing test.
    expect(secondary.classList.contains("play-toolbar-group")).toBe(true);
    // Pin the variant token alongside it — this guards against an
    // accidental "swap" regression where the variant is renamed (or
    // confused with the primary variant) instead of co-existing with
    // the shared base.
    expect(secondary.classList.contains("play-toolbar-secondary")).toBe(true);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

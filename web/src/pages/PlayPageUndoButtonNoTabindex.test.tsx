/**
 * Unit test for the PlayPage primary-toolbar undo button's lack of an
 * explicit `tabindex` attribute (W2291).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1962-1983) renders the undo button as a native
 *   `<button data-testid="play-undo-btn">` with `type`, `className`,
 *   `onClick`, `disabled`, `title`, `aria-label`, `aria-keyshortcuts`,
 *   and `data-tooltip` — but deliberately NO `tabindex` attribute. Native
 *   `<button>` elements are already in the natural keyboard tab order
 *   (tabindex 0 by default), so any explicit `tabindex` would be either
 *   redundant (tabindex="0") or actively harmful (tabindex="-1" pulls the
 *   primary undo affordance out of keyboard navigation, breaking
 *   accessibility for keyboard-only / screen-reader users; positive
 *   values disrupt the document's natural tab order). No existing
 *   PlayPage test pins this absence, so a drive-by refactor that adds
 *   `tabIndex={-1}` to "tidy up focus" or `tabIndex={0}` for "explicitness"
 *   would slip past all current coverage.
 *
 * Strategy:
 *   - Hoisted minimal counter fixture so the games registry resolves
 *     cleanly without dragging in a real game's render path.
 *   - Mount at `/play/:gameId`, click `start-game` to enter
 *     `phase === "playing"` (the undo button is gated on that phase),
 *     then look up the undo button by its testid and assert
 *     `btn.hasAttribute("tabindex") === false`. `hasAttribute` is used
 *     instead of reading `tabIndex` because the latter coerces missing
 *     values to the implicit default (0 for `<button>`), which would
 *     mask an explicit `tabIndex={0}` regression.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture — vi.hoisted runs before vi.mock factories
// evaluate, so the registry mock below can close over `fixturePlugin`.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "undo-button-no-tabindex-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Undo Button No Tabindex Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the undo-button-no-tabindex test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, a: Action): State =>
      a.type === "inc" ? { count: s.count + 1 } : s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div data-testid="fx-count">{state.count}</div>
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

describe("PlayPage primary-toolbar undo button has no tabindex attribute (W2291)", () => {
  it("does not render an explicit `tabindex` attribute on the undo button so the native <button> default tab order is preserved and keyboard accessibility cannot be inadvertently broken", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // primary-toolbar undo button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-undo-btn") as HTMLButtonElement;

    // Precise contract — `hasAttribute("tabindex")` is false iff no
    // `tabindex` attribute is present in the rendered DOM. Reading
    // `btn.tabIndex` directly would return `0` (the implicit default
    // for `<button>`) regardless of whether the attribute was set, so
    // it could not distinguish "absent" from `tabIndex={0}`.
    expect(btn.hasAttribute("tabindex")).toBe(false);
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

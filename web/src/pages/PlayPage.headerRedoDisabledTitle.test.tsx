/**
 * Unit test for the PlayPage primary-toolbar redo button disabled-state
 * `title` branch (W1140).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1991) renders the redo button's `title` as a
 *   ternary on `redoStack.length === 0`:
 *
 *       title={redoStack.length === 0
 *         ? "Nothing to redo"
 *         : "Redo (Ctrl+Shift+Z / Ctrl+Y)"}
 *
 *   The truthy (non-empty) branch is exercised indirectly by W923
 *   (PlayPage.headerRedoButton) and by W208 (PlayPage.redoButton) which
 *   prime the redo stack via an inc → undo cycle. The *falsy* branch —
 *   i.e. the empty-stack disabled-state title "Nothing to redo" that
 *   surfaces as the native browser tooltip when the user hovers a
 *   disabled redo button — has zero test coverage. A regression that
 *   dropped the title entirely, swapped it for the active-state copy
 *   (so disabled + non-disabled hover became indistinguishable), or
 *   localized the string out of sync with the rest of the toolbar would
 *   slip past every existing PlayPage test.
 *
 *   This is the redo counterpart of the analogous undo-disabled-title
 *   coverage; the two branches are symmetric in PlayPage.tsx (the undo
 *   button at ~line 1969 uses the same ternary shape).
 *
 * Strategy:
 *   - Hoisted minimal counter fixture so the registry resolves cleanly.
 *   - Mount at `/play/:gameId`, click `start-game` to enter the playing
 *     phase so the redo button mounts.
 *   - Without performing any inc/undo, the redoStack is empty by
 *     construction — exactly the falsy-branch precondition we want to
 *     pin.
 *   - Assert `disabled === true` (sanity-pin so a future regression that
 *     swapped the disabled gating wouldn't masquerade as a title-only
 *     change) and `title === "Nothing to redo"`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture — vi.hoisted runs before vi.mock factories evaluate
// so the registry mock below can close over `fixturePlugin`.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-redo-disabled-title-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Redo Disabled Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the redo disabled-title test.",
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

describe("PlayPage primary-toolbar redo button disabled-state title (W1140)", () => {
  it("renders title='Nothing to redo' while redoStack is empty (the falsy branch of the title ternary)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=7`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // primary-toolbar redo button mounts. No inc/undo is performed, so
    // the redo stack remains empty — the precondition for the falsy
    // branch of the title ternary.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-redo-btn") as HTMLButtonElement;

    // Sanity-pin: the redo button is disabled when the stack is empty.
    // Without this, a regression that broke the gating (e.g. flipping
    // `disabled` to a constant `false`) could still leave the title
    // assertion passing if "Nothing to redo" leaked into the active
    // branch — that would be a different bug we don't want to mask.
    expect(btn.disabled).toBe(true);

    // Title contract for the falsy (empty redoStack) branch — the
    // native-browser tooltip on a disabled redo button. Drift to
    // "Redo (Ctrl+Shift+Z / Ctrl+Y)" (the active-branch copy) or to a
    // bare empty string would make the disabled and active hover states
    // indistinguishable to sighted users.
    expect(btn.getAttribute("title")).toBe("Nothing to redo");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

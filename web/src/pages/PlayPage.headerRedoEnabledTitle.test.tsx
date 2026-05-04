/**
 * Unit test for the PlayPage primary-toolbar redo button enabled-state
 * `title` branch (W1152).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1991) renders the redo button's `title` as a
 *   ternary on `redoStack.length === 0`:
 *
 *       title={redoStack.length === 0
 *         ? "Nothing to redo"
 *         : "Redo (Ctrl+Shift+Z / Ctrl+Y)"}
 *
 *   The falsy (empty redoStack) branch — "Nothing to redo" — is pinned
 *   by W1140 (PlayPage.headerRedoDisabledTitle). The truthy (non-empty
 *   redoStack) branch — "Redo (Ctrl+Shift+Z / Ctrl+Y)" — is exercised
 *   only incidentally by W923 (header redo button) and W208 (redo
 *   click), neither of which inspects the `title` attribute. A
 *   regression that dropped the hotkey hint (e.g. "Redo"), reordered
 *   the combos ("Ctrl+Y / Ctrl+Shift+Z"), or accidentally substituted
 *   the disabled-branch copy ("Nothing to redo" leaking into the
 *   enabled state) would slip past every existing PlayPage test.
 *
 *   This is the redo counterpart of the analogous undo-enabled-title
 *   coverage (W1151); the two branches are symmetric in PlayPage.tsx
 *   (the undo button at ~line 1969 uses the same ternary shape).
 *
 * Strategy:
 *   - Hoisted minimal counter fixture whose reducer returns a fresh
 *     object on "inc" so PlayPage's `next !== s` guard pushes an undo
 *     frame. Returning the same reference would silently drop the
 *     frame and the redo stack would never become non-empty.
 *   - Mount at `/play/:gameId`, click `start-game` to enter the playing
 *     phase so the redo button mounts.
 *   - Dispatch one inc → click `play-undo-btn` so exactly one frame
 *     parks on the redo stack — the precondition for the truthy branch
 *     of the title ternary.
 *   - Sanity-pin `disabled === false` (so a regression that broke the
 *     gating — e.g. flipping `disabled` to a constant `true` — wouldn't
 *     mask a title-only assertion) and assert `title === "Redo
 *     (Ctrl+Shift+Z / Ctrl+Y)"`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture — vi.hoisted runs before vi.mock factories evaluate
// so the registry mock below can close over `fixturePlugin`. The reducer
// returns a fresh object on "inc" so the undo frame is actually pushed.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-redo-enabled-title-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Redo Enabled Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the redo enabled-title test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, a: Action): State =>
      a.type === "inc" ? { count: s.count + 1 } : s,
    isTerminal: () => null,
    component: ({
      state,
      dispatch,
    }: {
      state: State;
      dispatch: (a: Action) => void;
    }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
        <button
          data-testid="fx-inc"
          type="button"
          onClick={() => dispatch({ type: "inc" })}
        >
          inc
        </button>
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

describe("PlayPage primary-toolbar redo button enabled-state title (W1152)", () => {
  it("renders title='Redo (Ctrl+Shift+Z / Ctrl+Y)' once redoStack has a parked frame (the truthy branch of the title ternary)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=7`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // primary-toolbar redo button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Prime the redo stack: one inc dispatch parks a frame on the undo
    // stack; clicking the undo button pops it and parks it on the redo
    // stack. After this, redoStack.length === 1, the precondition for
    // the truthy branch of the title ternary.
    fireEvent.click(screen.getByTestId("fx-inc"));
    fireEvent.click(screen.getByTestId("play-undo-btn"));

    const btn = screen.getByTestId("play-redo-btn") as HTMLButtonElement;

    // Sanity-pin: the redo button is enabled when the stack is non-
    // empty. Without this, a regression that broke the gating (e.g.
    // hard-coding `disabled={true}`) could still leave the title
    // assertion passing on a button users can never actually invoke.
    expect(btn.disabled).toBe(false);

    // Title contract for the truthy (non-empty redoStack) branch — the
    // native-browser tooltip surfaces the hotkey hint to sighted users
    // who hover the enabled redo button. Drift to "Nothing to redo"
    // (the disabled-branch copy), to a bare "Redo", or to a reordered
    // hotkey list ("Ctrl+Y / Ctrl+Shift+Z") would degrade the hover
    // discovery contract.
    expect(btn.getAttribute("title")).toBe("Redo (Ctrl+Shift+Z / Ctrl+Y)");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

/**
 * Unit test for the PlayPage primary-toolbar undo button enabled-state
 * `title` branch (W1151).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1967) renders the undo button's `title` as a
 *   ternary on `undoStack.length === 0`:
 *
 *       title={undoStack.length === 0
 *         ? "Nothing to undo"
 *         : "Undo (Ctrl+Z)"}
 *
 *   The falsy (empty-stack) branch — "Nothing to undo" — is now pinned by
 *   W1147 (PlayPage.headerUndoDisabledTitle.test.tsx). The *truthy*
 *   (non-empty stack) branch — "Undo (Ctrl+Z)" — has zero direct coverage.
 *   It is the native browser tooltip the user reads on hover when the undo
 *   button is enabled, and it is the only place in the toolbar UI that
 *   surfaces the "Ctrl+Z" hotkey hint to sighted desktop users (the
 *   `aria-keyshortcuts` attribute pinned by W934 is screen-reader-only).
 *   A regression that dropped the keystroke hint, swapped it for the
 *   disabled copy "Nothing to undo" (so enabled and disabled hovers became
 *   indistinguishable), or localized the string out of sync with the rest
 *   of the toolbar would slip past every existing PlayPage test.
 *
 * Strategy:
 *   - Hoisted minimal counter fixture whose component exposes a dispatch
 *     button so we can drive a single reducer action from the test —
 *     enough to push one entry onto the undo stack and flip the title
 *     ternary into its truthy branch.
 *   - Mount at `/play/:gameId`, click `start-game` to enter the playing
 *     phase, then click the fixture's dispatch button so the undoStack
 *     becomes non-empty.
 *   - Assert `disabled === false` (sanity-pin so a future regression that
 *     froze the gating to a constant `true` couldn't masquerade as a
 *     title-only change) and `title === "Undo (Ctrl+Z)"`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted counter fixture — vi.hoisted runs before vi.mock factories evaluate
// so the registry mock below can close over `fixturePlugin`. The component
// renders a dispatch trigger so the test can push one action onto the
// undoStack without reaching into PlayPage internals.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-undo-enabled-title-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Undo Enabled Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only counter plugin for the undo enabled-title test.",
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

describe("PlayPage primary-toolbar undo button enabled-state title (W1151)", () => {
  it("renders title='Undo (Ctrl+Z)' once the undoStack is non-empty (the truthy branch of the title ternary)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=7`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // primary-toolbar undo button mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    // Dispatch one reducer action via the fixture's button. PlayPage's
    // dispatch wrapper snapshots prior state into undoStack on every call,
    // so this single click flips `undoStack.length === 0` from true to
    // false — the precondition for the truthy branch of the title ternary.
    fireEvent.click(screen.getByTestId("fx-inc"));

    const btn = screen.getByTestId("play-undo-btn") as HTMLButtonElement;

    // Sanity-pin: with a non-empty undoStack the button is enabled.
    // Without this, a regression that froze `disabled` to a constant
    // `true` could still leave the title assertion passing if
    // "Undo (Ctrl+Z)" leaked into the disabled branch — that would be a
    // different bug we don't want to mask.
    expect(btn.disabled).toBe(false);

    // Title contract for the truthy (non-empty undoStack) branch — the
    // native-browser tooltip surfaces the Ctrl+Z hotkey hint to sighted
    // desktop users on hover. Drift to the disabled-state copy
    // "Nothing to undo", a hotkey-less "Undo", or a stale "Cmd+Z" mac-only
    // form would all slip past every other test on this button.
    expect(btn.getAttribute("title")).toBe("Undo (Ctrl+Z)");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

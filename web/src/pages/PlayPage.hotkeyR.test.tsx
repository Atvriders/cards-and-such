/**
 * Unit test for the PlayPage "R" hotkey that replays the *current* seed (W748).
 *
 * Observable behavior:
 *   While the game is in the "playing" phase, pressing the unmodified `r`
 *   key calls `replay()` (PlayPage.tsx ~line 1575). `replay()` runs
 *   `startWithSeed(seed)` against the *active* seed, so the action count
 *   resets to 0 and the undo stack clears, but the seed is unchanged.
 *   This is the load-bearing distinction from `Shift+R`, which adopts a
 *   *new* random seed via `applyPickedSeed(randomSeed())`. Sibling tests
 *   already cover F (W736), I (W740), D (W744) and Esc, leaving R itself
 *   uncovered.
 *
 * Strategy:
 *   - Reuse the klondike-id pattern from the W744 D-hotkey test so the
 *     `seed-display` element (gated to klondike/freecell/spider) renders,
 *     giving us a direct DOM observable for the active seed. Without that
 *     gate the only "did the seed change?" signal would be a probe inside
 *     the fixture component.
 *   - Pre-seed `cards-tutorial-seen` for klondike so the auto-launched
 *     tutorial doesn't set `tutorialOpen=true` and short-circuit the
 *     window-level keydown handler.
 *   - Mount with `?seed=42` to pin a known starting seed.
 *   - Dispatch 3 "inc" actions through the fixture component (≤ 5 keeps
 *     `confirmIfInProgress` on the no-prompt fast path).
 *   - Fire `r` keydown on `window` and assert the three things that prove
 *     this is *replay* and not Shift+R: (1) seed-display still shows
 *     `#42`, (2) the fixture's count is back to 0, (3) the undo button
 *     is disabled because `setUndoStack([])` ran.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture so vi.mock factories below can reference it. vi.hoisted
// runs before the imports the factories close over.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  // Use the real klondike id so `showProminentSeed` is true and the
  // toolbar `seed-display` element renders — that's our seed observable.
  const TEST_GAME_ID = "klondike";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (R-hotkey test)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "R-hotkey test fixture — counter reducer to drive action count.",
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

// Confetti pulls in canvas APIs jsdom doesn't ship — null-stub keeps any
// stray render path side-effect-free.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
  // klondike has tutorial steps; the auto-launched tutorial would set
  // tutorialOpen=true and the hotkey handler short-circuits in that
  // state. Mark the tutorial seen so phase === "playing" really yields a
  // bare game with the window keydown handler eligible to fire.
  localStorage.setItem(
    "cards-tutorial-seen",
    JSON.stringify({ [hoisted.TEST_GAME_ID]: true }),
  );
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage R hotkey replays the current seed (W748)", () => {
  it("pressing R while playing resets state but keeps the seed unchanged", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // window-level keydown handler that owns the R binding is mounted.
    fireEvent.click(screen.getByTestId("start-game"));

    // Sanity: starting state. Seed is the URL-supplied 42, count is 0,
    // undo button is disabled (empty undo stack).
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");
    expect(screen.getByTestId("fx-count").textContent).toBe("0");
    expect(
      (screen.getByTestId("play-undo-btn") as HTMLButtonElement).disabled,
    ).toBe(true);

    // Dispatch 3 "inc" actions through the fixture component. Each click
    // bumps `actionCountRef.current` and pushes onto the undo stack.
    // Three keeps us under the >5 threshold inside `confirmIfInProgress`,
    // so `replay()` won't await a ConfirmDialog.
    const incBtn = screen.getByTestId("fx-inc");
    for (let i = 0; i < 3; i++) fireEvent.click(incBtn);
    expect(screen.getByTestId("fx-count").textContent).toBe("3");
    expect(
      (screen.getByTestId("play-undo-btn") as HTMLButtonElement).disabled,
    ).toBe(false);

    // Dispatch the unmodified R keybinding on window — `replay()` calls
    // `startWithSeed(seed)` against the *current* seed, which clears the
    // undo stack, re-installs initialState, and resets actionCountRef.
    await act(async () => {
      fireEvent.keyDown(window, { key: "r" });
      // replay() is async because of confirmIfInProgress; flush its
      // microtask so the post-await `startWithSeed(seed)` runs.
      await Promise.resolve();
    });

    // Distinguishing R from Shift+R: the seed must NOT have changed.
    // Shift+R would have called applyPickedSeed(randomSeed()) and the
    // display would show some other value.
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");
    // initialState was re-installed: count is back to 0.
    expect(screen.getByTestId("fx-count").textContent).toBe("0");
    // setUndoStack([]) inside startWithSeed cleared the ring buffer,
    // so the undo button flips back to disabled.
    expect(
      (screen.getByTestId("play-undo-btn") as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

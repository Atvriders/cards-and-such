/**
 * Unit test for the PlayPage "Shift+R" hotkey that picks a *new* random seed
 * (W753).
 *
 * Observable behavior:
 *   While the game is in the "playing" phase, pressing `r` *with* the Shift
 *   modifier calls `applyPickedSeed(randomSeed())` (PlayPage.tsx ~line 1566).
 *   `randomSeed()` returns a fresh, non-deterministic uint32, and
 *   `applyPickedSeed` synchronously routes through `startWithSeed`, so the
 *   active seed flips to the new value immediately. This is the load-bearing
 *   distinction from unmodified `R`, which keeps the seed via `replay()`.
 *   Sibling tests already cover F (W736), I (W740), D (W744), R (W748), and
 *   Esc, leaving Shift+R itself uncovered.
 *
 * Strategy:
 *   - Reuse the klondike-id pattern from the W744/W748 tests so the
 *     `seed-display` element (gated to klondike/freecell/spider) renders,
 *     giving us a direct DOM observable for the active seed.
 *   - Pre-seed `cards-tutorial-seen` for klondike so the auto-launched
 *     tutorial doesn't set `tutorialOpen=true` and short-circuit the
 *     window-level keydown handler.
 *   - Mount with `?seed=42` to pin a known starting seed so we can assert
 *     it changed.
 *   - Fire `r` keydown on `window` with `shiftKey: true` — this is the
 *     *only* difference from the W748 R test, so a green run here
 *     concretely separates the two bindings.
 *   - Assert the seed-display text is no longer `#42`. We can't predict the
 *     exact new value (it's random), but any non-`#42` value proves
 *     `applyPickedSeed(randomSeed())` ran.
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
    title: "Klondike (Shift+R-hotkey test)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Shift+R-hotkey test fixture — counter reducer is unused but keeps the plugin shape consistent with sibling tests.",
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

describe("PlayPage Shift+R hotkey picks a new random seed (W753)", () => {
  it("pressing Shift+R while playing replaces the seed with a fresh random one", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // window-level keydown handler that owns the Shift+R binding is
    // mounted.
    fireEvent.click(screen.getByTestId("start-game"));

    // Sanity: the URL-supplied seed of 42 is the active seed before we
    // press anything. If this assertion ever fails the rest of the test
    // would silently pass on a different displayed value, so we anchor
    // it explicitly.
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");

    // Dispatch the *Shift*+R keybinding on window. `applyPickedSeed` is
    // synchronous (no confirmIfInProgress await), but we still wrap in
    // act() to flush any state updates queued during the render that
    // follows the seed change.
    await act(async () => {
      fireEvent.keyDown(window, { key: "r", shiftKey: true });
      // Yield once so any post-state-update effects settle before we
      // sample the DOM.
      await Promise.resolve();
    });

    // Distinguishing Shift+R from R: the seed *must* have changed. We
    // can't predict the exact new value because randomSeed() is
    // non-deterministic, so we assert the displayed seed is no longer
    // #42. Any other value proves applyPickedSeed(randomSeed()) ran.
    const after = screen.getByTestId("seed-display").textContent ?? "";
    expect(after).toMatch(/^#\d+$/); // still a seed string, not blank
    expect(after).not.toBe("#42");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

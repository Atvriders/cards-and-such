/**
 * Unit test for the PlayPage "N" hotkey that starts a new game with a
 * fresh random seed (W788).
 *
 * Observable behavior:
 *   While the game is in the "playing" phase, pressing the unmodified `n`
 *   key calls `void newGame()` (PlayPage.tsx ~line 1561). `newGame`
 *   short-circuits the "in-progress" confirm (elapsed <= 30s and action
 *   count <= 5 at the moment we press the key) and then calls
 *   `startWithSeed(randomSeed())`, restarting the game at a new seed.
 *
 *   Sibling tests cover F (W736), I (W740), D (W744), R (W748),
 *   Shift+R (W753), T (W756), Esc (pause), and the Ctrl/Cmd+Z/Y/Shift+Z
 *   undo/redo combos, but no test exercises the N binding, leaving its
 *   "press N -> reseed via Math.random" path uncovered.
 *
 * Strategy:
 *   - Reuse the seed-picker test's mocking shape: a single "klondike"
 *     fixture so the prominent `seed-display` element (gated to
 *     klondike/freecell/spider) renders, giving us a simple observable
 *     for the active seed.
 *   - Pin `Math.random` to a constant so `randomSeed()` is deterministic.
 *     `randomSeed()` is module-local in PlayPage.tsx (`Math.floor(
 *     Math.random() * 2 ** 31)`), so we can't `vi.mock` it directly —
 *     spying on `Math.random` is the cleanest seam.
 *   - Mount with `?seed=42` so the page starts at a known seed that
 *     differs from the deterministic random one.
 *   - Dispatch the `n` key on `window` (handler attaches there) and
 *     assert `seed-display` flips from `#42` to `#<expected>`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture so vi.mock factories below can reference it. vi.hoisted
// runs before the imports the factories close over.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (test)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "N-hotkey test fixture.",
    settings: {} as Record<string, never>,
    initialState: (seed: number) => ({ seed }),
    reducer: (state: { seed: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
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

describe("PlayPage N hotkey starts a new game with a fresh random seed (W788)", () => {
  it("pressing N while playing replaces the active seed with randomSeed()", async () => {
    // Pin Math.random so randomSeed() === Math.floor(0.5 * 2**31) === 1073741824.
    // Spying *before* importing PlayPage ensures the very first call inside
    // the handler sees the stub.
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const expectedSeed = Math.floor(0.5 * 2 ** 31);

    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // window-level keydown handler that owns the N binding is mounted.
    fireEvent.click(screen.getByTestId("start-game"));

    // Sanity: we start at the URL-supplied seed (42), not the random one.
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");

    // Dispatch the unmodified N keybinding on window — newGame is async
    // (awaits confirmIfInProgress) so we wrap in act+waitFor to let the
    // microtask resolve before reading the DOM.
    act(() => {
      fireEvent.keyDown(window, { key: "n" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("seed-display").textContent).toBe(
        `#${expectedSeed}`,
      );
    });
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

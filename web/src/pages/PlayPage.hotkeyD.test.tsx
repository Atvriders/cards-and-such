/**
 * Unit test for the PlayPage "D" hotkey that adopts today's daily seed (W744).
 *
 * Observable behavior:
 *   While the game is in the "playing" phase, pressing the unmodified `d`
 *   key calls `applyPickedSeed(hashStamp(todayStamp()))` (PlayPage.tsx
 *   ~line 1580). This restarts the game at the deterministic daily seed —
 *   the same seed the toolbar's "Daily" button produces. Sibling tests
 *   cover F (favorite), I (info popover) and Esc (pause), but no test
 *   exercises the D binding, leaving its daily-seed-on-keypress path
 *   uncovered.
 *
 * Strategy:
 *   - Reuse the seed-picker test's mocking shape: stub the registry with a
 *     single "klondike" fixture so the prominent `seed-display` element
 *     (gated to klondike/freecell/spider) renders, giving us a simple
 *     observable for the active seed.
 *   - Stub `dailyPicker.js` so `hashStamp(todayStamp())` is a fixed
 *     constant — divorces the assertion from the system clock.
 *   - Mount with `?seed=42` so the page starts in a known non-daily state.
 *   - Dispatch the `d` key on `window` (handler attaches there) and assert
 *     `seed-display` flips from `#42` to `#<DAILY_SEED>`.
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
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (test)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "D-hotkey test fixture.",
    settings: {} as Record<string, never>,
    initialState: (seed: number) => ({ seed }),
    reducer: (state: { seed: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  // Constant pseudo-daily seed — deterministic regardless of "today".
  const DAILY_SEED = 1234567;
  return { TEST_GAME_ID, fixturePlugin, DAILY_SEED };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Pin the daily seed so this assertion never depends on the system clock.
vi.mock("./dailyPicker.js", () => ({
  todayStamp: () => "2026-05-03",
  hashStamp: () => hoisted.DAILY_SEED,
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

describe("PlayPage D hotkey adopts today's daily seed (W744)", () => {
  it("pressing D while playing replaces the active seed with hashStamp(todayStamp())", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // window-level keydown handler that owns the D binding is mounted.
    fireEvent.click(screen.getByTestId("start-game"));

    // Sanity: we start at the URL-supplied seed (42), not the daily one.
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");

    // Dispatch the unmodified D keybinding on window — applyPickedSeed
    // restarts the game at hashStamp(todayStamp()).
    act(() => {
      fireEvent.keyDown(window, { key: "d" });
    });

    expect(screen.getByTestId("seed-display").textContent).toBe(
      `#${hoisted.DAILY_SEED}`,
    );
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

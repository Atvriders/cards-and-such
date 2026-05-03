/**
 * Unit tests for PlayPage seed-picker popover (W205 / W324).
 *
 * Covers the four documented user paths through the popover:
 *   1. Opening the picker via the `play-seed-pick-btn` toolbar button
 *   2. Clicking "Random" — should generate a new seed and restart
 *   3. Clicking "Daily" — should adopt the deterministic daily-stamp seed
 *   4. Editing the input then clicking "Apply" — should restart with that seed
 *
 * Strategy:
 *   - vi.hoisted defines a single fixture plugin used by both
 *     `../games/registry.js` and `./dailyPicker.js` mocks, so the daily
 *     branch is deterministic without depending on `new Date()`.
 *   - Plugin id is "klondike" so the prominent `seed-display` element
 *     (gated to klondike/freecell/spider) renders, giving us a simple
 *     observable for the active seed.
 *   - Initial seed is supplied via `?seed=42` in the URL so the page
 *     starts in a known state, independent of `Math.random`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture so vi.mock factories below can reference it. vi.hoisted
// runs before the imports the factories close over, so this is safe even
// though it looks like a TDZ violation at the source level.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (test)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Seed-picker test fixture.",
    settings: {} as Record<string, never>,
    initialState: (seed: number) => ({ seed }),
    reducer: (state: { seed: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  // Constant pseudo-daily seed so the "Daily" assertion is deterministic
  // and divorced from the system clock.
  const DAILY_SEED = 1234567;
  return { TEST_GAME_ID, fixturePlugin, DAILY_SEED };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Mock dailyPicker so "Daily" produces a fixed seed regardless of the
// machine's current date. PlayPage calls `hashStamp(todayStamp())`, so we
// stub both to return our constant.
vi.mock("./dailyPicker.js", () => ({
  todayStamp: () => "2026-05-02",
  hashStamp: () => hoisted.DAILY_SEED,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// Helper: mount PlayPage at /play/:gameId?seed=42 and click through the
// setup screen so the toolbar (with the seed picker) is rendered.
async function mountPlayingPhase(): Promise<void> {
  const { default: PlayPage } = await import("./PlayPage.js");
  render(
    <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
      <Routes>
        <Route path="/play/:gameId" element={<PlayPage />} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByTestId("start-game"));
}

describe("PlayPage seed picker (W205/W324)", () => {
  it("opens the picker when play-seed-pick-btn is clicked", async () => {
    await mountPlayingPhase();

    // Picker is closed by default — the dialog isn't in the tree yet.
    expect(screen.queryByTestId("play-seed-picker")).toBeNull();

    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));

    expect(screen.getByTestId("play-seed-picker")).toBeTruthy();
    expect(screen.getByTestId("play-seed-input")).toBeTruthy();
  });

  it("Random generates a new seed and restarts the game", async () => {
    await mountPlayingPhase();

    // Pin Math.random so the new seed is predictable. randomSeed() is
    // `Math.floor(Math.random() * 2 ** 31)`, so 0.5 -> 1073741824.
    const randSpy = vi.spyOn(Math, "random").mockReturnValue(0.5);
    const expected = Math.floor(0.5 * 2 ** 31);

    // Initial display reflects the URL seed (42).
    expect(screen.getByTestId("seed-display").textContent).toBe("#42");

    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));
    act(() => {
      fireEvent.click(screen.getByTestId("play-seed-random"));
    });

    expect(randSpy).toHaveBeenCalled();
    expect(screen.getByTestId("seed-display").textContent).toBe(`#${expected}`);
    // Apply-style actions also dismiss the popover.
    expect(screen.queryByTestId("play-seed-picker")).toBeNull();
  });

  it("Daily uses today's deterministic daily seed", async () => {
    await mountPlayingPhase();

    expect(screen.getByTestId("seed-display").textContent).toBe("#42");

    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));
    act(() => {
      fireEvent.click(screen.getByTestId("play-seed-daily"));
    });

    expect(screen.getByTestId("seed-display").textContent).toBe(
      `#${hoisted.DAILY_SEED}`,
    );
    expect(screen.queryByTestId("play-seed-picker")).toBeNull();
  });

  it("Apply restarts the game with the typed input value", async () => {
    await mountPlayingPhase();

    expect(screen.getByTestId("seed-display").textContent).toBe("#42");

    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));

    const input = screen.getByTestId("play-seed-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "9999" } });
    act(() => {
      fireEvent.click(screen.getByTestId("play-seed-apply"));
    });

    expect(screen.getByTestId("seed-display").textContent).toBe("#9999");
    expect(screen.queryByTestId("play-seed-picker")).toBeNull();
  });
});

// React import keeps the file an unambiguous JSX module under tsconfigs
// that don't auto-inject the runtime in tests.
void React;

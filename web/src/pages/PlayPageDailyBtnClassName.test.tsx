/**
 * Unit test for the PlayPage seed-pick dialog Daily action className (W1368).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1929) renders the "Daily" action inside the open
 *   seed-pick dialog as
 *     `<button type="button" className="play-seed-picker-action"
 *              data-testid="play-seed-daily">`.
 *   The bare `play-seed-picker-action` class is what the picker stylesheet
 *   uses to size and color the Random/Daily action buttons identically (the
 *   Apply button gets an additional `play-seed-picker-apply` modifier on top
 *   of it). A regression that dropped the className from the Daily button —
 *   or that swapped it for the apply modifier and accidentally restyled it
 *   as the primary action — would still pass the existing tests:
 *
 *     - PlayPageSeedPickerDailyType.test.tsx (W1338) — pins `type="button"`.
 *     - PlayPage.seedPicker.test.tsx (W205/W324) — exercises the click path.
 *     - PlayPageSeedPickerRowClassName.test.tsx (W1271) — pins the row class.
 *
 *   None of those anchor the Daily button's *own* className. This test pins
 *   exactly that single attribute so a styling regression on the daily-seed
 *   action is caught at the unit level.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — uses id "klondike" so the seed-pick toolbar branch
// (gated to klondike/freecell/spider via `showProminentSeed`) renders.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  type State = { seed: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (seed-pick daily className fixture)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the daily-button className test.",
    settings: {} as Record<string, never>,
    initialState: (seed: number): State => ({ seed }),
    reducer: (s: State): State => s,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
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
  // Pre-mark the klondike tutorial as seen so the first-run coachmark
  // doesn't intercept the seed-pick click.
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

describe("PlayPage seed-pick dialog Daily button className (W1368)", () => {
  it("renders the Daily action with className 'play-seed-picker-action'", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=42`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Seed-pick button only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    // Open the picker — the daily action only exists once the dialog mounts.
    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));

    const daily = screen.getByTestId("play-seed-daily");
    // Pin the className exactly. The Apply sibling carries the bare class
    // *plus* a `play-seed-picker-apply` modifier; the Daily button must
    // remain on the bare class so its visual treatment stays the
    // secondary-action style.
    expect(daily.className).toBe("play-seed-picker-action");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

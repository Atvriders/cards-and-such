/**
 * Unit test for the PlayPage seed-pick popover inner row className (W1271).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1868) wraps the seed label + input + stepper inside
 *   the open seed-pick dialog with a `<div className="play-seed-picker-row">`.
 *   That class is the structural hook the picker stylesheet uses to lay the
 *   row out (label/input grid spacing, stepper alignment) and is distinct
 *   from the dialog wrapper's own `play-seed-picker` class.
 *
 *   Sibling tests cover:
 *     - PlayPage.headerSeedPickButton.test.tsx (W976) / Haspopup (W1245) /
 *       Title (W991-style attrs) — the *closed* button's static UI.
 *     - PlayPage.seedPickPopover.test.tsx — dialog role + accessible name.
 *     - PlayPage.seedPicker.test.tsx (W205/W324) — Random/Daily/Apply paths.
 *
 *   What none of those pin is the *inner row wrapper* className. A regression
 *   that flattened the row container or renamed the class to something like
 *   `play-seed-picker-line` would still satisfy the dialog-level a11y and
 *   button-path tests, while silently breaking the picker layout. This test
 *   anchors the row className inside the open dialog so the inner structural
 *   contract is independently verified.
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
    title: "Klondike (seed-pick row className fixture)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the seed-pick row className test.",
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

describe("PlayPage seed-pick dialog inner row className (W1271)", () => {
  it("renders a child with class 'play-seed-picker-row' inside the open dialog", async () => {
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

    // Open the picker — the row wrapper only exists once the dialog mounts.
    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));

    const dialog = screen.getByTestId("play-seed-picker");
    const row = dialog.querySelector(".play-seed-picker-row");
    expect(row).not.toBeNull();
    // Pin the className exactly so a future class rename (e.g. to
    // `play-seed-picker-line`) is caught immediately.
    expect((row as HTMLElement).className).toBe("play-seed-picker-row");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

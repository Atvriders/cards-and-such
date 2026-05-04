/**
 * Unit test for the PlayPage seed-pick popover label htmlFor (W1512).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1869) renders the seed-pick dialog's label as
 *   `<label className="play-seed-picker-label" htmlFor="play-seed-input">`
 *   so the visible "Seed" caption is programmatically associated with the
 *   adjacent `<input id="play-seed-input">`. That `htmlFor` association is
 *   what makes the label clickable-to-focus the input and what lets
 *   assistive tech surface "Seed" as the input's accessible name.
 *
 *   Sibling tests cover the dialog wrapper className (W1309), the inner
 *   row className (W1271), the Apply button className (W1391), the Daily
 *   button type+className (W1338/W1368), the input's inputMode (W1374),
 *   and the seed-pick *toggle*'s aria-haspopup (W1245). What none of them
 *   pin is the dialog's own label-to-input wiring. A regression that
 *   dropped `htmlFor` (or renamed the input id) would silently break the
 *   click-label-to-focus UX and screen-reader name resolution while
 *   leaving every existing structural test green.
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
    title: "Klondike (seed-pick label htmlFor fixture)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the seed-pick label htmlFor test.",
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

describe("PlayPage seed-pick dialog label htmlFor (W1512)", () => {
  it("wires the 'Seed' label to the seed input via htmlFor='play-seed-input'", async () => {
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

    // Open the picker — the label only exists once the dialog mounts.
    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));

    const dialog = screen.getByTestId("play-seed-picker");
    const label = dialog.querySelector("label.play-seed-picker-label");
    expect(label).not.toBeNull();
    // Pin htmlFor so a future rename of the input id (or accidental drop
    // of the htmlFor attribute) is caught immediately. This is the
    // contract that backs label-click-to-focus and screen-reader naming.
    expect((label as HTMLLabelElement).htmlFor).toBe("play-seed-input");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

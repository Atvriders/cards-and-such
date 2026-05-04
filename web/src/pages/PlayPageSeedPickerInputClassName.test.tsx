/**
 * Unit test for the PlayPage seed-pick dialog input `className` attribute (W1532).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1875) renders the seed input as
 *   `<input id="play-seed-input" className="play-seed-input"
 *   data-testid="play-seed-input" type="number" min={0}
 *   inputMode="numeric" ... />`. The `className="play-seed-input"` is
 *   load-bearing: matching CSS rules in the play-seed stylesheet target
 *   that exact class to size, align, and visually separate the seed input
 *   from the surrounding dialog row. A regression that renamed or dropped
 *   that class would silently fall back to the user-agent default input
 *   styling and break the picker layout, but no behavioral test would
 *   catch it because the controlled `value` / `onChange` plumbing is
 *   unaffected by the class string.
 *
 *   Sibling tests cover:
 *     - PlayPageSeedPickerInputType.test.tsx (W1519) — the `type="number"`
 *       attribute.
 *     - PlayPageSeedPickerInputMin.test.tsx (W1526) — the `min={0}`
 *       attribute.
 *     - PlayPageSeedPickerInputInputMode.test.tsx (W1374) — the
 *       `inputMode="numeric"` mobile-keypad attribute.
 *     - PlayPageSeedPickerLabelHtmlFor.test.tsx (W1512) — the label's
 *       `htmlFor="play-seed-input"` association.
 *
 *   What none of those pin is the input element's own `className`. This
 *   test anchors that single attribute so the styling contract stays
 *   pinned at the DOM boundary.
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
    title: "Klondike (seed-pick input className fixture)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the seed-pick input className test.",
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

describe("PlayPage seed-pick dialog input className (W1532)", () => {
  it("renders the seed input with className='play-seed-input' inside the open dialog", async () => {
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

    // Open the picker — the seed input only exists once the dialog mounts.
    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));

    const input = screen.getByTestId("play-seed-input");
    // Pin className exactly so a future regression that renames or drops
    // the styling hook (which would silently fall back to user-agent
    // default input styling) is caught immediately.
    expect(input.getAttribute("class")).toBe("play-seed-input");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

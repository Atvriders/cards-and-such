/**
 * Unit test for the PlayPage seed-pick dialog input `id` attribute (W1540).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1874) renders the seed input as
 *   `<input id="play-seed-input" ... />`. The `id` attribute is load-bearing:
 *   it is the target of the sibling `<label htmlFor="play-seed-input">`
 *   association, which is what lets a screen reader announce the field's
 *   accessible name ("Seed") and what lets a click on the visible "Seed"
 *   text move focus into the numeric input. If the input's `id` were
 *   renamed or dropped (e.g. while refactoring to a controlled wrapper
 *   that picks its own id), the label association would silently break
 *   even though the visible UI looks unchanged.
 *
 *   Sibling tests cover:
 *     - PlayPageSeedPickerLabelHtmlFor.test.tsx (W1512) — pins the
 *       `htmlFor="play-seed-input"` side of the same label-input pair.
 *     - PlayPageSeedPickerInputInputMode.test.tsx (W1374) — pins the
 *       `inputMode="numeric"` attribute (mobile keypad UX).
 *     - PlayPageSeedPickerInputType.test.tsx (W1519) — pins `type="number"`.
 *     - PlayPageSeedPickerInputMin.test.tsx (W1526) — pins `min={0}`.
 *     - PlayPageSeedPickerInputClassName.test.tsx (W1532) — pins the
 *       `className="play-seed-input"` styling hook.
 *
 *   None of those tests directly assert the *input's* `id`. The label test
 *   only verifies one half of the association; this test pins the other
 *   half so a rename of the input id alone would surface as a focused
 *   regression instead of as a vague accessibility regression.
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
    title: "Klondike (seed-pick input id fixture)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the seed-pick input id test.",
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

describe("PlayPage seed-pick dialog input id (W1540)", () => {
  it("renders the seed input with id='play-seed-input' inside the open dialog", async () => {
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
    // Pin the id exactly so a future rename (which would silently break
    // the sibling <label htmlFor="play-seed-input"> association) is caught.
    expect(input.getAttribute("id")).toBe("play-seed-input");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

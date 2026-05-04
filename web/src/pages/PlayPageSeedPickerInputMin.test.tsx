/**
 * Unit test for the PlayPage seed-pick dialog input `min` attribute (W1526).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1878) renders the seed input as
 *   `<input id="play-seed-input" type="number" min={0} inputMode="numeric"
 *   ... />`. The `min={0}` attribute is load-bearing: paired with
 *   `type="number"`, it tells the browser's native numeric stepper and
 *   form-validation layer that negative values are out-of-range. The seed
 *   pipeline downstream treats the value as an unsigned integer (random/
 *   daily seeds are always non-negative), so flipping or removing this
 *   attribute would silently allow the native stepper to walk into
 *   negative territory and break the daily-seed parity contract.
 *
 *   Sibling tests cover:
 *     - PlayPageSeedPickerInputType.test.tsx (W1519) — the `type="number"`
 *       attribute.
 *     - PlayPageSeedPickerInputInputMode.test.tsx (W1374) — the
 *       `inputMode="numeric"` mobile-keypad attribute.
 *     - PlayPageSeedPickerLabelHtmlFor.test.tsx (W1512) — the label's
 *       `htmlFor="play-seed-input"` association.
 *     - PlayPage.seedPickInput.test.tsx — the input's value mirroring
 *       `seedDraft` state.
 *     - PlayPage.seedPickStep.test.tsx / seedPickStepDown.test.tsx — the
 *       stepper button click effects on the input value.
 *
 *   What none of those pin is the input `min` attribute itself. A
 *   regression that removed `min={0}` (or flipped it to a different
 *   number) would not be caught by behavioral tests, since the controlled
 *   `value` / `onChange` plumbing is unaffected by the bound. This test
 *   anchors that single attribute so the non-negative-seed contract
 *   stays pinned at the DOM boundary.
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
    title: "Klondike (seed-pick input min fixture)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the seed-pick input min test.",
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

describe("PlayPage seed-pick dialog input min (W1526)", () => {
  it("renders the seed input with min='0' inside the open dialog", async () => {
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
    // Pin min exactly so a future regression that drops the lower bound
    // (and silently allows the native stepper to walk into negative
    // territory) is caught immediately.
    expect(input.getAttribute("min")).toBe("0");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

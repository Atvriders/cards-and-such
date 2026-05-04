/**
 * Unit test for the PlayPage seed-pick dialog input `type` attribute (W1519).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1877) renders the seed input as
 *   `<input id="play-seed-input" type="number" min={0} inputMode="numeric"
 *   ... />`. The `type="number"` attribute is load-bearing: it makes the
 *   browser surface its native numeric stepper UI, restricts non-numeric
 *   keyboard input on desktop, and — together with `min={0}` — anchors the
 *   semantic that this field accepts a non-negative integer seed. Switching
 *   the input back to `type="text"` would silently drop those built-in
 *   browser affordances even though typing digits would still mostly work.
 *
 *   Sibling tests cover:
 *     - PlayPageSeedPickerInputInputMode.test.tsx (W1374) — the
 *       `inputMode="numeric"` mobile-keypad attribute.
 *     - PlayPageSeedPickerLabelHtmlFor.test.tsx (W1512) — the label's
 *       `htmlFor="play-seed-input"` association.
 *     - PlayPage.seedPickInput.test.tsx — the input's value mirroring
 *       `seedDraft` state (typing behavior).
 *     - PlayPage.seedPickStep.test.tsx / seedPickStepDown.test.tsx — the
 *       stepper button click effects on the input value.
 *     - PlayPage.seedPickEnter.test.tsx — Enter-to-apply key handling.
 *
 *   What none of those pin is the input `type` attribute itself. A
 *   regression that flipped it to `"text"` (e.g. while wrapping the input
 *   to suppress the native spinner) would not be caught by any behavioral
 *   test, since the controlled `value` / `onChange` plumbing is unaffected
 *   by the type. This test anchors that single attribute so the
 *   numeric-input contract stays pinned.
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
    title: "Klondike (seed-pick input type fixture)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the seed-pick input type test.",
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

describe("PlayPage seed-pick dialog input type (W1519)", () => {
  it("renders the seed input with type='number' inside the open dialog", async () => {
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
    // Pin type exactly so a future regression that flips it back to "text"
    // (and silently drops the native numeric-stepper UX) is caught
    // immediately.
    expect(input.getAttribute("type")).toBe("number");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

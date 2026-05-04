/**
 * Unit test for the PlayPage seed-pick dialog input `inputMode` (W1374).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1879) renders the seed input as
 *   `<input id="play-seed-input" type="number" min={0} inputMode="numeric"
 *   ... />`. The `inputMode="numeric"` attribute is load-bearing: on mobile
 *   browsers it is the hint that triggers the on-screen *numeric keypad*
 *   instead of the full QWERTY keyboard. `type="number"` alone is
 *   inconsistent across mobile browsers (Safari especially), so dropping
 *   `inputMode="numeric"` would degrade the touch UX even though the input
 *   continues to function on desktop.
 *
 *   Sibling tests cover:
 *     - PlayPage.seedPickInput.test.tsx (W*) — the input's value mirroring
 *       `seedDraft` state (typing behavior).
 *     - PlayPage.seedPickStep.test.tsx / seedPickStepDown.test.tsx — the
 *       stepper button click effects on the input value.
 *     - PlayPage.seedPickEnter.test.tsx — Enter-to-apply key handling.
 *
 *   What none of those pin is the *inputMode* attribute. A regression that
 *   silently dropped `inputMode="numeric"` (e.g. while refactoring the
 *   input to a controlled wrapper component) would not surface in any
 *   behavioral test under jsdom, since jsdom does not emulate mobile
 *   keyboards. This test anchors that single attribute on the rendered
 *   input so the mobile-keypad UX contract stays pinned.
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
    title: "Klondike (seed-pick input inputMode fixture)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the seed-pick input inputMode test.",
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

describe("PlayPage seed-pick dialog input inputMode (W1374)", () => {
  it("renders the seed input with inputMode='numeric' inside the open dialog", async () => {
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
    // Pin inputMode exactly so a future regression that drops it (and
    // degrades the mobile keypad UX) is caught immediately.
    expect(input.getAttribute("inputmode")).toBe("numeric");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

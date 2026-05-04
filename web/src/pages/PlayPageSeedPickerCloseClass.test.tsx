/**
 * Unit test for the PlayPage seed-pick dialog wrapper className (W1309).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1860) renders the seed-pick popover as
 *   `<div className="play-seed-picker" role="dialog" ...>` whenever
 *   `seedPickerOpen` toggles true. The seed-pick popover has no explicit
 *   close button — it is dismissed via Esc / outside-click — so the
 *   dialog's *own* className is the structural hook the popover stylesheet
 *   uses for positioning, padding, shadow, focus ring, and the close-on-
 *   blur visuals. It is the class that anchors the entire popover surface.
 *
 *   Sibling tests cover:
 *     - PlayPage.seedPickPopover.test.tsx (W991) — role="dialog", accessible
 *       name "Pick seed", and `data-testid="play-seed-picker"`.
 *     - PlayPage.headerSeedPickHaspopup.test.tsx (W1245) — toggle button
 *       `aria-haspopup="dialog"`.
 *     - PlayPageSeedPickerRowClassName.test.tsx (W1271) — the inner
 *       `play-seed-picker-row` child wrapper className.
 *
 *   What none of those pin is the *dialog wrapper's own className*. A
 *   regression that renamed the wrapper class (e.g. to `play-seed-popover`
 *   or `play-seed-dialog`) or dropped it entirely would still satisfy
 *   the role/testid/inner-row contracts while silently shedding all of the
 *   popover's CSS. This test pins the wrapper className so the visual
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
    title: "Klondike (seed-pick wrapper className fixture)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the seed-pick wrapper className test.",
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

describe("PlayPage seed-pick dialog wrapper className (W1309)", () => {
  it("uses class 'play-seed-picker' on the open dialog wrapper itself", async () => {
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

    // Open the picker — the wrapper only exists once the dialog mounts.
    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));

    const dialog = screen.getByTestId("play-seed-picker");
    // Pin the wrapper's exact className. The popover stylesheet anchors
    // every visual rule (positioning, shadow, focus ring) to this single
    // class — a rename or removal would silently strip those styles
    // while role/testid/inner-row contracts continue to pass.
    expect(dialog.className).toBe("play-seed-picker");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

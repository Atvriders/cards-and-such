/**
 * Unit test for the PlayPage seed-pick popover structural contract (W991).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 1860) mounts a `<div role="dialog">` with
 *   `data-testid="play-seed-picker"` and class `play-seed-picker` whenever
 *   the user toggles `seedPickerOpen` via the toolbar `play-seed-pick-btn`.
 *   The popover serves as the picker UI for choosing a deterministic seed
 *   (Random / Daily / Apply) and is the dialog the seed-pick button's
 *   `aria-haspopup="dialog"` / `aria-expanded` attributes reference.
 *
 *   Sibling tests cover *interactive* paths:
 *     - PlayPage.seedPicker.test.tsx (W205/W324) — Random/Daily/Apply buttons
 *     - PlayPage.headerSeedPickButton.test.tsx (W976) — the button's static
 *       UI attributes (tagName / type / aria-label / data-tooltip)
 *
 *   What none of those pin is the *popover container's* a11y contract: that
 *   on click, a node with `role="dialog"` and accessible name "Pick seed"
 *   actually appears in the DOM. A regression that swapped `role="dialog"`
 *   for plain `<div>`, dropped the accessible name, or accidentally rendered
 *   the picker outside the popover wrapper would still flip
 *   `seedPickerOpen` and pass the testid-only assertions in W205/W324.
 *
 * Strategy mirrors PlayPage.headerSeedPickButton.test.tsx (W976):
 *   - vi.hoisted defines a fixture plugin under id "klondike" so the
 *     `play-seed-pick-wrap` branch (gated to `phase === "playing"` after
 *     `start-game`) renders normally.
 *   - Pre-seed `cards-tutorial-seen` for klondike so the first-run
 *     coachmark doesn't intercept the click.
 *   - Mount at `/play/:gameId?seed=42`, advance to playing, click the
 *     seed-pick button, and assert:
 *       1. A node with role="dialog" and the "Pick seed" accessible name
 *          is in the DOM (the popover's a11y contract).
 *       2. That same node carries the `play-seed-picker` testid (the
 *          structural contract sibling tests rely on as a stable hook).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate. The
// fixture plugin uses id "klondike" so the seed-pick toolbar branch (gated
// to klondike/freecell/spider via `showProminentSeed`) renders, matching
// the documented "seed-display games" UX context for the seed picker.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "klondike";
  type State = { seed: number };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Klondike (seed-pick popover fixture)",
    category: "solitaire" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the seed-pick popover structural test.",
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
  // doesn't intercept the seed-pick click. The platform module persists
  // this as a JSON map keyed by gameId under `cards-tutorial-seen`.
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

describe("PlayPage seed-pick popover structural contract (W991)", () => {
  it("opens a role='dialog' popover with accessible name 'Pick seed' on click", async () => {
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

    // Pre-condition: dialog is closed before any click. If a regression
    // ever made the popover render unconditionally, the post-click
    // assertion below would still pass — pinning the "closed first"
    // half of the toggle keeps the test honest.
    expect(screen.queryByRole("dialog", { name: "Pick seed" })).toBeNull();

    fireEvent.click(screen.getByTestId("play-seed-pick-btn"));

    // a11y contract — the popover must be a `role="dialog"` with the
    // "Pick seed" accessible name (sourced from `aria-label`). This is
    // the contract that screen readers and `aria-haspopup="dialog"` /
    // `aria-expanded` on the toggle button reference.
    const dialog = screen.getByRole("dialog", { name: "Pick seed" });
    expect(dialog).toBeTruthy();

    // Structural contract — sibling tests address the dialog by its
    // `play-seed-picker` testid. Anchoring that hook to the same node
    // that owns the dialog role prevents a future refactor that
    // splits the wrapper from the dialog node from silently breaking
    // those tests at a distance.
    expect(dialog.getAttribute("data-testid")).toBe("play-seed-picker");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;

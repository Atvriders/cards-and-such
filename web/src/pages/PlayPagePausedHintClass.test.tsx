/**
 * W1306 — focused test for the structural `play-paused-hint` CSS class
 * inside the paused overlay's card.
 *
 * Sibling coverage map for the paused overlay:
 *   - W1122 — overlay mount/unmount gated on `paused`
 *   - W1141 — role="status" + aria-live="polite"
 *   - W1137 — visible copy ("Paused" + <kbd>Esc</kbd>)
 *   - W1146 — click Resume unpauses
 *   - W1188 — Resume button tagName/textContent contract
 *   - W1190 — outer `.play-paused-overlay` className
 *   - W1196 — inner `.play-paused-card` + `.play-paused-title` classes
 *   - W1273 — Resume button type="button"
 *
 * What's still uncovered (until this file): the *hint line* className.
 * The keybind hint ("Press Esc or click Resume") sits inside the card
 * with its own styling hook (`.play-paused-hint`). If a refactor renames
 * or drops the hint element's class, the overlay would still mount, the
 * card would still render, the headline would still appear, and the
 * resume button would still work — but the keybind hint's typography
 * (smaller / muted) would silently regress to inheriting the card's
 * default styling. None of the existing sibling tests catch that.
 *
 * This file locks that single contract: a `.play-paused-hint` element
 * lives inside `.play-paused-card` and is the keybind hint line.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — vi.mock factories run before top-level const
// initialisers, so the fixture must live in a vi.hoisted block.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "paused-overlay-hint-class-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Paused Overlay Hint Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the W1306 paused-hint class test.",
    settings: {} as Record<string, never>,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free even though we never reach the win banner.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage paused overlay hint class (W1306)", () => {
  it("renders a play-paused-hint element inside the paused card", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past the setup screen so the in-game pause surface is mounted.
    fireEvent.click(screen.getByTestId("start-game"));

    // Trigger the pause via the visible toolbar button — sibling W1273
    // exercises the same affordance, so we stay consistent.
    fireEvent.click(screen.getByTestId("play-pause-btn"));

    const overlay = screen.getByTestId("play-paused-overlay");
    const card = overlay.querySelector(".play-paused-card");
    expect(card).not.toBeNull();

    // The hint line must live inside the card and carry the
    // `.play-paused-hint` styling hook so its muted/smaller typography
    // applies. Without this hook the keybind hint would inherit the
    // card's default styling and read as another headline.
    const hint = card!.querySelector(".play-paused-hint");
    expect(hint).not.toBeNull();
    expect(hint!.parentElement).toBe(card);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

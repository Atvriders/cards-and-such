/**
 * W1190 — focused test for the structural `play-paused-overlay` CSS
 * class on the outer overlay element.
 *
 * Sibling coverage map for the paused overlay:
 *   - W1122 — overlay mount/unmount gated on `paused`
 *   - W1141 — role="status" + aria-live="polite"
 *   - W1137 — visible copy ("Paused" + <kbd>Esc</kbd>)
 *   - W1146 — click Resume unpauses
 *   - W1188 — Resume button tagName/textContent contract
 *
 * What's still uncovered: the className on the outer overlay element
 * itself. The styling hook (`.play-paused-overlay`) is what positions
 * the dim full-bleed backdrop over the play surface. If a refactor
 * renames or drops it, the overlay would still mount and announce
 * politely, but the visual scrim would silently break — no other
 * sibling test would catch that regression.
 *
 * This file locks that single contract:
 *   <div className="play-paused-overlay" data-testid="play-paused-overlay" ...>
 *
 * Uses `vi.hoisted` for the same TDZ reason documented in the sibling
 * tests: vi.mock factories run before top-level const initialisers.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — see header comment for the TDZ rationale.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "paused-overlay-class-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Paused Overlay Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the W1190 paused-overlay class test.",
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

describe("PlayPage paused overlay class (W1190)", () => {
  it("renders the outer overlay with the play-paused-overlay class", async () => {
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

    // Trigger the pause via the keybind — same path exercised by W1122.
    fireEvent.keyDown(window, { key: "Escape" });

    const overlay = screen.getByTestId("play-paused-overlay");
    expect(overlay).toBeTruthy();

    // The structural styling hook must be present on the outer overlay
    // element so the dim full-bleed scrim renders over the play surface.
    expect(overlay.classList.contains("play-paused-overlay")).toBe(true);
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

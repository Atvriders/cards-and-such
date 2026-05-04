/**
 * W1141 — focused test for the *accessibility attributes* on the
 * `play-paused-overlay` element confirmed by W1122 and whose visible
 * content is locked by W1137.
 *
 * The overlay surfaces a non-interactive status announcement to
 * assistive tech, so the source attaches two a11y attributes:
 *
 *   <div className="play-paused-overlay"
 *        data-testid="play-paused-overlay"
 *        role="status"
 *        aria-live="polite">
 *
 * If a refactor strips either attribute, screen-reader users would
 * stop hearing that the game has paused. This test guards exactly
 * that contract — nothing else — by asserting both attributes once
 * the overlay mounts.
 *
 * Sibling tests (`PlayPage.pausedOverlay.test.tsx`,
 * `PlayPage.pausedOverlayContent.test.tsx`) cover the mount gate and
 * the visible copy respectively; this file deliberately stays narrow.
 *
 * Uses `vi.hoisted` for the same TDZ reason documented in the
 * sibling tests: vi.mock factories run before top-level const
 * initialisers.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin — see header comment for the TDZ rationale.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "paused-overlay-aria-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Paused Overlay Aria Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the W1141 paused-overlay a11y test.",
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

describe("PlayPage paused overlay a11y (W1141)", () => {
  it("exposes role=status and aria-live=polite once the overlay mounts", async () => {
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

    // Both a11y attributes must be present so assistive tech announces the
    // pause politely without stealing focus from the underlying surface.
    expect(overlay.getAttribute("role")).toBe("status");
    expect(overlay.getAttribute("aria-live")).toBe("polite");
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;

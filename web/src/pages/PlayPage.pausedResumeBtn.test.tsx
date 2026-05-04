/**
 * W1146 — focused test for the Resume button inside the paused overlay.
 *
 * W1137 confirmed the overlay copy "Press Esc or click Resume" and the
 * accompanying `<button>Resume</button>`. This test pins the click-path
 * contract: pausing the game must mount the overlay; clicking Resume
 * must unmount it (i.e. the overlay disappears, game is resumed).
 *
 * This is deliberately narrower than PlayPage.pause.test.tsx — it
 * exercises only the in-overlay Resume button, not the toolbar Pause
 * button or the Escape keybinding.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "paused-resume-btn-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Paused Resume Btn Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the W1146 Resume-button click test.",
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

describe("PlayPage paused overlay Resume button (W1146)", () => {
  it("clicking Resume in the overlay unmounts the overlay (game resumes)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance past setup into the playing phase.
    fireEvent.click(screen.getByTestId("start-game"));

    // Pause via Escape so the overlay (and its Resume button) are mounted.
    fireEvent.keyDown(window, { key: "Escape" });
    const overlay = screen.getByTestId("play-paused-overlay");
    expect(overlay).toBeTruthy();

    // Find the Resume button *inside the overlay* (the toolbar pause button
    // also reuses the "Resume" aria-label when paused, so a global
    // getByRole would match two buttons). within() scopes to the overlay.
    const resumeBtn = within(overlay).getByRole("button", { name: "Resume" });
    fireEvent.click(resumeBtn);

    // Overlay must unmount — paused → false, game resumed.
    expect(screen.queryByTestId("play-paused-overlay")).toBeNull();
  });
});

void React;

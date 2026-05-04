/**
 * W1332 — focused test for the paused overlay Resume button's
 * `className="play-share-pill"`.
 *
 * The Resume button inside the paused overlay (PlayPage.tsx ~L2554) is
 * rendered with `className="play-share-pill"` so it inherits the shared
 * pill-button styling defined by `.play-share-pill` rules in
 * PlayPage.css. Existing tests cover:
 *   - the overlay's role/aria-live/content (W1137-ish coverage)
 *   - click-to-resume behaviour (pausedResumeBtn)
 *   - the button's `type="button"` attribute (W1273)
 *   - the `.play-paused-hint` className (W1306)
 *   - end-of-game share-row pills + Save Replay btn carrying
 *     `play-share-pill` (W1237 + saveReplayBtnClassName)
 *
 * What is NOT pinned: the paused-overlay Resume button itself sharing
 * the `play-share-pill` class. A rename or per-button drop of that
 * class on this specific overlay button would silently regress the
 * visual styling without any of the existing tests failing. This test
 * pins that contract.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "paused-overlay-resume-btn-class-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Paused Overlay Resume Btn Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the W1332 Resume button className test.",
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

describe("PlayPage paused overlay Resume button className (W1332)", () => {
  it("renders the overlay Resume button with the shared play-share-pill class", async () => {
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

    // Click the toolbar pause button to open the overlay.
    fireEvent.click(screen.getByTestId("play-pause-btn"));

    const overlay = screen.getByTestId("play-paused-overlay");
    expect(overlay).toBeTruthy();

    // Scope to the overlay — the toolbar's pause control also exposes a
    // "Resume" aria-label while paused, so an unscoped role query would
    // match two buttons.
    const resumeBtn = within(overlay).getByRole("button", { name: "Resume" });

    // UI contract: the overlay Resume button shares the `play-share-pill`
    // class so it picks up the same pill styling as the end-of-game
    // share controls. Asserting on classList.contains rather than exact
    // equality keeps the test robust to additional decorative classes
    // being added later, while still failing loudly if the class is
    // dropped or renamed.
    expect(resumeBtn.classList.contains("play-share-pill")).toBe(true);
  });
});

void React;

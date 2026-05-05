/**
 * Unit test for the PlayPage toolbar timer's "best time" readout
 * tagName (W2413).
 *
 * The toolbar `play-timer` <span> renders a sibling `play-timer-best`
 * readout when `bestTime != null`, displaying the personal-best mm:ss
 * for the current game. Existing PlayPage tests do not target this
 * element at all (no className, tagName, title, or testid pinning),
 * so a refactor could silently swap its element type — e.g. to a
 * <div> that breaks the inline flex layout inside the timer span,
 * or breaks HTML validity (block-in-inline). This test pins the
 * element's tagName ("SPAN") so future refactors can't regress the
 * inline structure.
 *
 * Harness mirrors `PlayPageTimerCurrentClass.test.tsx`: a hoisted
 * fixture plugin keeps the registry mock TDZ-safe, Confetti is
 * null-stubbed because jsdom has no canvas, and the prior personal
 * best is seeded into localStorage under `cards-best-times` so the
 * conditional `bestTime != null` branch renders.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-best-tagname-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Best TagName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for timer-best tagName test.",
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
  // Seed a prior personal best so `bestTime != null` and the
  // play-timer-best span renders inside the toolbar timer.
  localStorage.setItem(
    "cards-best-times",
    JSON.stringify({ [hoisted.TEST_GAME_ID]: 42 }),
  );
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage toolbar play-timer-best tagName (W2413)", () => {
  it("renders the play-timer-best readout as a <span>", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    // Cross setup -> playing so the toolbar timer (and best readout) mounts.
    fireEvent.click(screen.getByTestId("start-game"));

    const best = screen.getByTestId("play-timer-best");
    expect(best.tagName).toBe("SPAN");
  });
});

void React;

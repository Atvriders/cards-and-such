/**
 * Unit test for the PlayPage toolbar timer's "best time" readout
 * `title` attribute (W2457).
 *
 * The toolbar `play-timer` <span> renders a sibling `play-timer-best`
 * readout when `bestTime != null`, displaying the personal-best mm:ss
 * for the current game. PlayPage.tsx ~L1797-1805 emits:
 *
 *   <span
 *     className="play-timer-best"
 *     data-testid="play-timer-best"
 *     title="Personal best"
 *   >
 *     {t("hud.best")} {formatTime(bestTime)}
 *   </span>
 *
 * The `title="Personal best"` attribute is product-visible chrome
 * surfaced as the hover tooltip and to assistive tech that reads
 * tooltips. Existing coverage for this element pins only the tagName
 * (W2413) and className, so the literal `title` string could silently
 * regress (typo, translation, removal) without any test failing. This
 * test pins the exact title string so future refactors cannot regress
 * the tooltip text without an explicit, traceable update.
 *
 * Harness mirrors `PlayTimerBestTagName.test.tsx`: a hoisted fixture
 * plugin keeps the registry mock TDZ-safe, Confetti is null-stubbed
 * because jsdom has no canvas, and the prior personal best is seeded
 * into localStorage under `cards-best-times` so the conditional
 * `bestTime != null` branch renders.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "timer-best-title-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Timer Best Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for timer-best title test.",
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

describe("PlayPage toolbar play-timer-best title (W2457)", () => {
  it('exposes title="Personal best" on the play-timer-best readout', async () => {
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
    expect(best.getAttribute("title")).toBe("Personal best");
  });
});

void React;

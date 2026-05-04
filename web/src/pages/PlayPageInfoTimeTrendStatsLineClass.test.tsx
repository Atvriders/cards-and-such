/**
 * W1620 — PlayPage info popover time-trend stats line className.
 *
 * The TimeTrendChart renders a "Best | Avg | Plays" summary row beneath
 * the SVG plot. Sibling tests pin the testid (`play-time-stats-line`) and
 * the visible "Best:/Avg:/Plays:" labels (PlayPage.timeTrend.test.tsx),
 * but no test pins the wrapper's className. That class drives the spacing
 * and typography of the summary line — a silent rename would visually
 * re-flow the time-trend popover section without breaking any existing
 * assertion.
 *
 * Like the sibling time-trend tests we seed `cards-time-history:<gameId>`
 * directly so the popover surfaces the populated chart branch without
 * playing a real game.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-stats-line-class-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Stats Line Class Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend stats-line className test.",
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
  vi.restoreAllMocks();
});

describe("PlayPage info popover time-trend stats-line className (W1620)", () => {
  it("renders the stats line with className 'play-time-stats-line'", async () => {
    // Seed two finishes so the populated chart branch renders. The stats
    // line is also rendered in the n===1 branch with the same className,
    // but the populated branch is the canonical path for sibling tests.
    const seed = [
      { ts: 1, time: 10 },
      { ts: 2, time: 20 },
    ];
    localStorage.setItem(
      `cards-time-history:${hoisted.TEST_GAME_ID}`,
      JSON.stringify(seed),
    );

    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("play-info-btn"));

    const stats = screen.getByTestId("play-time-stats-line");
    expect(stats.className).toBe("play-time-stats-line");
  });
});

void React;

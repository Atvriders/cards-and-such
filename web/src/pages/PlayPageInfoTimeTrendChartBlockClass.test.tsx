/**
 * W1572 — PlayPage info popover time-trend chart-block wrapper className.
 *
 * The TimeTrendChart component wraps the SVG chart, the pace caption, and
 * the stats line inside a wrapper `<div className="play-time-chart-block">`.
 * Sibling tests cover the inner pieces — chart className (W1485-ish chain),
 * pace tones (W1538/W1547/W1551), pace aria-label (W1555), pace visible
 * text (W1560), populated svg attrs (W1492-W1533), and the pace tagName —
 * but no test pins the wrapper's className. The wrapper drives popover
 * layout (block-flow stacking, gap spacing) so a rename or accidental drop
 * would silently re-flow the time-trend section.
 *
 * Like the sibling time-trend tests we seed `cards-time-history:<gameId>`
 * directly so the popover surfaces the time-trend block without playing a
 * real game.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-chart-block-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Chart Block Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend chart-block wrapper test.",
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

describe("PlayPage info popover time-trend chart-block wrapper className (W1572)", () => {
  it("renders the chart block with className 'play-time-chart-block' wrapping the chart", async () => {
    // Seed two finishes so the populated chart branch renders (parent of
    // the SVG chart). The wrapper class is the same across both branches
    // but we exercise the populated branch here for parity with sibling
    // pace tests.
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

    const chart = screen.getByTestId("play-time-chart");
    const block = chart.parentElement;
    expect(block).not.toBeNull();
    expect(block?.className).toBe("play-time-chart-block");
  });
});

void React;

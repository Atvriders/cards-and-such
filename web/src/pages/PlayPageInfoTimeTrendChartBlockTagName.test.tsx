/**
 * W1578 — PlayPage info popover time-trend chart-block wrapper tagName.
 *
 * The TimeTrendChart wraps the SVG, the pace caption, and the stats line
 * in a `<div className="play-time-chart-block">`. W1572 pins the wrapper's
 * className but not its element type. Sibling time-trend tests cover the
 * SVG attrs (W1492-W1533), the empty-state label class (W1485), pace
 * data-pace tones (W1538/W1547/W1551), pace aria-label (W1555), pace
 * visible text (W1560), and pace tagName (W1566) — none assert the
 * chart-block wrapper is a `<div>`. Pinning the tag prevents an accidental
 * swap to `<section>`/`<figure>`/`<span>` which would change block-flow
 * stacking inside the popover and could regress assistive landmark order.
 *
 * Like sibling time-trend tests we seed `cards-time-history:<gameId>`
 * directly so the popover surfaces the chart-block without playing a
 * real game.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-chart-block-tagname-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Chart Block TagName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend chart-block tagName test.",
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

describe("PlayPage info popover time-trend chart-block wrapper tagName (W1578)", () => {
  it("renders the chart-block wrapper as a <div> element", async () => {
    // Seed two finishes so the populated chart branch renders. The wrapper
    // tag is identical across empty and populated branches; we exercise the
    // populated branch for parity with sibling chart-block tests.
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
    expect(block?.tagName).toBe("DIV");
  });
});

void React;

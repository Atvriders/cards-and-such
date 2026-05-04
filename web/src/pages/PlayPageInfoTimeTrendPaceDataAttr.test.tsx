/**
 * W1538 — PlayPage info popover time-trend pace caption: `data-pace`
 * attribute reflects the three-state classification (faster/tied/slower).
 *
 * The pace caption (`[data-testid="play-time-pace"]`) is rendered alongside
 * the SVG trend line whenever there is a previous best to compare against.
 * It carries a `data-pace` attribute that mirrors the rounded delta tone —
 * a stable hook that downstream tooling and CSS-in-JS can read without
 * having to parse the user-facing label. Two finishes that get faster
 * each run yield `data-pace="faster"`.
 *
 * Like the sibling time-trend tests we seed `cards-time-history:<gameId>`
 * directly so the popover surfaces the chart without having to play a real
 * game; this keeps the test isolated from any reducer/plugin behavior.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-pace-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Pace Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend pace data attr test.",
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

describe("PlayPage info popover time-trend pace caption (W1538)", () => {
  it("exposes data-pace='faster' when latest run beats the prior best", async () => {
    // Seed two finishes where the most-recent (10s) is faster than the
    // standing record going into it (30s). lastDelta = -20s -> "faster".
    const seed = [
      { ts: 1, time: 30 },
      { ts: 2, time: 10 },
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

    const pace = screen.getByTestId("play-time-pace");
    expect(pace.getAttribute("data-pace")).toBe("faster");
  });
});

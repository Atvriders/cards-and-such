/**
 * W1610 — PlayPage info popover time-trend chart: the *prior* (non-current)
 * <circle> datapoints are rendered with `stroke-width="0"` so the muted-gray
 * dots are visually flat (no halo), letting the current-run dot's accent
 * halo (#c7cdfe at stroke-width 1.2) stand out alone. Existing tests cover:
 *   - the inner <title> child (W1585)
 *   - per-circle `r` (W1591)
 *   - per-circle `fill` (W1593, W1600)
 *   - the current circle's `stroke` color (W1598)
 *   - the current circle's `stroke-width` (W1603)
 * None assert the `stroke-width` attribute on PRIOR (non-current) circles.
 * Dropping the ternary's "0" branch (or changing it) would give every
 * historical dot a visible halo, breaking the visual hierarchy.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-prior-circle-stroke-width-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Prior Circle Stroke-Width Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin pinning prior (non-current) circle stroke-width.",
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

describe("PlayPage info popover time-trend prior-circle stroke-width (W1610)", () => {
  it("renders all PRIOR (non-current) <circle>s with stroke-width='0'", async () => {
    // Seed 3 finishes so we have 2 PRIOR circles (and 1 current).
    const seed = [
      { ts: 1, time: 12 },
      { ts: 2, time: 18 },
      { ts: 3, time: 14 },
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
    const circles = chart.querySelectorAll("circle");
    expect(circles.length).toBe(3);
    // All circles before the last are "prior" muted dots — they must be
    // flat (stroke-width="0") so only the current dot carries a halo.
    for (let i = 0; i < circles.length - 1; i++) {
      expect(circles[i]!.getAttribute("stroke-width")).toBe("0");
    }
  });
});

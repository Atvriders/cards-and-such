/**
 * W1591 — PlayPage info popover time-trend chart: each non-current <circle>
 * datapoint exposes an explicit `r` (radius) attribute of `2`, while the
 * trailing "current" datapoint uses an enlarged `3.2` radius so it visually
 * stands out as the most recent run.
 *
 * Distinct from the existing circle <title> coverage (W1585) — that test
 * pins an inner sub-element. This test pins the `r` attribute on the
 * <circle> itself, which no existing PlayPage test exercises (the other
 * circle/path tests in the suite cover the path's stroke-* attrs and the
 * surrounding <svg> attrs only).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-circle-r-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Circle R Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend circle r attribute test.",
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

describe("PlayPage info popover time-trend circle r attribute (W1591)", () => {
  it("renders non-current datapoints with r='2' and the trailing current datapoint with r='3.2'", async () => {
    // Three finishes give us at least one clearly non-current datapoint
    // plus the trailing "current" datapoint (last index).
    const seed = [
      { ts: 1, time: 12 },
      { ts: 2, time: 18 },
      { ts: 3, time: 9 },
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

    // Non-current datapoints (every circle except the last) must use r="2".
    for (let i = 0; i < circles.length - 1; i += 1) {
      expect(circles[i].getAttribute("r")).toBe("2");
    }

    // Trailing "current" datapoint uses the enlarged r="3.2" radius.
    const last = circles[circles.length - 1];
    expect(last.getAttribute("r")).toBe("3.2");
  });
});

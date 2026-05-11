/**
 * W1598 — PlayPage info popover time-trend chart: the *current* (last)
 * <circle> datapoint is rendered with the accent stroke color "#c7cdfe"
 * so the most-recent finish carries a halo that distinguishes it from
 * prior muted-gray dots (which use stroke="none"). Existing tests cover
 * the inner <title> child (W1585), the circle's `r` (W1591), and the
 * current circle's `fill` (W1593) — but the per-circle `stroke`
 * attribute on the highlighted current dot is currently untested.
 * This test pins ONE narrow contract: the highlighted current-run dot
 * uses the lavender "#c7cdfe" stroke.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-current-circle-stroke-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Current Circle Stroke Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin pinning the current circle's accent stroke color.",
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

describe("PlayPage info popover time-trend current-circle stroke (W1598)", () => {
  it("renders the most-recent <circle> with the accent #c7cdfe stroke", async () => {
    // Need >= 2 finishes to render the trend chart at all.
    const seed = [
      { ts: 1, time: 12 },
      { ts: 2, time: 18 },
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
    expect(circles.length).toBe(2);
    // The last circle is the "current run" — it must carry the accent
    // lavender stroke so it visibly haloes against prior muted-gray dots.
    const currentCircle = circles[circles.length - 1];
    expect(currentCircle!.getAttribute("stroke")).toBe("#c7cdfe");
    // Sanity: the prior point should render stroke="none" so only the
    // current dot has a visible halo.
    expect(circles[0]!.getAttribute("stroke")).toBe("none");
  });
});

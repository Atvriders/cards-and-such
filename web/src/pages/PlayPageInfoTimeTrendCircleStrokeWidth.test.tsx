/**
 * W1603 — PlayPage info popover time-trend chart: the *current* (last)
 * <circle> datapoint is rendered with `stroke-width="1.2"` so its
 * lavender halo is visibly thicker than the SVG default 1px (and prior
 * muted-gray dots which use stroke-width="0"). Existing tests cover:
 *   - the inner <title> child (W1585)
 *   - per-circle `r` (W1591)
 *   - per-circle `fill` (W1593, W1600)
 *   - the current circle's `stroke` color (W1598)
 *   - the trend <path>'s `stroke-width` (W1589)
 * None assert the `stroke-width` attribute on the highlighted current
 * <circle>. Dropping it (or changing the value) would change the
 * visual weight of the current-run halo, breaking the visual contract.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-current-circle-stroke-width-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Current Circle Stroke-Width Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin pinning the current circle's accent stroke-width.",
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

describe("PlayPage info popover time-trend current-circle stroke-width (W1603)", () => {
  it("renders the most-recent <circle> with stroke-width='1.2'", async () => {
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
    // React serializes the `strokeWidth` JSX prop to the DOM
    // `stroke-width` attribute. The last circle is the "current run".
    const currentCircle = circles[circles.length - 1];
    expect(currentCircle.getAttribute("stroke-width")).toBe("1.2");
  });
});

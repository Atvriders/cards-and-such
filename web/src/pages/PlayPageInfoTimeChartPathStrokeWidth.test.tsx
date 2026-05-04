/**
 * W1589 — PlayPage info popover: time-trend SVG path stroke-width.
 *
 * The populated time-trend chart (n >= 2 entries) renders a <path> with
 * `stroke-width="1.5"` so the polyline draws as a 1.5px-wide line rather
 * than the SVG default 1px. Sibling tests cover:
 *   - The path's `d` attribute starts with "M" (timeTrend test).
 *   - The path's `stroke="rgba(148, 163, 184, 0.55)"` (W1583).
 *   - The path's `fill="none"` (W1574).
 *   - The path's `stroke-linejoin="round"` (W1504).
 *   - The path's `stroke-linecap="round"` (W1510).
 * None of them assert `stroke-width="1.5"` on the trend path —
 * dropping it (or changing the value) would change the visual weight of
 * the trendline, breaking the visual contract.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-time-chart-strokewidth-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Time Chart StrokeWidth Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin.",
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

describe("PlayPage info popover time-trend SVG path stroke-width (W1589)", () => {
  it("the populated SVG's trend <path> has stroke-width='1.5'", async () => {
    // Seed two finishes so n >= 2 triggers the populated SVG branch
    // that renders the trend <path>.
    const seed = [
      { ts: 1, time: 20 },
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

    const chart = screen.getByTestId("play-time-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    const path = chart.querySelector("path");
    expect(path).toBeTruthy();
    // React serializes the `strokeWidth` JSX prop to the DOM
    // `stroke-width` attribute.
    expect(path?.getAttribute("stroke-width")).toBe("1.5");
  });
});

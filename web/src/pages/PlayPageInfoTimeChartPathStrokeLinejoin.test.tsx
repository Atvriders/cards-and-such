/**
 * W1504 — PlayPage info popover: time-trend SVG path strokeLinejoin.
 *
 * The populated time-trend chart (n >= 2 entries) renders a <path> with
 * `stroke-linejoin="round"` so the polyline corners between consecutive
 * sample points appear smooth instead of mitered/spiked. Sibling tests
 * cover:
 *   - The path's `d` attribute starts with "M" (timeTrend test).
 *   - The populated SVG's `preserveAspectRatio="none"` (W1500).
 *   - The empty-state placeholder's `play-time-chart-empty` class (W1492).
 *   - The "Time trend" section label class.
 * None of them assert `stroke-linejoin="round"` on the trend path —
 * dropping it (or switching to the SVG default "miter") would produce
 * sharp/spiky joins on steep deltas, breaking the visual contract.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-time-chart-linejoin-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Time Chart Linejoin Fixture",
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

describe("PlayPage info popover time-trend SVG path strokeLinejoin (W1504)", () => {
  it("the populated SVG's trend <path> has stroke-linejoin='round'", async () => {
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
    // React serializes the `strokeLinejoin` JSX prop to the DOM
    // `stroke-linejoin` attribute.
    expect(path?.getAttribute("stroke-linejoin")).toBe("round");
  });
});

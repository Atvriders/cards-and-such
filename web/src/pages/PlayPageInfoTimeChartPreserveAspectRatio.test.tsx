/**
 * W1500 — PlayPage info popover: time-trend SVG preserveAspectRatio.
 *
 * The populated time-trend chart (n >= 2 entries) renders an <svg> with
 * `preserveAspectRatio="none"` so the path stretches edge-to-edge across
 * the popover regardless of the popover's aspect ratio. Sibling tests
 * cover:
 *   - The path's `d` attribute starts with "M" (timeTrend test).
 *   - The empty-state placeholder's `play-time-chart-empty` class
 *     (PlayPageInfoTimeChartEmptyClass test).
 *   - The "Time trend" section label class.
 * None of them assert `preserveAspectRatio="none"` on the populated
 * SVG — switching to the SVG default ("xMidYMid meet") would letterbox
 * the chart and break the visual contract that the line spans the full
 * popover width.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-time-chart-par-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Time Chart PAR Fixture",
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

describe("PlayPage info popover time-trend SVG preserveAspectRatio (W1500)", () => {
  it("the populated SVG (n >= 2) has preserveAspectRatio='none'", async () => {
    // Seed two finishes so n >= 2 triggers the SVG branch.
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
    expect(chart.getAttribute("preserveAspectRatio")).toBe("none");
  });
});

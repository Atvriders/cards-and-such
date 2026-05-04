/**
 * W1583 — PlayPage info popover: time-trend SVG path stroke color.
 *
 * The populated time-trend chart (n >= 2 entries) renders a <path> with
 * `stroke="rgba(148, 163, 184, 0.55)"` — a muted slate tone tuned for the
 * dark popover background. Sibling tests already cover the path's `d`,
 * `fill="none"` (W1574), `stroke-linejoin="round"` (W1504), and
 * `stroke-linecap="round"` (W1510), but NONE of them assert the actual
 * stroke color value. Dropping or changing this attribute would render the
 * polyline in the SVG default black or an off-brand color, breaking the
 * visual contract on the popover.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-time-chart-stroke-color-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Time Chart Stroke Color Fixture",
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

describe("PlayPage info popover time-trend SVG path stroke color (W1583)", () => {
  it("the populated SVG's trend <path> has stroke='rgba(148, 163, 184, 0.55)'", async () => {
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
    expect(path?.getAttribute("stroke")).toBe("rgba(148, 163, 184, 0.55)");
  });
});

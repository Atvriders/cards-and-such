/**
 * W1574 — PlayPage info popover: time-trend SVG path fill="none".
 *
 * The populated time-trend chart (n >= 2 entries) renders a <path> with
 * `fill="none"` so the trend polyline draws as an open stroke instead
 * of the SVG default `fill="black"` which would solid-fill the area
 * beneath the line and obscure the data points. Sibling tests cover:
 *   - stroke-linecap="round" (W1510)
 *   - stroke-linejoin="round" (W1504)
 *   - preserveAspectRatio="none" (W1500)
 *   - aria-label on the SVG (W1497)
 * None of them assert `fill="none"` on the trend path — dropping it
 * (or letting it default to "black") would solid-fill the chart's
 * polyline interior and ruin the line-chart contract.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-time-chart-fillnone-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Time Chart FillNone Fixture",
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

describe("PlayPage info popover time-trend SVG path fill='none' (W1574)", () => {
  it("the populated SVG's trend <path> has fill='none'", async () => {
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
    // React serializes JSX `fill="none"` to the DOM `fill` attribute
    // verbatim. Without it the path would default-fill black and
    // obscure the polyline.
    expect(path?.getAttribute("fill")).toBe("none");
  });
});

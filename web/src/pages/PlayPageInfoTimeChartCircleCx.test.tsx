/**
 * W1613 — PlayPage info popover time-trend chart: each <circle> datapoint
 * exposes an explicit `cx` (x-coordinate) attribute computed from `padX +
 * (i / (n - 1)) * innerW` so the markers align horizontally across the
 * viewBox. The first datapoint pins to the left padding (`cx="6"`) and the
 * last datapoint pins to the right edge of the inner area (`cx="214"`,
 * since `padX=6` plus `innerW = W - padX * 2 = 220 - 12 = 208`).
 *
 * Distinct from sibling coverage: existing tests pin the circle's `r`
 * (W1591), `title` child (W1585), per-circle `fill` (W1593, W1600),
 * `stroke` (W1598), and `stroke-width` (W1603, W1610) — none assert the
 * `cx` placement that anchors each marker horizontally. Dropping or
 * scrambling `cx` would collapse the trend onto a single column,
 * destroying the chart's visual contract even if all stroke/fill props
 * stayed intact.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-time-chart-circle-cx-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Time Chart Circle Cx Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend circle cx attribute test.",
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

describe("PlayPage info popover time-trend circle cx attribute (W1613)", () => {
  it("anchors the first/last <circle> at cx='6' / cx='214' (padX … padX + innerW)", async () => {
    // Two finishes drives n=2, so xAt(0) = padX = 6 and xAt(1) =
    // padX + innerW = 6 + 208 = 214 (with W=220, padX=6, innerW=208).
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
    const circles = chart.querySelectorAll("circle");
    expect(circles.length).toBe(2);

    // First datapoint pins to the left inner edge (padX = 6).
    expect(circles[0]!.getAttribute("cx")).toBe("6");
    // Last datapoint pins to padX + innerW = 6 + 208 = 214.
    expect(circles[1]!.getAttribute("cx")).toBe("214");
  });
});

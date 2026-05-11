/**
 * W1623 — PlayPage info popover time-trend chart: each <circle> datapoint
 * exposes an explicit `cy` (y-coordinate) attribute computed from `padY +
 * innerH - ((t - minT) / range) * innerH` so faster runs sit higher in the
 * viewBox (lower time = higher on screen). With `padY=8`, `H=60`, and
 * `innerH = H - padY * 2 = 44`, the slowest finish pins to the bottom of
 * the inner area (`cy = padY + innerH = 52`) and the fastest finish pins
 * to the top (`cy = padY = 8`).
 *
 * Distinct from sibling coverage: existing tests pin the circle's `cx`
 * (W1613), `r` (W1591), `title` child (W1585), per-circle `fill` (W1593,
 * W1600), `stroke` (W1598), and `stroke-width` (W1603, W1610) — none
 * assert the `cy` placement that anchors each marker vertically.
 * Dropping or scrambling `cy` would collapse the trend onto a single row,
 * destroying the "faster is higher" visual contract even if every other
 * stroke/fill/cx prop stayed intact.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-time-chart-circle-cy-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Time Chart Circle Cy Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend circle cy attribute test.",
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

describe("PlayPage info popover time-trend circle cy attribute (W1623)", () => {
  it("anchors the slowest/fastest <circle> at cy='52' / cy='8' (padY + innerH … padY)", async () => {
    // Two finishes with distinct times → minT=10, maxT=20, range=10.
    // yAt(t) = padY + innerH - ((t - minT) / range) * innerH, with
    // padY=8 and innerH = H - padY*2 = 60 - 16 = 44, so:
    //   yAt(maxT=20) = 8 + 44 - 44 = 8   (top of inner area)
    //   yAt(minT=10) = 8 + 44 - 0  = 52  (bottom of inner area)
    // SVG y grows downward, so the larger cy renders *lower* on screen;
    // the fastest finish (smallest t) ends up at cy=52 and the slowest
    // at cy=8.
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

    // First datapoint (t=20=maxT) → yAt = padY = 8.
    expect(circles[0]!.getAttribute("cy")).toBe("8");
    // Last datapoint (t=10=minT) → yAt = padY + innerH = 52.
    expect(circles[1]!.getAttribute("cy")).toBe("52");
  });
});

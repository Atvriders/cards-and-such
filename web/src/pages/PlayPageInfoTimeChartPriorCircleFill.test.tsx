/**
 * W1600 — PlayPage info popover time-trend chart: every *non-current*
 * (prior) <circle> datapoint is rendered with the muted gray fill
 * "rgba(148, 163, 184, 0.7)" so the historical runs recede visually
 * while the most-recent finish (covered by W1593's accent #a78bfa
 * assertion) stands out. Every other circle attribute that is
 * currently asserted (the inner <title> at W1585, the radius at W1591,
 * the current-run accent fill at W1593, the SVG-level role/aria-label/
 * viewBox/preserveAspectRatio/className, and the path's d/stroke/fill/
 * stroke-linejoin/stroke-linecap/stroke-width) leaves the per-prior-
 * circle `fill` attribute untested. This test pins ONE narrow
 * contract: the prior-run dots use the muted slate fill.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-prior-circle-fill-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Prior Circle Fill Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin pinning the prior circles' muted gray fill color.",
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

describe("PlayPage info popover time-trend prior-circle fill (W1600)", () => {
  it("renders every non-current <circle> with the muted rgba(148, 163, 184, 0.7) fill", async () => {
    // Need >= 2 finishes for the trend chart; use 3 so we have multiple
    // prior dots to assert the fill on.
    const seed = [
      { ts: 1, time: 12 },
      { ts: 2, time: 14 },
      { ts: 3, time: 18 },
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
    // Every non-current (prior) circle must carry the muted slate fill
    // so they recede behind the accent-colored current-run dot.
    for (let i = 0; i < circles.length - 1; i++) {
      expect(circles[i]!.getAttribute("fill")).toBe("rgba(148, 163, 184, 0.7)");
    }
    // Sanity: the current circle should NOT use the muted fill, otherwise
    // there would be no visual highlight at all.
    const currentCircle = circles[circles.length - 1];
    expect(currentCircle!.getAttribute("fill")).not.toBe(
      "rgba(148, 163, 184, 0.7)",
    );
  });
});

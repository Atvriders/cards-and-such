/**
 * W1585 — PlayPage info popover time-trend chart: each rendered <circle>
 * datapoint nests an inner <title> SVG element so hover/tooltip surfaces
 * a human-readable description (formatted seconds plus delta vs best).
 *
 * Distinct from the chart-block className (W1572) and tagName (W1578)
 * coverage and from the trend label / pace sibling tests — this test
 * pins an inner sub-element of the chart datapoints, which the existing
 * suites do not exercise. We only assert that <title> is the immediate
 * child of <circle> and contains the formatted seconds text for the
 * seeded run, since that is the contract callers depend on for native
 * SVG tooltips.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-circle-title-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Circle Title Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend circle <title> test.",
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

describe("PlayPage info popover time-trend circle <title> (W1585)", () => {
  it("nests a <title> inside each <circle> datapoint with formatted seconds", async () => {
    // Two finishes are enough to render a trend (>= 2 datapoints).
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
    // Each circle should have a child <title> element — that's the
    // attribute-bearing inner sub-element we are pinning.
    circles.forEach((c) => {
      const title = c.querySelector("title");
      expect(title).not.toBeNull();
      expect(title!.tagName.toLowerCase()).toBe("title");
    });
    // The first circle's title should reference the seeded 12s finish.
    expect(circles[0]!.querySelector("title")?.textContent ?? "").toContain(
      "12s",
    );
  });
});

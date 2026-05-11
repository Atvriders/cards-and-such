/**
 * W1593 — PlayPage info popover time-trend chart: the *current* (last)
 * <circle> datapoint is rendered with the accent fill color "#a78bfa"
 * so the most-recent finish stands out from the muted gray of prior
 * runs. Every other circle attribute that is currently asserted (the
 * inner <title> at W1585, the SVG-level role/aria-label/viewBox/
 * preserveAspectRatio/className, and the path's d/stroke/fill/
 * stroke-linejoin/stroke-linecap/stroke-width) leaves the per-circle
 * `fill` attribute untested. This test pins ONE narrow contract:
 * the highlighted current-run dot uses the accent purple fill.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-current-circle-fill-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Current Circle Fill Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin pinning the current circle's accent fill color.",
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

describe("PlayPage info popover time-trend current-circle fill (W1593)", () => {
  it("renders the most-recent <circle> with the accent #a78bfa fill", async () => {
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
    // The last circle is the "current run" — it must carry the accent
    // purple fill so it visibly differs from prior muted-gray dots.
    const currentCircle = circles[circles.length - 1];
    expect(currentCircle!.getAttribute("fill")).toBe("#a78bfa");
    // Sanity: the prior point should NOT use the accent color, otherwise
    // there would be no visual highlight at all.
    expect(circles[0]!.getAttribute("fill")).not.toBe("#a78bfa");
  });
});

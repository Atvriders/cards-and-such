/**
 * W1516 — PlayPage info popover: populated time-trend SVG `role="img"`.
 *
 * The populated time-trend chart (n >= 2 entries) renders an <svg> with
 * `role="img"` so assistive technology treats the chart as a single
 * graphical unit paired with its `aria-label` rather than walking the
 * inner <path>/<circle>/<title> children. Sibling tests cover:
 *   - The empty-state placeholder's `play-time-chart-empty` class
 *     (W1492).
 *   - The populated SVG's `preserveAspectRatio="none"` (W1500).
 *   - The path's `stroke-linejoin="round"` (W1504).
 *   - The path's `stroke-linecap="round"` (W1510).
 * None of them assert `role="img"` on the populated SVG. Drop or
 * mistype the role and screen readers either announce the chart as a
 * generic group or recurse into the decorative inner geometry, breaking
 * the labelled-image contract.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-time-chart-role-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Time Chart Role Fixture",
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

describe("PlayPage info popover time-trend SVG role (W1516)", () => {
  it("the populated SVG (n >= 2) carries role='img'", async () => {
    // Seed two finishes so n >= 2 triggers the populated SVG branch.
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
    expect(chart.getAttribute("role")).toBe("img");
  });
});

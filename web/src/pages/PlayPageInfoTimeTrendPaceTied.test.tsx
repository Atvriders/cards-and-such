/**
 * W1547 — PlayPage info popover time-trend pace caption: `data-pace="tied"`
 * branch when the latest run rounds to exactly the prior personal best.
 *
 * Mirrors the W1538 "faster" coverage but exercises the middle of the
 * three-state classification — when `Math.round(lastDelta) === 0` the
 * caption tags itself with `data-pace="tied"` so styling/tooling can
 * neutralize the green/amber tone. Seeding identical times forces this
 * exact branch without any reducer involvement.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-pace-tied-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Pace Tied Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend pace tied test.",
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

describe("PlayPage info popover time-trend pace caption tied (W1547)", () => {
  it("exposes data-pace='tied' when latest run matches the prior best", async () => {
    // Seed two identical finishes — lastDelta rounds to 0 -> "tied".
    const seed = [
      { ts: 1, time: 20 },
      { ts: 2, time: 20 },
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

    const pace = screen.getByTestId("play-time-pace");
    expect(pace.getAttribute("data-pace")).toBe("tied");
  });
});

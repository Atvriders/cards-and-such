/**
 * W1528 — PlayPage info popover: time-trend SVG viewBox.
 *
 * The populated time-trend chart (n >= 2 entries) renders an <svg> with
 * `viewBox="0 0 220 60"` derived from the W=220, H=60 module-local
 * constants. Sibling tests cover the populated SVG's preserveAspectRatio
 * (W1500), path stroke-linejoin (W1504), stroke-linecap (W1510),
 * role="img" (W1516), aria-label (W1521), and the empty-state class
 * (W1492) — but none assert the viewBox value, which anchors the
 * coordinate space all path/circle math depends on. Changing W or H
 * without updating the viewBox would silently distort the trend line.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-time-chart-viewbox-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Time Chart ViewBox Fixture",
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

describe("PlayPage info popover time-trend SVG viewBox (W1528)", () => {
  it("the populated SVG (n >= 2) has viewBox='0 0 220 60'", async () => {
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
    expect(chart.getAttribute("viewBox")).toBe("0 0 220 60");
  });
});

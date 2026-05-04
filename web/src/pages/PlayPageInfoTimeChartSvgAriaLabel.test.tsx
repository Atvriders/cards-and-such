/**
 * W1521 — PlayPage info popover: populated time-trend SVG `aria-label`.
 *
 * The populated time-trend chart (n >= 2 entries) renders an <svg> with
 * `aria-label={`Time trend over last ${n} plays`}` so assistive
 * technology announces the chart with both its purpose and the size of
 * its sample window. Paired with `role="img"` (W1516) the label is the
 * sole accessible name source — drop it or change the wording and the
 * chart degenerates into an unnamed <svg>.
 *
 * Sibling tests already cover:
 *   - Empty-state placeholder's `play-time-chart-empty` class (W1492).
 *   - Populated SVG's `preserveAspectRatio="none"` (W1500).
 *   - Path's `stroke-linejoin="round"` (W1504).
 *   - Path's `stroke-linecap="round"` (W1510).
 *   - Populated SVG's `role="img"` (W1516).
 * None of them assert the SVG's accessible name, so this test seals
 * that gap with a single focused expectation including the dynamic
 * play-count substring.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-time-chart-aria-label-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Time Chart Aria Label Fixture",
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

describe("PlayPage info popover time-trend SVG aria-label (W1521)", () => {
  it("the populated SVG (n >= 2) carries aria-label='Time trend over last <n> plays'", async () => {
    // Seed three finishes so n=3 lets us assert the dynamic count too.
    const seed = [
      { ts: 1, time: 30 },
      { ts: 2, time: 20 },
      { ts: 3, time: 10 },
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
    expect(chart.getAttribute("aria-label")).toBe(
      "Time trend over last 3 plays",
    );
  });
});

void React;

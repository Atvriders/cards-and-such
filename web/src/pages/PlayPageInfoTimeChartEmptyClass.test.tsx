/**
 * W1492 — PlayPage info popover: time-trend empty-state CSS class.
 *
 * When the time-history is empty (n < 2), TimeTrendChart renders a div
 * with className="play-time-chart-empty" instead of an <svg>. Sibling
 * tests cover:
 *   - The empty copy text "Play more to see your trend" (timeTrend test).
 *   - The aria-label "Time trend chart" on the empty placeholder.
 *   - The "Time trend" label class on the wrapping section.
 * None of them assert the literal `play-time-chart-empty` class on the
 * empty-state placeholder — that class is the CSS contract that styles
 * the centered "Play more..." block, distinct from the SVG-branch
 * `play-time-chart` class. A regression that renamed or dropped this
 * class would silently strip the empty-state styling.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "info-time-chart-empty-class-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Info Time Chart Empty Class Fixture",
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

describe("PlayPage info popover time-trend empty-state class (W1492)", () => {
  it("the empty-state placeholder carries the literal 'play-time-chart-empty' class", async () => {
    // No history seeded → n === 0 → empty branch renders the placeholder.
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
    // The empty branch renders a <div>, not an <svg>.
    expect(chart.tagName.toLowerCase()).toBe("div");
    expect(chart.classList.contains("play-time-chart-empty")).toBe(true);
  });
});

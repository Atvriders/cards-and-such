/**
 * Unit tests for the PlayPage time-trend chart inside the session info
 * popover (W571 / W204).
 *
 * Two observable states of the chart, both reachable purely by seeding
 * `cards-time-history:<gameId>` in localStorage before mounting — the
 * `timeHistory` state is initialized from `readTimeHistory()` so the
 * chart picks up the seed without needing to start a game:
 *
 *   1. Empty state (no seeded entries): the chart renders the
 *      "Play more to see your trend" copy.
 *   2. Seeded state (3 entries): the chart renders an SVG line (path)
 *      and the Best / Avg / Plays summary line.
 *
 * The `vi.hoisted` block builds a minimal fixture plugin that satisfies
 * the registry shape PlayPage consumes, so neither the real game
 * catalogue nor any reducer side effects need to participate.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. vi.hoisted runs before the vi.mock factory is
// evaluated, so the closure capture is safe even though it visually looks
// like a TDZ violation.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend chart tests.",
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

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free even though we never reach the win banner.
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

async function mountAndOpenInfo(): Promise<void> {
  const { default: PlayPage } = await import("./PlayPage.js");
  render(
    <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
      <Routes>
        <Route path="/play/:gameId" element={<PlayPage />} />
      </Routes>
    </MemoryRouter>,
  );
  // The info button lives in the page header and is rendered in every
  // phase — no need to start the game to reach the popover.
  fireEvent.click(screen.getByTestId("play-info-btn"));
}

describe("PlayPage time-trend chart (W204)", () => {
  it("shows the 'Play more to see your trend' empty state when history is empty", async () => {
    // No `cards-time-history:<gameId>` key seeded — readTimeHistory() returns [].
    await mountAndOpenInfo();

    const chart = screen.getByTestId("play-time-chart");
    expect(chart).toBeTruthy();
    expect(chart.textContent).toContain("Play more to see your trend");
    // With zero entries the empty branch renders a div, not an <svg>.
    expect(chart.tagName.toLowerCase()).not.toBe("svg");
    // And the stats line is suppressed when n === 0.
    expect(screen.queryByTestId("play-time-stats-line")).toBeNull();
  });

  it("renders the SVG line plus Best/Avg/Plays labels with seeded history", async () => {
    // Seed three finishes so n >= 2 triggers the SVG branch. Best=10s,
    // Avg=20s, Plays=3 — pinned to round numbers so the assertions
    // don't rely on floating-point formatting.
    const seed = [
      { ts: 1, time: 30 },
      { ts: 2, time: 20 },
      { ts: 3, time: 10 },
    ];
    localStorage.setItem(
      `cards-time-history:${hoisted.TEST_GAME_ID}`,
      JSON.stringify(seed),
    );

    await mountAndOpenInfo();

    const chart = screen.getByTestId("play-time-chart");
    expect(chart.tagName.toLowerCase()).toBe("svg");
    // The trend line is a <path> with a populated `d` attribute.
    const path = chart.querySelector("path");
    expect(path).toBeTruthy();
    expect(path?.getAttribute("d") ?? "").toMatch(/^M/);

    // Stats line surfaces the Best / Avg / Plays labels and matching
    // values (10s / 20s / 3) for the seeded slice.
    const stats = screen.getByTestId("play-time-stats-line");
    expect(stats.textContent).toContain("Best:");
    expect(stats.textContent).toContain("Avg:");
    expect(stats.textContent).toContain("Plays:");
    expect(stats.textContent).toContain("10s");
    expect(stats.textContent).toContain("20s");
    expect(stats.textContent).toContain("3");
  });
});

/**
 * W1632 — PlayPage info popover time-trend stats-line token order.
 *
 * The TimeTrendChart renders "Best: … | Avg: … | Plays: …" beneath the
 * SVG plot. Sibling tests pin the host's className (W1620) and tagName
 * (W1626), and PlayPage.timeTrend.test.tsx asserts each of "Best:",
 * "Avg:", "Plays:" appears via `toContain`, but no test pins their
 * relative order in the rendered textContent. A silent reshuffle (e.g.
 * "Plays: … | Best: … | Avg: …") would still satisfy every existing
 * assertion while changing the user-visible reading order of the
 * summary line.
 *
 * Like the sibling time-trend tests we seed `cards-time-history:<gameId>`
 * directly so the popover surfaces the populated chart branch without
 * playing a real game.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-stats-line-token-order-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Stats Line Token Order Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend stats-line token order test.",
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

describe("PlayPage info popover time-trend stats-line token order (W1632)", () => {
  it("renders 'Best:' before 'Avg:' before 'Plays:' in textContent", async () => {
    // Seed two finishes so the populated chart branch renders.
    const seed = [
      { ts: 1, time: 10 },
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

    const stats = screen.getByTestId("play-time-stats-line");
    const text = stats.textContent ?? "";
    const bestIdx = text.indexOf("Best:");
    const avgIdx = text.indexOf("Avg:");
    const playsIdx = text.indexOf("Plays:");
    // Sanity: each token must actually be present.
    expect(bestIdx).toBeGreaterThanOrEqual(0);
    expect(avgIdx).toBeGreaterThanOrEqual(0);
    expect(playsIdx).toBeGreaterThanOrEqual(0);
    // Order: Best -> Avg -> Plays.
    expect(bestIdx).toBeLessThan(avgIdx);
    expect(avgIdx).toBeLessThan(playsIdx);
  });
});

void React;

/**
 * W1639 — PlayPage info popover time-trend stats-line separator count.
 *
 * The TimeTrendChart renders "Best: … | Avg: … | Plays: …" beneath the
 * SVG plot. Sibling tests pin the host's className (W1620), tagName
 * (W1626), and token order (W1632), and PlayPage.timeTrend.test.tsx
 * asserts each of "Best:", "Avg:", "Plays:" and their values appear via
 * `toContain`, but no test pins the literal " | " separator count.
 *
 * Three tokens joined by two " | " separators is the canonical visual
 * shape — a refactor that swapped " | " for ", " or " · " (or dropped a
 * separator entirely by joining only two stats) would still satisfy the
 * order, token, and class assertions while breaking the readable layout.
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
  const TEST_GAME_ID = "time-trend-stats-line-separator-count-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Stats Line Separator Count Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend stats-line separator count test.",
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

describe("PlayPage info popover time-trend stats-line separator count (W1639)", () => {
  it("renders exactly two ' | ' separators between the three stat tokens", async () => {
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
    // `String#split` on a 3-token "a | b | c" string yields 3 segments,
    // i.e. exactly 2 separators between them.
    const segments = text.split(" | ");
    expect(segments.length).toBe(3);
  });
});

void React;

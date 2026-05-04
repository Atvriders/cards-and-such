/**
 * W1555 — PlayPage info popover time-trend pace caption: `aria-label`.
 *
 * The pace caption ([data-testid="play-time-pace"]) carries an
 * `aria-label` of the form `Latest run ${formatDelta(lastDelta)} vs
 * personal best`. Existing W1538/W1547/W1551 tests pin only the
 * `data-pace` data attribute for the three tones (faster/tied/slower);
 * none assert the screen-reader-facing aria-label that re-phrases the
 * caption for assistive tech ("Latest run …" instead of the visual
 * "Latest: …"). This test fills that gap by seeding two finishes and
 * checking the exact aria-label string for the slower branch.
 *
 * Like the sibling time-trend tests we seed `cards-time-history:<gameId>`
 * directly so the popover surfaces the chart without playing a real game.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-pace-arialabel-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Pace AriaLabel Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend pace aria-label test.",
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

describe("PlayPage info popover time-trend pace caption aria-label (W1555)", () => {
  it("phrases the caption for screen readers via aria-label", async () => {
    // Seed two finishes where the latest (30s) is slower than the prior
    // best (10s) — lastDelta = +20s. The aria-label should read
    // "Latest run +20s slower vs personal best".
    const seed = [
      { ts: 1, time: 10 },
      { ts: 2, time: 30 },
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
    expect(pace.getAttribute("aria-label")).toBe(
      "Latest run +20s slower vs personal best",
    );
  });
});

void React;

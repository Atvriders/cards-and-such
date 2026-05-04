/**
 * W1566 — PlayPage info popover time-trend pace caption: tagName.
 *
 * The pace caption ([data-testid="play-time-pace"]) renders as a block-
 * level `<div>` (not `<p>`, `<span>`, or `<output>`). Sibling tests pin
 * the className (W1485), data-pace tones (W1538/W1547/W1551), aria-label
 * (W1555), and visible text (W1560) — none of them assert the element's
 * tagName. Pinning the tag prevents an accidental swap to a paragraph or
 * inline element which would change block-flow layout and break the
 * surrounding popover styling.
 *
 * Like the sibling time-trend tests we seed `cards-time-history:<gameId>`
 * directly so the popover surfaces the pace caption without playing a
 * real game.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-pace-tagname-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Pace TagName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend pace tagName test.",
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

describe("PlayPage info popover time-trend pace caption tagName (W1566)", () => {
  it("renders the pace caption as a <div> element", async () => {
    // Seed two finishes so lastDelta is defined and the pace caption
    // actually renders. Tone is irrelevant — the tagName is invariant
    // across faster/tied/slower branches.
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
    expect(pace.tagName).toBe("DIV");
  });
});

void React;

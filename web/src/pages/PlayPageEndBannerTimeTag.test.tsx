/**
 * Unit test for the PlayPage end-banner end-stats-time element tag (W1376).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2698) renders
 *   the elapsed-time readout as `<dd data-testid="end-stats-time">{formatTime(elapsed)}</dd>`
 *   inside the `<dl class="end-stats">` definition list. Sibling tests cover
 *   the value (W809), best-row presence (W814), structural grouping under
 *   `.end-stats` (W?), and the loss-path readout (W872) — but none pin the
 *   *tag name* of the end-stats-time node itself. A regression that swapped
 *   the `<dd>` for a `<span>`, `<div>`, or `<p>` would break the dt/dd
 *   semantic pairing (and the definition-list typography in `PlayPage.css`)
 *   while every adjacent testid-based assertion continued to pass, because
 *   the visible text and the data-testid attribute would both still match.
 *
 * Strategy:
 *   Reuse the hoisted win-fixture from W809 (PlayPage.endStatsTime.test.tsx)
 *   so a single dispatcher click drives PlayPage to terminal-win. After the
 *   win banner mounts, query the `end-stats-time` node and assert its
 *   `tagName` is "DD". This is the *one* attribute this test covers — value,
 *   visibility, and structural grouping are pinned elsewhere.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-banner-time-tag-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Banner Time Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-banner end-stats-time tag test.",
    settings: {} as Record<string, never>,
    initialState: (): S => ({ moves: 0 }),
    reducer: (s: S, _a: Action): S => ({ moves: s.moves + 1 }),
    isTerminal: (s: S): { score: number } | null =>
      s.moves >= 1 ? { score: 1 } : null,
    component: ({ dispatch }: { dispatch: (a: Action) => void }) => (
      <div>
        <button
          data-testid="fx-win"
          type="button"
          onClick={() => dispatch({ type: "win-now" })}
        >
          win
        </button>
      </div>
    ),
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
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlayPage end-banner end-stats-time tag (W1376)", () => {
  it("renders the elapsed-time readout as a <dd> element", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter
        initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1&quickstart=1`]}
      >
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("fx-win"));
    });

    const endStatsTime = screen.getByTestId("end-stats-time");
    // The readout must be a <dd> so it pairs with the preceding <dt> for
    // dt/dd semantics and the `.end-stats` definition-list typography.
    expect(endStatsTime.tagName).toBe("DD");
  });
});

void React;

/**
 * W1650 — PlayPage info popover time-trend stats-line "Best:" numeric
 * format (rounded integer seconds with an "s" suffix).
 *
 * The TimeTrendChart stats-line renders three tokens:
 *   "Best: <secs>s | Avg: <secs>s | Plays: <n>"
 * where Best/Avg run through `formatSecs(s) = Math.round(s) + "s"`.
 *
 * Sibling tests pin the host's className (W1620), tagName (W1626), token
 * order (W1632), separator count (W1639), and the Plays integer format
 * (W1646). PlayPage.timeTrend.test.tsx asserts the stats line contains
 * the substring "Best:" plus "10s"/"20s" but never pins "Best:" to its
 * adjacent numeric value, nor the rounded-integer + "s" format of that
 * value. A regression that swapped `formatSecs(best)` to `best.toFixed(2)`
 * would still satisfy the loose "10s" substring check (because "20s"
 * appears elsewhere in the line) but render "Best: 10.00 | …", silently
 * corrupting the user-visible format.
 *
 * This test seeds `cards-time-history:<gameId>` directly so the popover
 * surfaces the populated chart branch without playing a real game,
 * matching the sibling time-trend tests including W1646.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-stats-line-best-format-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Stats Line Best Format Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend stats-line best-format test.",
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

describe("PlayPage info popover time-trend stats-line best format (W1650)", () => {
  it("renders 'Best: <integer>s' with rounded seconds and the 's' suffix", async () => {
    // Seed three finishes so n >= 2 triggers the populated chart branch.
    // Use a fractional minimum (12.4) that rounds down to 12 so we can
    // distinguish `Math.round` formatting from `toFixed(1)`/`toString()`
    // regressions. Pick values that give a unique Best digit-string ("12")
    // not appearing elsewhere in the stats line — Avg = (12.4+30+50)/3
    // ≈ 30.8 → rounds to "31s", Plays = "3", so "12" only ever appears
    // attached to "Best:".
    const seed = [
      { ts: 1, time: 12.4 },
      { ts: 2, time: 30 },
      { ts: 3, time: 50 },
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

    // The stats line begins with `Best: 12s`. Pin the value's exact
    // format: literal "Best:", a single space, a digit string, and a
    // trailing "s" before the separator/whitespace. A regression that
    // dropped the rounding (e.g. "Best: 12.4s") or the suffix (e.g.
    // "Best: 12 |") or wrapped in another unit ("Best: 12sec") would
    // (correctly) fail this test.
    expect(text).toMatch(/Best: 12s(?!\d)/);
    // Belt-and-braces: explicitly forbid a decimal Best value.
    expect(text).not.toMatch(/Best: \d+\.\d+s/);
    // And forbid a unit-less Best value: "s" must immediately follow the
    // digits before any whitespace or separator.
    expect(text).not.toMatch(/Best: \d+\s*\|/);
  });
});

void React;

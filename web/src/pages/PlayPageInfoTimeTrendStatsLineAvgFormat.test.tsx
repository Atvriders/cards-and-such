/**
 * W1657 — PlayPage info popover time-trend stats-line "Avg:" numeric
 * format (rounded integer seconds with an "s" suffix).
 *
 * The TimeTrendChart stats-line renders three tokens:
 *   "Best: <secs>s | Avg: <secs>s | Plays: <n>"
 * where Best/Avg run through `formatSecs(s) = Math.round(s) + "s"`.
 *
 * Sibling tests pin the host's className (W1620), tagName (W1626), token
 * order (W1632), separator count (W1639), the Plays integer format
 * (W1646), and the Best rounded-seconds format (W1650). PlayPage.timeTrend
 * .test.tsx asserts the stats line contains the substring "Avg:" but never
 * pins "Avg:" to its adjacent numeric value, nor the rounded-integer + "s"
 * format of that value. A regression that swapped `formatSecs(avg)` to
 * `avg.toFixed(2)` would still satisfy the loose "Avg:" substring check
 * but render "Avg: 30.80 | …", silently corrupting the user-visible
 * format.
 *
 * This test seeds `cards-time-history:<gameId>` directly so the popover
 * surfaces the populated chart branch without playing a real game,
 * matching the sibling time-trend tests including W1650.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-stats-line-avg-format-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Stats Line Avg Format Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend stats-line avg-format test.",
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

describe("PlayPage info popover time-trend stats-line avg format (W1657)", () => {
  it("renders 'Avg: <integer>s' with rounded seconds and the 's' suffix", async () => {
    // Seed three finishes so n >= 2 triggers the populated chart branch.
    // Pick values whose mean is fractional (12.4 + 30 + 50) / 3 ≈ 30.8
    // so we can distinguish `Math.round` formatting (→ "31s") from
    // `toFixed(1)` ("30.8s") or `toString()` ("30.8s") regressions.
    // The Avg digit-string "31" is unique in this stats line — Best
    // rounds to "12s" and Plays = "3", so "31" only ever appears
    // attached to "Avg:".
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

    // The middle stats token is `Avg: 31s`. Pin the value's exact
    // format: literal "Avg:", a single space, a digit string, and a
    // trailing "s" before the separator/whitespace. A regression that
    // dropped the rounding (e.g. "Avg: 30.8s") or the suffix (e.g.
    // "Avg: 31 |") or wrapped in another unit ("Avg: 31sec") would
    // (correctly) fail this test.
    expect(text).toMatch(/Avg: 31s(?!\d)/);
    // Belt-and-braces: explicitly forbid a decimal Avg value.
    expect(text).not.toMatch(/Avg: \d+\.\d+s/);
    // And forbid a unit-less Avg value: "s" must immediately follow the
    // digits before any whitespace or separator.
    expect(text).not.toMatch(/Avg: \d+\s*\|/);
  });
});

void React;

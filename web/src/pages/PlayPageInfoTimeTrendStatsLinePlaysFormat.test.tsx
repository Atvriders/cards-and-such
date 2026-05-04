/**
 * W1646 — PlayPage info popover time-trend stats-line "Plays:" numeric
 * format (integer count, no "s" suffix).
 *
 * The TimeTrendChart stats-line renders three tokens:
 *   "Best: <secs>s | Avg: <secs>s | Plays: <n>"
 * where Best/Avg run through `formatSecs(s) = Math.round(s) + "s"` but
 * `Plays: {n}` is the raw integer history length with NO "s" suffix.
 *
 * Sibling tests pin the host's className (W1620), tagName (W1626), token
 * order (W1632), and separator count (W1639). PlayPage.timeTrend.test.tsx
 * asserts the stats line contains the substring "3" and the substrings
 * "10s" / "20s", but nothing pins the *adjacency* of "Plays:" with its
 * numeric value or the absence of an "s" suffix on that count. A
 * regression that swapped `Plays: {n}` to `Plays: {formatSecs(n)}` (which
 * would render "Plays: 3s") or that wrote `Plays: ${n}x` would still
 * satisfy the existing `toContain("3")` assertion while corrupting the
 * count's user-visible format.
 *
 * This test seeds `cards-time-history:<gameId>` directly so the popover
 * surfaces the populated chart branch without playing a real game,
 * matching the sibling time-trend tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "time-trend-stats-line-plays-format-fixture";
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Time Trend Stats Line Plays Format Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for time-trend stats-line plays-format test.",
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

describe("PlayPage info popover time-trend stats-line plays format (W1646)", () => {
  it("renders 'Plays: <integer>' with a single space and no 's' suffix", async () => {
    // Seed exactly four finishes so the populated chart branch renders
    // and the Plays count is a known integer (4) distinct from any of
    // the seeded time values (10/20/30/40 seconds → "10s"/"20s"/...).
    const seed = [
      { ts: 1, time: 10 },
      { ts: 2, time: 20 },
      { ts: 3, time: 30 },
      { ts: 4, time: 40 },
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

    // The full stats line ends with `Plays: 4`. We pin the count's
    // exact format: literal "Plays:", a single space, an integer of
    // one or more digits, and the line terminator. Crucially, we
    // assert via a negated check that no "s" follows the digits — a
    // regression that wrapped `n` in `formatSecs` would produce
    // "Plays: 4s" and would (correctly) fail this test.
    expect(text).toMatch(/Plays: 4(?!\d)/);
    // Belt-and-braces: explicitly forbid "Plays: 4s" / "Plays: 4 s".
    expect(text).not.toMatch(/Plays: 4\s*s\b/);
    // And make sure the count isn't suffixed with anything non-digit /
    // non-whitespace (e.g. "Plays: 4x"): the token must end the line
    // or be followed only by trailing whitespace.
    expect(text).toMatch(/Plays: 4\s*$/);
  });
});

void React;

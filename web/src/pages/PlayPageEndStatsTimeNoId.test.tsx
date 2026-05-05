/**
 * Unit test for the PlayPage end-banner end-stats *time* dd `id` absence (W2057).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2698)
 *   renders the time value as
 *     `<dd data-testid="end-stats-time">{formatTime(elapsed)}</dd>`
 *   inside the `<dl class="end-stats">` definition list. The dd is
 *   identified ONLY by its `data-testid` — it has no `id` attribute.
 *   Sibling tests pin the dd's tagName (W1376), the dt label's tagName
 *   (W1398), the value text content, and the row's structural shape,
 *   but none of them assert that the dd carries no `id`. A regression
 *   that added an `id` to the dd (for example, an ARIA-labelling
 *   refactor that wired `<dt id="time-label">` to `<dd id="time-value">`)
 *   would silently introduce a globally-visible DOM id collision risk
 *   (multiple PlayPage routes can momentarily co-exist during route
 *   transitions) and would change the document.getElementById surface
 *   without any failing test. The current implementation deliberately
 *   keeps the dd id-less, leaving `data-testid` as the sole hook.
 *
 * Strategy:
 *   Reuse the hoisted win-fixture pattern from W1398 so a single
 *   dispatcher click drives PlayPage to terminal-win. After the win
 *   banner mounts, query the `end-stats-time` dd and assert that
 *   `dd.hasAttribute("id") === false`. This pins the one uncovered
 *   attribute — the absence of an `id` on the time value dd — without
 *   re-asserting tagName, value, or grouping that sibling tests cover.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-time-no-id-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Time No Id Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-banner end-stats time no-id test.",
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
  vi.restoreAllMocks();
});

describe("PlayPage end-banner end-stats time dd no id (W2057)", () => {
  it("does not set an id attribute on the end-stats-time dd", async () => {
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

    // The end-stats-time dd is identified by data-testid only. Pinning
    // the absence of an `id` attribute guards against a future refactor
    // that would add an id (e.g. for aria-labelledby wiring) without a
    // test reflecting the new contract.
    const dd = screen.getByTestId("end-stats-time");
    expect(dd.hasAttribute("id")).toBe(false);
  });
});

void React;

/**
 * Unit test for the PlayPage end-banner end-stats *time* dd `tabindex`
 * absence (W2305).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2698)
 *   renders the time value as
 *     `<dd data-testid="end-stats-time">{formatTime(elapsed)}</dd>`
 *   inside the `<dl class="end-stats">` definition list. The dd carries
 *   only a `data-testid` attribute — no `tabindex` is applied. The dd
 *   is a non-interactive value cell whose content is read out as part
 *   of the end-banner's accessible name; it should not participate in
 *   keyboard tab navigation. Sibling tests pin the dd's tagName
 *   (W1376), the absence of an `id` (W2057), the absence of an inline
 *   `style` (W2178), the dt label's tagName (W1398), the value text
 *   content, and the row's structural shape, but none of them assert
 *   that the dd carries no `tabindex` attribute. A regression that
 *   added e.g. `tabIndex={0}` would silently inject the value cell
 *   into the focus order without any failing test.
 *
 * Strategy:
 *   Reuse the hoisted win-fixture pattern from W2178 so a single
 *   dispatcher click drives PlayPage to terminal-win. After the win
 *   banner mounts, query the `end-stats-time` dd and assert that
 *   `dd.hasAttribute("tabindex") === false`. This pins the one
 *   uncovered attribute — the absence of a `tabindex` on the time
 *   value dd — without re-asserting tagName, id-absence, style-absence,
 *   value, or grouping that sibling tests cover.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-time-no-tabindex-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Time No Tabindex Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-banner end-stats time no-tabindex test.",
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

describe("PlayPage end-banner end-stats time dd no tabindex (W2305)", () => {
  it("does not set a tabindex attribute on the end-stats-time dd", async () => {
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

    // The end-stats-time dd is a non-interactive value cell whose
    // content participates in the end-banner's accessible name. Pinning
    // the absence of a `tabindex` attribute guards against a future
    // regression that would inject the dd into the keyboard focus order.
    const dd = screen.getByTestId("end-stats-time");
    expect(dd.hasAttribute("tabindex")).toBe(false);
  });
});

void React;

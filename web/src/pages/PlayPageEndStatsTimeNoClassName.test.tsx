/**
 * Unit test for the PlayPage end-banner end-stats *time* dd `class` absence (W2403).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2698)
 *   renders the time value as
 *     `<dd data-testid="end-stats-time">{formatTime(elapsed)}</dd>`
 *   inside the `<dl class="end-stats">` definition list. The dd has
 *   NO `class` attribute — all visual styling is delegated to descendant
 *   selectors on the parent `.end-stats` / `.end-stats-row` containers
 *   (and to the dd's tag selector). Sibling tests pin the dd's tagName
 *   (W1376), the absence of an `id` (W2057), the absence of `tabindex`,
 *   the absence of inline `style`, the dt label's tagName (W1398), and
 *   the value text content (W809/W872), but none of them assert that the
 *   dd carries no `class` attribute. A regression that added a
 *   `className` to the dd (for example, a refactor that introduced
 *   `<dd className="end-stats-time-value">…</dd>` for value-specific
 *   styling) would change the CSS-class surface that downstream theme
 *   stylesheets and end-to-end selectors rely on, with no failing test.
 *   The current implementation deliberately keeps the dd className-less,
 *   leaving `data-testid` as the sole hook.
 *
 * Strategy:
 *   Reuse the hoisted win-fixture pattern from W2057 so a single
 *   dispatcher click drives PlayPage to terminal-win. After the win
 *   banner mounts, query the `end-stats-time` dd and assert that
 *   `dd.hasAttribute("class") === false`. This pins the one uncovered
 *   attribute — the absence of a `class` attribute on the time value dd —
 *   without re-asserting tagName, id-absence, tabindex-absence, style-
 *   absence, value, or grouping that sibling tests cover.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-time-no-classname-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Time No ClassName Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-banner end-stats time no-className test.",
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

describe("PlayPage end-banner end-stats time dd no className (W2403)", () => {
  it("does not set a class attribute on the end-stats-time dd", async () => {
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

    // The end-stats-time dd delegates all visual styling to descendant
    // selectors on the parent `.end-stats` / `.end-stats-row` containers
    // and to the dd's tag selector. Pinning the absence of a `class`
    // attribute guards against a future refactor that would add a
    // value-specific className without a test reflecting the new
    // CSS-class contract.
    const dd = screen.getByTestId("end-stats-time");
    expect(dd.hasAttribute("class")).toBe(false);
  });
});

void React;

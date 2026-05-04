/**
 * Unit test for the PlayPage end-banner end-stats-best element tag (W1384).
 *
 * Observable behavior:
 *   When the game reaches a terminal-win, PlayPage.tsx (~line 2703) renders
 *   the personal-best readout as `<dd data-testid="end-stats-best">…</dd>`
 *   inside the `<dl class="end-stats">` definition list. Sibling W1376
 *   (PlayPageEndBannerTimeTag) pins the *time* dd's tagName and W845
 *   (endStatsBest) pins the visible text/value, but no test pins the *tag
 *   name* of the end-stats-best node itself. A regression that swapped the
 *   `<dd>` for a `<span>`, `<div>`, or `<p>` would break the dt/dd semantic
 *   pairing (and the definition-list typography in `PlayPage.css`) while
 *   every adjacent testid-based assertion continued to pass, because the
 *   visible text and the data-testid attribute would both still match.
 *
 * Strategy:
 *   Reuse the hoisted win-fixture pattern from W1376 so a single dispatcher
 *   click drives PlayPage to terminal-win. After the win banner mounts, query
 *   the `end-stats-best` node and assert its `tagName` is "DD". This is the
 *   *one* attribute this test covers — value, visibility, and structural
 *   grouping are pinned elsewhere.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "end-stats-best-tag-fixture";
  type S = { moves: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "End Stats Best Tag Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the end-banner end-stats-best tag test.",
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

describe("PlayPage end-banner end-stats-best tag (W1384)", () => {
  it("renders the personal-best readout as a <dd> element", async () => {
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

    const endStatsBest = screen.getByTestId("end-stats-best");
    // The readout must be a <dd> so it pairs with the preceding <dt> for
    // dt/dd semantics and the `.end-stats` definition-list typography.
    expect(endStatsBest.tagName).toBe("DD");
  });
});

void React;
